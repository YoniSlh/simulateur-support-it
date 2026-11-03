/* DeskSim — moteur : état, tickets, actions, notation, sauvegarde */
(function () {
  DS.scenarios = [];
  DS.byId = {};
  DS.addScenario = function (s) {
    s.type = Array.isArray(s.type) ? s.type : [s.type];
    s.ci = s.ci || (DS.users[s.req] && DS.users[s.req].asset);
    s.qs = s.qs || []; s.acts = s.acts || []; s.checks = s.checks || []; s.pen = s.pen || []; s.hints = s.hints || [];
    DS.scenarios.push(s); DS.byId[s.id] = s;
  };

  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  DS.norm = norm;

  /* ---------- Questions et actions génériques ---------- */
  const GQ = [
    { id: 'g_identity', cat: 'Procédure', q: 'Pour votre sécurité, pouvez-vous me donner votre matricule ?', au: u => 'Bien sûr : ' + u.empId + '.', identity: true, tag: 'good' },
    { id: 'g_callback', cat: 'Procédure', q: 'Je vais raccrocher et vous rappeler sur votre numéro de l’annuaire, d’accord ?', au: u => '(Tu rappelles le ' + u.ext + ', le numéro de l’annuaire.) « ' + u.name + ', j’écoute ? Oui, c’est bien moi. »', sets: ['callback'], tag: 'good' },
    { id: 'g_since', cat: 'Comprendre', q: 'Depuis quand avez-vous ce problème ?', a: 'Depuis ce matin.', tag: 'good' },
    { id: 'g_error', cat: 'Comprendre', q: 'Avez-vous un message d’erreur ? Pouvez-vous me le lire exactement ?', a: 'Non, pas de message particulier.', tag: 'good' },
    { id: 'g_others', cat: 'Comprendre', q: 'Vos collègues ont-ils le même problème ?', a: 'Non, il me semble que c’est juste moi.', tag: 'good' },
    { id: 'g_change', cat: 'Comprendre', q: 'Y a-t-il eu un changement récent : installation, déplacement, mise à jour ?', a: 'Pas à ma connaissance.', tag: 'good' },
    { id: 'g_reboot', cat: 'Diagnostic', q: 'Avez-vous essayé de redémarrer l’ordinateur ?', a: 'Oui, ce matin, ça n’a rien changé.', tag: 'neutral' },
    { id: 'g_consent', cat: 'Procédure', q: 'Puis-je prendre la main à distance sur votre poste pour regarder ?', a: 'Oui, allez-y.', sets: ['consent'], tag: 'neutral' },
    { id: 'g_rude', cat: 'Comprendre', q: 'C’est sûrement une fausse manipulation de votre part, non ?', a: 'Euh… je ne crois pas. Je fais comme d’habitude.', tag: 'bad' },
    { id: 'g_confirm', cat: 'Clôture', q: 'Pouvez-vous vérifier que tout fonctionne maintenant ?', confirm: true, tag: 'good' }
  ];
  DS.qCats = ['Procédure', 'Comprendre', 'Diagnostic', 'Action', 'Contournement', 'Clôture'];

  const GA = [
    { id: 'g_taskmgr', g: 'Système', l: 'Ouvrir le Gestionnaire des tâches', r: 'Processeur : 12 %. Mémoire : 46 %. Disque : 3 %. Rien d’anormal.', sets: ['taskmgr'], tag: 'neutral' },
    { id: 'g_av', g: 'Sécurité', l: 'Lancer une analyse antivirus rapide (Defender)', r: 'Analyse rapide terminée : aucune menace détectée.', sets: ['av_scan'], tag: 'neutral' },
    { id: 'g_reboot', g: 'Système', l: 'Redémarrer le poste', r: 'Le poste redémarre. La session à distance revient au bout de 2 minutes.', sets: ['reboot'], tag: 'neutral' },
    { id: 'g_disav', g: 'Sécurité', l: 'Désactiver temporairement l’antivirus', r: 'Protection en temps réel désactivée.', sets: ['disable_av'], tag: 'bad' },
    { id: 'g_admin', g: 'Comptes locaux', l: 'Ajouter l’utilisateur aux administrateurs locaux du poste', r: 'Utilisateur ajouté au groupe local Administrateurs.', sets: ['local_admin'], tag: 'bad' },
    { id: 'g_reset', g: 'Système', l: 'Réinitialiser Windows (réinstallation complète)', r: 'Réinitialisation lancée : 2 heures d’indisponibilité pour l’utilisateur, données locales à restaurer.', sets: ['reset_os'], tag: 'bad' }
  ];

  const GP = [
    [-4, 'Prise en main sans l’accord de l’utilisateur', f => f('remote:noconsent')],
    [-8, 'Action sensible sur le compte avant vérification d’identité', f => f('ad:actbeforeid')],
    [-6, 'Antivirus désactivé', f => f('disable_av')],
    [-10, 'Droits administrateur locaux donnés à un utilisateur', f => f('local_admin'), true],
    [-5, 'Réinstallation de Windows : solution disproportionnée', f => f('reset_os')],
    [-12, 'Ajout à un groupe à privilèges (administrateurs)', f => f('ad:danger'), true],
    [-3, 'Mot de passe provisoire sans obligation de le changer', f => f.re(/^ad:reset_nochange:/)],
    [-6, 'Matricule erroné jugé conforme', f => f('id_misjudged')],
    [-2, 'Matricule correct jugé non conforme', f => f('id_wrong_reject')]
  ];

  /* ---------- État ---------- */
  const KEY = 'desksim.v2';
  function fresh() {
    return {
      v: 2, name: '', created: Date.now(), updated: 0, xp: 0, seq: 104213, clock: 0, lastArrival: 0,
      tickets: [], history: [], activeTid: null, kbRead: {}, quiz: { runs: [] }, labo: {}, badges: {},
      settings: { chrono: true, coach: true, tuto: true }, seeded: false
    };
  }
  function loadLocal() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 2) return s; } } catch (e) { /* stockage indisponible */ }
    return null;
  }
  DS.state = loadLocal() || fresh();
  if (DS.state.settings.tuto === undefined) DS.state.settings.tuto = true;
  const listeners = [];
  DS.on = fn => listeners.push(fn);
  DS.emit = (what) => listeners.forEach(fn => { try { fn(what); } catch (e) { console.error(e); } });

  /* Sauvegarde : navigateur + base claude.ai si disponible */
  let saveTimer = null, dbRef = null, dbBusy = false, dbPending = false;
  DS.sync = { mode: 'local', note: 'Sauvegarde dans ce navigateur' };
  DS.save = function () {
    DS.state.updated = Date.now();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(DS.state)); } catch (e) { /* plein ou bloqué */ }
      pushDb();
    }, 500);
  };
  async function pushDb() {
    if (!dbRef) return;
    if (dbBusy) { dbPending = true; return; }
    dbBusy = true;
    try { await dbRef.set({ json: JSON.stringify(DS.state), updated: DS.state.updated }); }
    catch (e) { if (e && e.code === 'invalid_argument') { dbRef = null; DS.sync = { mode: 'local', note: 'Sauvegarde dans ce navigateur (compte en lecture seule)' }; DS.emit('sync'); } }
    dbBusy = false;
    if (dbPending) { dbPending = false; pushDb(); }
  }
  DS.initCloud = async function () {
    const c = window.claude;
    if (!c || typeof c.use !== 'function') return;
    try {
      const [db, user] = await Promise.all([c.use('db'), c.use('user')]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      dbRef = db.doc('data/users/' + id + '/desksim');
      const snap = await dbRef.get();
      if (snap.exists) {
        const d = snap.data();
        if (d && d.json && (d.updated || 0) > (DS.state.updated || 0)) {
          const s = JSON.parse(d.json);
          if (s && s.v === 2) { DS.state = s; try { localStorage.setItem(KEY, d.json); } catch (e) { /* */ } DS.emit('reload'); }
        }
      }
      DS.sync = { mode: 'cloud', note: 'Progression sauvegardée sur ton compte' };
      DS.emit('sync');
      if (!snap.exists) pushDb();
    } catch (e) { /* reste en local */ }
  };
  DS.resetAll = function () {
    const keepName = DS.state.name;
    DS.state = fresh(); DS.state.name = keepName;
    DS.seed(); DS.save(); DS.emit('reload');
  };

  /* ---------- Horloge simulée ---------- */
  const DAY = 570; // 08:30 → 18:00
  const DAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'];
  DS.clockText = function (min) {
    const m = min == null ? DS.state.clock : min;
    const d = Math.floor(m / DAY), r = Math.floor(m % DAY) + 510;
    const date = new Date(2026, 10, 2);
    let added = 0;
    while (added < d) { date.setDate(date.getDate() + 1); if (date.getDay() !== 0 && date.getDay() !== 6) added++; }
    const hh = String(Math.floor(r / 60)).padStart(2, '0'), mm = String(r % 60).padStart(2, '0');
    return { time: hh + ':' + mm, date: DAYS[(date.getDay() + 6) % 7] + ' ' + String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear() };
  };
  DS.dur = function (min) {
    const m = Math.round(min);
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60), r = m % 60;
    return h + ' h ' + String(r).padStart(2, '0');
  };

  /* ---------- Tickets ---------- */
  DS.user = function (uid) { return Object.assign({ uid, login: DS.loginOf(uid) }, DS.users[uid]); };
  DS.ticket = tid => DS.state.tickets.find(t => t.tid === tid);
  DS.active = () => DS.ticket(DS.state.activeTid) || null;
  DS.sc = t => DS.byId[t.sid];

  DS.F = function (t) {
    const flags = (t && t.flags) || {};
    const f = x => !!flags[x];
    f.seq = x => flags[x] || 0;
    f.re = r => Object.keys(flags).some(k => r.test(k));
    return f;
  };
  DS.expPrio = function (s) {
    if (s.prio) return s.prio;
    const p = DS.priority(s.impact, s.urgency);
    return DS.users[s.req] && DS.users[s.req].vip ? Math.max(1, p - 1) : p;
  };
  DS.myPrio = function (t) {
    const p = DS.priority(t.fields.impact, t.fields.urgency);
    if (!p) return null;
    return t.fields.vip ? Math.max(1, p - 1) : p;
  };

  function act(t, k, text, who) {
    t.act.push({ k, text, who: who || null, at: DS.state.clock });
  }
  DS.log = act;

  DS.flag = function (t, x) { if (!t || !x) return; t.fseq = (t.fseq || 0) + 1; t.flags[x] = t.fseq; };
  function flags(t, list) { (list || []).forEach(x => DS.flag(t, x)); }
  function resolveSets(v, f) { return typeof v === 'function' ? v(f) : (v || []); }

  DS.newTicket = function (sid, quiet) {
    const st = DS.state;
    const s = DS.byId[sid];
    const u = DS.user(s.req);
    st.seq += Math.floor(1 + Math.random() * 6);
    const t = {
      tid: 'TCK' + String(st.seq).padStart(7, '0'), sid, created: st.clock, age: 0, status: 'new',
      fields: { type: '', cat: '', impact: '', urgency: '', vip: false }, flags: {}, fseq: 0, act: [], asked: [], hints: 0, hintIdx: 0,
      ad: { users: {}, created: {} }, nudged: false, claim: null, call: false, onsite: false, remote: false, done: {}
    };
    act(t, 'desc', s.desc, u.name);
    if (s.channel === 'Portail') { DS.flag(t, 'identity'); act(t, 'sys', 'Demande déposée sur le portail : demandeur authentifié par sa session Windows.'); }
    if (s.caller) act(t, 'sys', 'Appel entrant reçu par le standard depuis le ' + s.caller + '.');
    if (s.attach) act(t, 'attach', s.attach.name);
    st.tickets.push(t);
    st.lastArrival = st.clock;
    if (!quiet) DS.emit({ type: 'arrival', t });
    DS.save();
    return t;
  };

  DS.pickScenario = function () {
    const st = DS.state;
    const open = new Set(st.tickets.map(t => t.sid));
    const best = {};
    st.history.forEach(h => { best[h.sid] = Math.max(best[h.sid] || 0, h.total); });
    const lvl = st.history.length;
    let cands = DS.scenarios.filter(s => !open.has(s.id) && best[s.id] == null && (s.diff <= 1 || lvl >= 2) && (s.diff <= 2 || lvl >= 5));
    if (!cands.length) cands = DS.scenarios.filter(s => !open.has(s.id) && best[s.id] == null);
    if (!cands.length) cands = DS.scenarios.filter(s => !open.has(s.id)).sort((a, b) => (best[a.id] || 0) - (best[b.id] || 0)).slice(0, 5);
    if (!cands.length) return null;
    return cands[Math.floor(Math.random() * Math.min(cands.length, 4))].id;
  };
  DS.seed = function () {
    if (DS.state.seeded) return;
    DS.state.seeded = true;
    ['lock', 'screen', 'printer'].forEach(id => DS.newTicket(id, true));
    DS.state.tickets[1].created = -35; DS.state.tickets[1].age = 35;
    DS.state.tickets[2].created = -12; DS.state.tickets[2].age = 12;
    DS.state.activeTid = null;
    DS.save();
  };
  DS.requestTicket = function () {
    const sid = DS.pickScenario();
    if (!sid) return null;
    return DS.newTicket(sid);
  };

  /* ---------- Cycle de vie ---------- */
  DS.after = function (t) {
    if (DS.state.settings.tuto && t.tid === DS.state.activeTid && !t.flags.tutomode) DS.flag(t, 'tutomode');
    const s = DS.sc(t), f = DS.F(t);
    (s.events || []).forEach(ev => { if (!t.flags['ev:' + ev[0]] && ev[1](f)) { DS.flag(t, 'ev:' + ev[0]); act(t, 'a', ev[3], ev[2]); } });
    DS.save();
    DS.emit('ticket');
  };
  DS.setActive = function (tid) {
    DS.state.activeTid = tid;
    const t = DS.ticket(tid);
    if (t && DS.state.settings.tuto && !t.flags.tutomode) DS.flag(t, 'tutomode');
    DS.save(); DS.emit('active');
  };
  DS.setTuto = function (on) {
    DS.state.settings.tuto = !!on;
    const t = DS.active();
    if (t && on && !t.flags.tutomode) DS.flag(t, 'tutomode');
    DS.save(); DS.emit('tuto');
  };
  DS.take = function (t) {
    if (t.status !== 'new') return;
    t.status = 'wip'; DS.flag(t, 'taken');
    act(t, 'sys', 'Ticket pris en charge par ' + (DS.state.name || 'Technicien support') + ' (groupe Support IT).');
    DS.state.activeTid = t.tid;
    DS.after(t);
  };
  DS.saveFields = function (t, fields) {
    const before = JSON.stringify(t.fields);
    Object.assign(t.fields, fields);
    if (JSON.stringify(t.fields) !== before) {
      const p = DS.myPrio(t);
      act(t, 'sys', 'Champs mis à jour : ' + [t.fields.type && DS.types.find(x => x.id === t.fields.type).label, t.fields.cat && DS.categories.find(x => x.id === t.fields.cat).label, p && DS.prioLabels[p]].filter(Boolean).join(' · '));
    }
    if (t.fields.type && t.fields.cat && t.fields.impact && t.fields.urgency) DS.flag(t, 'qualified');
    DS.after(t);
  };
  DS.addNote = function (t, text) { act(t, 'note', text, DS.state.name || 'Technicien'); DS.flag(t, 'worknote'); DS.after(t); };
  DS.hint = function (t) {
    const s = DS.sc(t);
    if (!s.hints.length) return null;
    const h = s.hints[Math.min(t.hintIdx, s.hints.length - 1)];
    t.hintIdx++; t.hints++; DS.flag(t, 'hint');
    DS.after(t);
    return h;
  };

  /* ---------- Appel téléphonique ---------- */
  DS.questions = function (t) {
    const s = DS.sc(t);
    const map = {};
    GQ.forEach(q => { map[q.id] = Object.assign({}, q); });
    const order = GQ.map(q => q.id);
    s.qs.forEach(q => {
      if (map[q.id]) { if (q.hide) { delete map[q.id]; return; } Object.assign(map[q.id], q); if (q.a || q.claim) delete map[q.id].au; }
      else if (!q.hide) { map[q.id] = Object.assign({ cat: 'Diagnostic', tag: 'neutral' }, q); order.splice(order.length - 2, 0, q.id); }
    });
    return order.filter(id => map[id]).map(id => map[id]);
  };
  DS.call = function (t, on) {
    const u = DS.user(DS.sc(t).req);
    if (on && !t.call) { t.call = true; t.callStart = Date.now(); DS.flag(t, 'called'); act(t, 'sys', 'Appel sortant vers ' + u.name + ' (poste ' + u.ext + ').'); }
    if (!on && t.call) { t.call = false; const sec = Math.round((Date.now() - (t.callStart || Date.now())) / 1000); act(t, 'sys', 'Fin de l’appel avec ' + u.name + ' (' + Math.floor(sec / 60) + ' min ' + String(sec % 60).padStart(2, '0') + ' s).'); }
    DS.after(t);
  };
  DS.ask = function (t, qid) {
    const s = DS.sc(t), f = DS.F(t), u = DS.user(s.req);
    const q = DS.questions(t).find(x => x.id === qid);
    if (!q) return null;
    let ans;
    if (q.confirm) {
      const ok = s.fixed ? s.fixed(f) : false;
      ans = ok ? s.yes : (typeof s.no === 'function' ? s.no(f) : s.no);
      DS.flag(t, ok ? 'confirmed' : 'confirm_fail');
    } else if (q.au) ans = q.au(u);
    else ans = typeof q.a === 'function' ? q.a(f) : q.a;
    if (!t.asked.includes(qid)) t.asked.push(qid);
    DS.flag(t, 'q:' + qid);
    if (q.tag === 'bad') DS.flag(t, 'bad:' + qid);
    act(t, 'q', q.q, DS.state.name || 'Technicien');
    act(t, 'a', ans || '…', u.name);
    flags(t, resolveSets(q.sets, f));
    flags(t, resolveSets(q.also, f));
    if (q.identity) { t.claim = q.claim || u.empId; }
    if (q.third) act(t, 'third', q.third[1], q.third[0]);
    DS.after(t);
    return ans;
  };
  DS.judgeId = function (t, conform) {
    const s = DS.sc(t), real = DS.users[s.req].empId;
    const same = t.claim === real;
    if (conform) { DS.flag(t, 'identity'); if (!same) DS.flag(t, 'id_misjudged'); act(t, 'sys', 'Identité jugée conforme (matricule annoncé ' + t.claim + ').'); }
    else { if (!same) DS.flag(t, 'id_mismatch_detected'); else DS.flag(t, 'id_wrong_reject'); act(t, 'sys', 'Identité jugée NON conforme (matricule annoncé ' + t.claim + ', annuaire ' + real + ').'); }
    t.claim = null;
    DS.after(t);
  };

  /* ---------- Prise en main à distance ---------- */
  DS.remoteBlock = function (t) {
    const s = DS.sc(t), f = DS.F(t);
    return typeof s.remote === 'function' ? s.remote(f) : (s.remote || null);
  };
  DS.remoteConnect = function (t) {
    const blk = DS.remoteBlock(t);
    DS.flag(t, 'remote:tried');
    if (blk) { act(t, 'sys', 'Tentative de prise en main de ' + DS.sc(t).ci + ' : échec.'); DS.after(t); return blk; }
    const f = DS.F(t);
    if (!f('consent')) {
      DS.flag(t, 'remote:noconsent');
      act(t, 'a', 'Euh… ma souris bouge toute seule, c’est vous ? Vous auriez pu me prévenir !', DS.user(DS.sc(t).req).name);
    }
    t.remote = true; DS.flag(t, 'remote:connect');
    act(t, 'sys', 'Session d’assistance à distance ouverte sur ' + DS.sc(t).ci + '.');
    DS.after(t);
    return null;
  };
  DS.remoteActs = function (t) {
    const s = DS.sc(t);
    const hasTm = s.acts.some(a => a.id === 'taskmgr');
    return s.acts.concat(GA.filter(a => !(a.id === 'g_taskmgr' && hasTm)));
  };
  DS.doAct = function (t, a, where) {
    const f = DS.F(t);
    const r = typeof a.r === 'function' ? a.r(f) : a.r;
    flags(t, resolveSets(a.sets, f));
    flags(t, resolveSets(a.also, f));
    DS.flag(t, (where || 'act') + ':' + a.id);
    t.done[(where || 'act') + ':' + a.id] = r;
    act(t, 'sys', (where === 'site' ? 'Sur site : ' : where === 'cloud' ? 'Console cloud : ' : 'À distance : ') + a.l);
    DS.after(t);
    return r;
  };
  DS.profile = function (t) {
    const s = DS.sc(t), f = DS.F(t);
    const p = DS.defaultProfile(s.ci && DS.assets[s.ci] && DS.assets[s.ci].kind.indexOf('Imprimante') < 0 ? s.ci : DS.users[s.req].asset);
    const over = s.machine ? s.machine(f) : {};
    Object.keys(over || {}).forEach(k => { if (over[k] !== undefined) p[k] = over[k]; });
    Object.keys(p.services).forEach(k => {
      const lk = k.toLowerCase();
      const stop = f.seq('svcstop:' + lk), start = Math.max(f.seq('svcstart:' + lk), f.seq('svcrestart:' + lk));
      if (stop > start) p.services[k] = 'Stopped';
    });
    p.procs = p.procs.filter(pr => !f('kill:' + pr[0].toLowerCase()));
    return p;
  };
  DS.termCtx = function (t) {
    const s = DS.sc(t);
    return {
      profile: DS.profile(t),
      setFlag: x => DS.flag(t, x),
      scenarioCmd: s.cmd ? (line => s.cmd(line, DS.F(t))) : null,
      findUser: login => { const all = DS.adUsers(t); const k = Object.keys(all).find(id => all[id].login === login.toLowerCase()); return k ? all[k] : null; }
    };
  };

  /* ---------- Active Directory et cloud ---------- */
  DS.adUsers = function (t) {
    const s = t ? DS.sc(t) : null;
    const out = {};
    Object.keys(DS.users).forEach(uid => {
      const base = Object.assign({ uid, login: DS.loginOf(uid) }, DS.userDefaults, DS.users[uid]);
      base.groups = DS.users[uid].groups.slice();
      const sc = s && s.ad && s.ad.users && s.ad.users[uid];
      if (sc) Object.assign(base, sc);
      const mod = t && t.ad.users[uid];
      if (mod) Object.assign(base, mod);
      out[uid] = base;
    });
    if (t) Object.keys(t.ad.created).forEach(login => { out[login] = Object.assign({ uid: login, created: true }, DS.userDefaults, { lastLogon: 'Jamais', pwdAgeDays: 0 }, t.ad.created[login]); });
    return out;
  };
  DS.adComputer = function (t, asset) {
    const s = t ? DS.sc(t) : null;
    const a = DS.assets[asset];
    if (!a) return null;
    const c = Object.assign({ id: asset }, a);
    c.bitlocker = (s && s.ad && s.ad.computers && s.ad.computers[asset] && s.ad.computers[asset].bitlocker) || (a.kind === 'Portable' ? [{ id: 'A1B2C3D4-0000-4C1D-9F00-' + asset.replace(/\W/g, '').slice(-12).padStart(12, '0'), date: '12/01/2026 09:30', key: '110220-330440-550660-770880-990110-121314-151617-181920' }] : []);
    return c;
  };
  const SENSITIVE = ['unlock', 'reset', 'enable', 'group+', 'blreveal'];
  DS.ad = function (t, op, uid, p) {
    if (!t) return 'Aucun ticket actif : ouvre un ticket dans le Service Desk pour agir sur l’annuaire.';
    const s = DS.sc(t), f = DS.F(t);
    const all = DS.adUsers(t);
    const u = all[uid];
    p = p || {};
    if (SENSITIVE.includes(op) && !s.noIdCheck && !f('identity')) {
      const target = op === 'blreveal' ? (DS.assets[uid] && DS.assets[uid].user) : uid;
      if (target === s.req) DS.flag(t, 'ad:actbeforeid');
    }
    const mods = (uid && DS.users[uid]) ? (t.ad.users[uid] = t.ad.users[uid] || {}) : (uid && t.ad.created[uid]) ? t.ad.created[uid] : {};
    const name = u ? u.name : uid;
    switch (op) {
      case 'view': DS.flag(t, 'ad:view:' + uid); break;
      case 'search': if (p.term && p.term.length >= 3) DS.flag(t, 'ad:search:' + norm(p.term)); break;
      case 'comp': DS.flag(t, 'ad:comp:' + uid); break;
      case 'unlock': mods.locked = false; mods.badPwd = 0; DS.flag(t, 'ad:unlock:' + uid); act(t, 'sys', 'AD : compte ' + u.login + ' déverrouillé.'); break;
      case 'reset':
        mods.pwdAgeDays = 0; mods.pwdExpired = false; mods.mustChange = !!p.mustChange;
        DS.flag(t, 'ad:reset:' + uid);
        if (!p.mustChange) DS.flag(t, 'ad:reset_nochange:' + uid);
        if (p.unlock && u.locked) { mods.locked = false; mods.badPwd = 0; DS.flag(t, 'ad:unlock:' + uid); }
        act(t, 'sys', 'AD : mot de passe de ' + u.login + ' réinitialisé' + (p.mustChange ? ' (changement obligatoire à la prochaine ouverture de session)' : ' (sans obligation de changement)') + (p.unlock && u.locked ? ', compte déverrouillé' : '') + '.');
        break;
      case 'disable': mods.enabled = false; DS.flag(t, 'ad:disable:' + uid); act(t, 'sys', 'AD : compte ' + u.login + ' désactivé.'); break;
      case 'enable': mods.enabled = true; DS.flag(t, 'ad:enable:' + uid); act(t, 'sys', 'AD : compte ' + u.login + ' activé.'); break;
      case 'group+': {
        const g = DS.groups.find(x => x.id === p.g);
        if (!g || u.groups.includes(p.g)) break;
        mods.groups = u.groups.concat([p.g]);
        DS.flag(t, 'ad:group+:' + uid + ':' + p.g);
        if (g.danger) DS.flag(t, 'ad:danger');
        act(t, 'sys', 'AD : ' + u.login + ' ajouté au groupe ' + p.g + '.');
        break;
      }
      case 'group-':
        mods.groups = u.groups.filter(x => x !== p.g);
        DS.flag(t, 'ad:group-:' + uid + ':' + p.g);
        act(t, 'sys', 'AD : ' + u.login + ' retiré du groupe ' + p.g + '.');
        break;
      case 'create': {
        const login = norm(p.login).trim();
        t.ad.created[login] = { name: p.first + ' ' + p.last, first: p.first, last: p.last, login, ou: p.ou, title: p.title || '', dept: p.ou, groups: p.groups.slice(), mustChange: !!p.mustChange, enabled: true, empId: '—', ext: '—', asset: '—', office: '—' };
        DS.flag(t, 'ad:create:' + login);
        p.groups.forEach(g => { const gg = DS.groups.find(x => x.id === g); if (gg && gg.danger) DS.flag(t, 'ad:danger'); });
        act(t, 'sys', 'AD : utilisateur ' + login + ' créé dans OU=' + p.ou + ' (groupes : ' + p.groups.join(', ') + ').');
        break;
      }
      case 'blreveal': {
        const id8 = p.id.slice(0, 8);
        Object.keys(t.flags).filter(k => k.startsWith('bl:last:')).forEach(k => delete t.flags[k]);
        DS.flag(t, 'bl:reveal:' + id8); DS.flag(t, 'bl:last:' + id8);
        act(t, 'sys', 'AD : clé de récupération BitLocker affichée pour ' + uid + ' (ID ' + id8 + '…).');
        break;
      }
      case 'revoke': DS.flag(t, 'ad:revoke:' + uid); act(t, 'sys', 'Cloud : toutes les sessions de ' + u.login + ' révoquées (déconnexion forcée partout).'); break;
      case 'rule': DS.flag(t, 'rule_removed'); mods.rules = []; act(t, 'sys', 'Cloud : règle de boîte de réception suspecte supprimée pour ' + u.login + '.'); break;
      case 'cloudview': DS.flag(t, 'cloud:view:' + uid); break;
    }
    DS.after(t);
    return null;
  };
  DS.pwdRules = function (pw, u) {
    const r = { len: pw.length >= 12, up: /[A-Z]/.test(pw), low: /[a-z]/.test(pw), dig: /\d/.test(pw), sp: /[^A-Za-z0-9]/.test(pw) };
    r.name = !(u && u.login && u.login.split('.').some(part => part.length > 2 && norm(pw).includes(part)));
    r.ok = r.len && r.up && r.low && r.dig && r.sp && r.name;
    return r;
  };

  /* ---------- Sur site / SSH / supervision ---------- */
  DS.goSite = function (t) {
    if (t.onsite) return;
    const s = DS.sc(t);
    const a = DS.assets[s.ci] || {};
    const far = a.site && a.site !== 'Siège' && a.site !== 'Stock IT' && a.site !== 'Salle serveurs';
    const travel = far ? 30 : 6;
    t.onsite = true; t.age += travel; DS.flag(t, 'onsite');
    act(t, 'sys', 'Déplacement sur site (' + (a.site || 'Siège') + ') : ' + travel + ' min de trajet.');
    DS.after(t);
  };
  DS.sshState = function (t, host) {
    const s = t && DS.sc(t);
    if (s && s.ssh && s.ssh.host === host) return s.ssh.state(DS.F(t));
    return { rootUsed: 6.2, rootSize: 20, services: host === 'lab-debian' ? { ssh: 'active', cron: 'active', cups: 'active', NetworkManager: 'active' } : { nginx: 'active', 'php8.2-fpm': 'active', ssh: 'active', cron: 'active', mariadb: 'active' }, debugSize: 0.3, journalSize: 0.4 };
  };
  DS.monitorHosts = function (t) {
    const base = [
      ['srv-dc-01', 'Contrôleur de domaine – AD, DNS, DHCP'], ['srv-dc-02', 'Contrôleur de domaine secondaire'], ['srv-fic-01', 'Serveur de fichiers – partages administratifs'],
      ['srv-fic-02', 'Serveur de fichiers – plateau technique (S:)'], ['srv-sil-01', 'SIL – système d’information de laboratoire'], ['srv-print-01', 'Serveur d’impression'],
      ['srv-intra-01', 'Intranet (Debian, nginx + PHP)'], ['vpn.ostral-bio.fr', 'Passerelle VPN nomades'], ['ipbx-01', 'Standard téléphonique IP'],
      ['lien-villeurbanne', 'Lien inter-sites Villeurbanne'], ['lien-saint-priest', 'Lien inter-sites Saint-Priest'], ['lien-caluire', 'Lien inter-sites Caluire']
    ];
    const over = t && DS.sc(t).monitor ? DS.sc(t).monitor(DS.F(t)) : {};
    return base.map(([h, d]) => Object.assign({ host: h, desc: d, st: 'up', msg: 'OK – ping ' + (h.startsWith('lien') ? '6' : '1') + ' ms' }, over[h] || {}));
  };

  /* ---------- Notation ---------- */
  DS.evaluate = function (t, c) {
    const s = DS.sc(t), f = DS.F(t);
    c.noteN = norm(c.note);
    c.created = t.ad.created;
    const items = [];
    // Qualification (20)
    const tp = t.fields.type === s.type[0] ? 4 : (s.type.includes(t.fields.type) ? 2 : 0);
    const cp = t.fields.cat === s.cat[0] ? 6 : (s.cat.includes(t.fields.cat) ? 4 : 0);
    const exp = DS.expPrio(s), mine = DS.myPrio(t);
    const pp = mine === exp ? 10 : (mine && Math.abs(mine - exp) === 1 ? 4 : 0);
    items.push({ sec: 'q', label: 'Type : ' + DS.types.find(x => x.id === s.type[0]).label, ok: tp === 4, pts: tp, max: 4 });
    items.push({ sec: 'q', label: 'Catégorie : ' + s.cat.map(id => DS.categories.find(x => x.id === id).label).join(' ou '), ok: cp >= 4, pts: cp, max: 6 });
    items.push({ sec: 'q', label: 'Priorité : ' + DS.prioLabels[exp], ok: pp === 10, pts: pp, max: 10 });
    // Diagnostic (25) et résolution (20 + cause 7 + issue 8)
    const run = (sec, scale) => {
      const list = s.checks.filter(x => x[0] === sec);
      const tot = list.reduce((a, x) => a + x[1], 0) || 1;
      let got = 0;
      list.forEach(x => { let ok = false; try { ok = !!x[3](f, c); } catch (e) { ok = false; } items.push({ sec: sec === 'diag' ? 'd' : 'r', label: x[2], ok, pts: 0, raw: x[1] }); if (ok) got += x[1]; });
      const pts = Math.round(scale * got / tot);
      const arr = items.filter(i => i.sec === (sec === 'diag' ? 'd' : 'r') && i.raw);
      arr.forEach(i => { i.max = Math.round(scale * i.raw / tot * 10) / 10; i.pts = i.ok ? i.max : 0; });
      return pts;
    };
    const dPts = run('diag', 25);
    let rPts = run('res', 20);
    const causeOk = c.cause === 0;
    items.push({ sec: 'r', label: 'Cause identifiée : ' + s.causes[0], ok: causeOk, pts: causeOk ? 7 : 0, max: 7 });
    let oPts = 0;
    const o = s.out;
    if (o.mode === c.mode) { oPts = o.mode === 'escalate' ? 4 + (c.team === o.team ? 4 : ((o.alt || []).includes(c.team) ? 2 : 0)) : 8; }
    const teamLbl = o.team ? DS.teams.find(x => x.id === o.team).label : '';
    items.push({ sec: 'r', label: o.mode === 'escalate' ? 'Escalader vers ' + teamLbl : 'Résoudre au niveau du support (pas d’escalade)', ok: oPts === 8, pts: oPts, max: 8 });
    rPts += (causeOk ? 7 : 0) + oPts;
    // Sécurité & procédure (10)
    const pens = [];
    const labels = new Set(s.pen.map(p => p[1]));
    s.pen.concat(GP.filter(p => !labels.has(p[1]))).forEach(p => { let hit = false; try { hit = !!p[2](f, c); } catch (e) { hit = false; } if (hit) pens.push({ pts: p[0], label: p[1], grave: !!p[3] }); });
    const secRaw = 10 + pens.reduce((a, p) => a + p.pts, 0);
    const sPts = Math.max(0, secRaw);
    const overflow = Math.min(0, secRaw);
    // Communication (10)
    const closeS = c.closing === 0 ? 5 : c.closing === 1 ? 2 : 0;
    items.push({ sec: 'c', label: 'Message au demandeur clair, poli et sans jargon', ok: closeS === 5, pts: closeS, max: 5 });
    const kwHits = (s.kw || []).filter(k => c.noteN.includes(norm(k))).length;
    const noteS = (c.noteN.length >= 50 ? 1 : 0) + Math.min(2, kwHits);
    items.push({ sec: 'c', label: 'Note ' + (o.mode === 'escalate' ? 'd’escalade' : 'de résolution') + ' utile (détaillée, termes précis)', ok: noteS === 3, pts: noteS, max: 3 });
    let finPts = 0;
    if (o.mode === 'resolve') { finPts = f('confirmed') ? 2 : 0; items.push({ sec: 'c', label: 'Faire confirmer la résolution par l’utilisateur', ok: finPts === 2, pts: finPts, max: 2 }); }
    else { finPts = f('called') ? 2 : 0; items.push({ sec: 'c', label: 'Contacter le demandeur avant de transmettre', ok: finPts === 2, pts: finPts, max: 2 }); }
    const bad = t.asked.map(id => DS.questions(t).find(q => q.id === id)).filter(q => q && q.tag === 'bad');
    bad.forEach(q => pens.push({ pts: -2, label: 'Phrase maladroite : « ' + q.q + ' »', comm: true }));
    const cPts = Math.max(0, closeS + noteS + finPts - 2 * bad.length);
    // Total
    const qPts = tp + cp + pp;
    let total = qPts + dPts + rPts + sPts + cPts + overflow;
    const hintPen = 3 * t.hints;
    total -= hintPen;
    const target = DS.sla[mine || exp];
    const late = DS.state.settings.chrono && t.age > target;
    if (late) total -= 5;
    const grave = pens.some(p => p.grave);
    total = Math.max(0, Math.min(100, Math.round(total)));
    if (grave) total = Math.min(total, 40);
    const grade = total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : total >= 40 ? 'D' : 'E';
    const stars = Math.max(1, Math.min(5, Math.round((cPts / 10) * 2.5 + (rPts / 35) * 2.5) - (late ? 1 : 0)));
    return {
      tid: t.tid, sid: s.id, title: s.title, req: s.req, cat: s.cat[0], date: Date.now(), clock: DS.state.clock, total, grade, stars, grave, tuto: !!t.flags.tutomode,
      secs: { q: [qPts, 20], d: [dPts, 25], r: [rPts, 35], s: [sPts, 10], c: [cPts, 10] },
      items, pens, hints: t.hints, hintPen, late, age: Math.round(t.age), target,
      choices: {
        type: t.fields.type, cat: t.fields.cat, prio: mine, expPrio: exp, cause: c.cause, causeText: s.causes[c.cause], mode: c.mode, team: c.team,
        closing: c.closing, closingText: s.closing[c.closing], note: c.note
      }
    };
  };

  DS.close = function (t, c) {
    const rep = DS.evaluate(t, c);
    const st = DS.state;
    st.history.push(rep);
    st.history.forEach((h, i) => { if (i < st.history.length - 40) { delete h.items; delete h.choices; } });
    rep.xp = rep.tuto ? Math.round(rep.total / 2) : rep.total;
    st.xp += rep.xp;
    st.tickets = st.tickets.filter(x => x.tid !== t.tid);
    if (st.activeTid === t.tid) st.activeTid = null;
    DS.checkBadges();
    DS.save();
    DS.emit({ type: 'closed', rep });
    return rep;
  };

  /* ---------- Niveaux et badges ---------- */
  DS.level = function (xp) {
    const L = DS.levels;
    let i = 0;
    while (i < L.length - 1 && xp >= L[i + 1].xp) i++;
    const next = L[i + 1];
    return { i, name: L[i].name, next: next ? next.name : null, pct: next ? Math.round((xp - L[i].xp) / (next.xp - L[i].xp) * 100) : 100, toNext: next ? next.xp - xp : 0 };
  };
  DS.badgeDefs = [
    ['first', 'Premier ticket', 'Clôturer un premier ticket', st => st.history.length >= 1],
    ['perfect', 'Sans faute', 'Obtenir 95 ou plus sur un ticket', st => st.history.some(h => h.total >= 95)],
    ['guard', 'Gardien', 'Phishing et faux DAF à 80 ou plus', st => ['phish', 'fakeceo'].every(id => st.history.some(h => h.sid === id && h.total >= 80))],
    ['net', 'Couche 1', 'Câble, téléphone IP et VPN à 70 ou plus', st => ['cable', 'phone', 'vpn'].every(id => st.history.some(h => h.sid === id && h.total >= 70))],
    ['linux', 'Pingouin', 'Réparer l’intranet sous Linux à 75 ou plus', st => st.history.some(h => h.sid === 'linux' && h.total >= 75)],
    ['solo', 'Autonome', '5 tickets sans indice', st => st.history.filter(h => !h.hints).length >= 5],
    ['sla', 'Dans les temps', '5 tickets dans le délai', st => st.history.filter(h => !h.late).length >= 5],
    ['reader', 'Documenté', 'Lire 10 articles du wiki', st => Object.keys(st.kbRead).length >= 10],
    ['quiz', 'As du quiz', '90 % ou plus à un quiz', st => st.quiz.runs.some(r => r.pct >= 90)],
    ['streak', 'En série', '5 tickets de suite à 80 ou plus', st => { let run = 0, best = 0; st.history.forEach(h => { run = h.total >= 80 ? run + 1 : 0; best = Math.max(best, run); }); return best >= 5; }],
    ['allround', 'Polyvalent', 'Un ticket réussi dans chaque catégorie', st => DS.categories.every(c => st.history.some(h => h.cat === c.id && h.total >= 60))],
    ['escal', 'Bon relais', '3 escalades vers la bonne équipe', st => st.history.filter(h => DS.byId[h.sid] && DS.byId[h.sid].out.mode === 'escalate' && h.total >= 60).length >= 3],
    ['lab', 'Ligne de commande', 'Finir les exercices du labo', st => DS.laboEx && DS.laboEx.every(e => st.labo[e.id])],
    ['tour', 'Tour complet', 'Traiter les 23 scénarios', st => DS.scenarios.every(s => st.history.some(h => h.sid === s.id))]
  ];
  DS.checkBadges = function () {
    const st = DS.state;
    DS.badgeDefs.forEach(b => { if (!st.badges[b[0]] && b[3](st)) { st.badges[b[0]] = Date.now(); DS.emit({ type: 'badge', b }); } });
  };

  /* ---------- Horloge : tick ---------- */
  DS.tick = function () {
    const st = DS.state;
    if (!st.settings.chrono) return;
    const step = DS.TIME_SCALE / 60;
    st.clock += step;
    st.tickets.forEach(t => {
      t.age += step;
      const s = DS.sc(t);
      if (!t.nudged && t.status === 'new' && t.age > DS.sla[DS.expPrio(s)] * 0.4) {
        t.nudged = true;
        act(t, 'a', 'Relance : bonjour, est-ce que quelqu’un a pu regarder ma demande ? Merci.', DS.user(s.req).name);
        DS.emit({ type: 'nudge', t });
      }
    });
    if (st.tickets.length < 3 && st.clock - st.lastArrival > 25) DS.requestTicket();
    if (Math.round(st.clock * 3) % 30 === 0) DS.save();
  };
})();
