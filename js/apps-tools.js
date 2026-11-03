/* DeskSim — outils : assistance à distance, PowerShell, PuTTY, intervention sur site, supervision, wiki */
(function () {
  const UI = DS.UI, esc = UI.esc, svg = UI.svg;

  /* ---------- Terminaux partagés ---------- */
  UI.terms = {};
  UI.termBuf = function (key, banner) {
    if (!UI.terms[key]) UI.terms[key] = { lines: banner ? [{ c: 'out', t: banner }] : [], hist: [], hi: -1 };
    return UI.terms[key];
  };
  UI.termHtml = function (key, prompt, cls, title) {
    const b = UI.termBuf(key);
    const lines = b.lines.map(l => l.c === 'cmd' ? '<div class="tl"><span class="pr">' + l.p + '</span><span class="tc">' + esc(l.t) + '</span></div>' : '<div class="tl to">' + esc(l.t) + '</div>').join('');
    return '<div class="term ' + (cls || '') + '" data-a="tfocus">' + (title ? '<div class="tbar">' + esc(title) + '</div>' : '') + '<div class="tout" data-sk="t-' + key + '" data-stick>' + lines +
      '<div class="tin"><span class="pr">' + prompt + '</span><input data-k="tin-' + key + '" data-enter="run" data-hist="hist" data-key="' + key + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Commande"></div></div></div>';
  };
  UI.termRun = function (w, el, prompt, exec) {
    const key = el.dataset.key, b = UI.termBuf(key), cmd = el.value;
    el.value = '';
    b.lines.push({ c: 'cmd', p: prompt, t: cmd });
    if (cmd.trim()) { b.hist.push(cmd); b.hi = b.hist.length; }
    const r = exec(cmd) || { out: '' };
    if (r.clear) b.lines = [];
    else if (r.out) b.lines.push({ c: 'out', t: r.out });
    if (b.lines.length > 400) b.lines = b.lines.slice(-400);
    return r;
  };
  UI.termHist = function (el, e) {
    const b = UI.termBuf(el.dataset.key);
    if (!b.hist.length) return;
    b.hi = Math.max(0, Math.min(b.hist.length, b.hi + (e.key === 'ArrowUp' ? -1 : 1)));
    el.value = b.hist[b.hi] || '';
  };
  const focusTerm = w => { const i = w.body.querySelector('.tin input'); if (i && !UI.mobile()) i.focus({ preventScroll: true }); };

  /* PowerShell : cmdlets Active Directory (module RSAT) */
  function adCmdlets(line, t, setFlag) {
    const l = line.trim();
    const all = DS.adUsers(t);
    const byLogin = login => Object.keys(all).find(id => all[id].login === (login || '').toLowerCase().replace(/^ostral\\/, ''));
    let m;
    if ((m = l.match(/^get-aduser\s+(?:-identity\s+)?(\S+)(.*)$/i))) {
      setFlag('ps:getaduser');
      const id = byLogin(m[1]);
      if (!id) return 'Get-ADUser : Impossible de trouver un objet avec l’identité « ' + m[1] + ' » sous « DC=ostral,DC=local ».';
      const u = all[id];
      if (t) DS.ad(t, 'view', id);
      const props = /properties/i.test(m[2]);
      return ['', 'DistinguishedName : CN=' + u.name + ',OU=' + u.ou + ',OU=Utilisateurs,DC=ostral,DC=local', 'Enabled           : ' + (u.enabled !== false ? 'True' : 'False'), 'GivenName         : ' + u.name.split(' ')[0], 'Name              : ' + u.name, 'SamAccountName    : ' + u.login, 'UserPrincipalName : ' + u.login + '@ostral.local']
        .concat(props ? ['EmployeeID        : ' + u.empId, 'LockedOut         : ' + (u.locked ? 'True' : 'False'), 'BadLogonCount     : ' + (u.badPwd || 0), 'PasswordExpired   : ' + (u.pwdExpired ? 'True' : 'False'), 'PasswordLastSet   : il y a ' + u.pwdAgeDays + ' jours', 'LastLogonDate     : ' + u.lastLogon, 'Title             : ' + u.title, 'MemberOf          : {' + u.groups.join(', ') + '}'] : []).join('\n');
    }
    if (/^search-adaccount\s+-lockedout/i.test(l)) {
      setFlag('ps:lockedout');
      const locked = Object.values(all).filter(u => u.locked);
      if (!locked.length) return '';
      return '\nName              SamAccountName     LockedOut  Enabled\n----              --------------     ---------  -------\n' + locked.map(u => (u.name + ' '.repeat(18)).slice(0, 18) + (u.login + ' '.repeat(19)).slice(0, 19) + 'True       True').join('\n');
    }
    if ((m = l.match(/^unlock-adaccount\s+(?:-identity\s+)?(\S+)/i))) {
      const id = byLogin(m[1]);
      if (!id) return 'Unlock-ADAccount : Impossible de trouver un objet avec l’identité « ' + m[1] + ' ».';
      if (!t || t.status === 'new') return 'Unlock-ADAccount : action refusée hors ticket. Ouvre et prends en charge le ticket concerné.';
      DS.ad(t, 'unlock', id); setFlag('ps:unlock');
      return '';
    }
    if ((m = l.match(/^get-adprincipalgroupmembership\s+(?:-identity\s+)?(\S+)/i))) {
      const id = byLogin(m[1]);
      if (!id) return 'Get-ADPrincipalGroupMembership : Impossible de trouver « ' + m[1] + ' ».';
      setFlag('ps:groups');
      if (t) DS.ad(t, 'view', id);
      return '\nname\n----\nUtilisateurs du domaine\n' + all[id].groups.join('\n');
    }
    if ((m = l.match(/^add-adgroupmember\s+(?:-identity\s+)?(\S+)\s+-members?\s+(\S+)/i))) {
      const id = byLogin(m[2]);
      const g = DS.groups.find(x => x.id.toLowerCase() === m[1].replace(/"/g, '').toLowerCase());
      if (!id || !g) return 'Add-ADGroupMember : groupe ou utilisateur introuvable.';
      if (!t || t.status === 'new') return 'Add-ADGroupMember : action refusée hors ticket.';
      DS.ad(t, 'group+', id, { g: g.id });
      return '';
    }
    if (/^get-adgroupmember\s+/i.test(l)) {
      const g = l.split(/\s+/).pop().replace(/"/g, '');
      return '\nname\n----\n' + Object.values(all).filter(u => u.groups.some(x => x.toLowerCase() === g.toLowerCase())).map(u => u.name).join('\n');
    }
    if (/^enter-pssession/i.test(l)) return 'Utilise l’application « Assistance à distance » pour travailler sur le poste d’un utilisateur.';
    if ((m = l.match(/^test-connection\s+(?:-computername\s+)?(\S+)/i))) return { alias: 'ping ' + m[1] };
    return null;
  }
  UI.adCmdlets = adCmdlets;

  /* =========================== ASSISTANCE À DISTANCE =========================== */
  UI.reg('remote', {
    title: 'Assistance à distance', short: 'Assistance à distance', color: '#d0612c', icon: 'remote', w: 980, h: 620, x: 110, y: 30, keys: 'prise en main bureau distance teamviewer quick assist',
    init(w) { w.st = { tab: 'acts', last: null }; },
    titleExtra() { const t = DS.active(); return t && t.remote ? DS.sc(t).ci : ''; },
    render(w) {
      const t = DS.active();
      if (!t) return '<div class="ra-off"><h3>Aucun ticket actif</h3><p class="muted">Ouvre et prends en charge un ticket dans le Service Desk : la session d’assistance sera liée à ce ticket.</p></div>';
      const s = DS.sc(t), u = DS.users[s.req];
      if (t.status === 'new') return '<div class="ra-off"><h3>Ticket non pris en charge</h3><p class="muted">Prends le ticket ' + t.tid + ' en charge avant d’ouvrir une session.</p></div>';
      if (!t.remote) {
        return '<div class="ra-off"><h3>Se connecter à un poste</h3><p class="muted">L’utilisateur voit une demande de partage d’écran. Demande-lui son accord au téléphone avant de te connecter.</p>' +
          '<div class="row"><label class="field grow"><span>Nom du poste</span><input type="text" class="mono" data-k="ra-host-' + t.tid + '" value="' + esc(DS.users[s.req].asset) + '"></label><button class="btn primary" data-a="connect">Se connecter</button></div>' +
          (w.st.err ? '<div class="callout warn">' + esc(w.st.err) + '</div>' : '') + '<p class="small muted">Poste du demandeur dans le parc : <span class="mono">' + esc(u.asset) + '</span></p></div>';
      }
      const acts = DS.remoteActs(t);
      const groups = {};
      acts.forEach(a => { (groups[a.g] = groups[a.g] || []).push(a); });
      const last = w.st.last;
      const screen = '<div class="ra-screen"><div class="ra-wall"><div class="ra-win"><div class="ra-wt">' + esc(last ? last.l : 'Bureau de ' + u.name) + '</div><div class="ra-wb">' + (last ? '<pre>' + esc(last.r) + '</pre>' : '<p>Session ouverte sur <b>' + esc(DS.users[s.req].asset) + '</b>. Choisis une action à droite, ou ouvre l’invite de commandes administrateur.</p>') + '</div></div></div><div class="ra-task"><span class="logo-o sm"></span><span>' + esc(u.name) + '</span><span class="grow"></span><span class="mono">' + DS.clockText().time + '</span></div></div>';
      const panel = '<div class="ra-acts" data-sk="ra-acts">' + Object.keys(groups).map(g => '<div class="actgroup"><div class="label">' + esc(g) + '</div>' + groups[g].map(a => '<button class="actbtn' + (t.done['act:' + a.id] ? ' done' : '') + '" data-a="act" data-id="' + a.id + '">' + esc(a.l) + '</button>').join('') + '</div>').join('') + '</div>';
      const tabs = '<div class="ra-bar"><span class="ra-on">Connecté à <b class="mono">' + esc(DS.users[s.req].asset) + '</b> · ' + esc(u.name) + ' · contrôle total</span><span class="grow"></span><div class="seg"><button class="' + (w.st.tab === 'acts' ? 'on' : '') + '" data-a="tab" data-t="acts">Écran et actions</button><button class="' + (w.st.tab === 'cmd' ? 'on' : '') + '" data-a="tab" data-t="cmd">Invite de commandes (admin)</button></div><button class="btn sm" data-a="disc">Déconnecter</button></div>';
      if (w.st.tab === 'cmd') return tabs + '<div class="ra-term">' + UI.termHtml('ra-' + t.tid, 'PS C:\\Windows\\system32> ', 'ps', 'Administrateur : Windows PowerShell – ' + DS.users[s.req].asset) + '</div>';
      return tabs + '<div class="ra-split">' + screen + panel + '</div>';
    },
    after(w) { if (w.st.tab === 'cmd') { const o = w.body.querySelector('.tout'); if (o) o.scrollTop = o.scrollHeight; } },
    actions: {
      connect(w) {
        const t = DS.active(), s = DS.sc(t);
        const host = (w.body.querySelector('[data-k="ra-host-' + t.tid + '"]').value || '').trim().toUpperCase();
        if (host !== DS.users[s.req].asset && host !== s.ci) { w.st.err = host ? 'Le poste ' + host + ' n’est pas lié à ce ticket. Vérifie le nom du poste du demandeur.' : 'Indique le nom du poste.'; UI.render('remote'); return; }
        const err = DS.remoteConnect(t);
        w.st.err = err; w.st.last = null;
        if (!err) UI.termBuf('ra-' + t.tid, 'Windows PowerShell\nSession administrateur ouverte sur ' + host + '.\n');
        UI.render('remote');
      },
      disc() { const t = DS.active(); t.remote = false; DS.log(t, 'sys', 'Session d’assistance à distance fermée.'); DS.after(t); },
      tab(w, d) { w.st.tab = d.t; UI.render('remote'); setTimeout(() => focusTerm(w), 20); },
      act(w, d) { const t = DS.active(); const a = DS.remoteActs(t).find(x => x.id === d.id); const r = DS.doAct(t, a); w.st.last = { l: a.l, r }; UI.render('remote'); },
      tfocus(w, d, el, e) { if (!e.target.closest('input')) focusTerm(w); },
      hist(w, d, el, e) { UI.termHist(el, e); },
      run(w, d, el) {
        const t = DS.active();
        UI.termRun(w, el, 'PS C:\\Windows\\system32> ', cmd => {
          const ctx = DS.termCtx(t);
          const ad = adCmdlets(cmd, t, x => DS.flag(t, x));
          if (ad && ad.alias) return DS.runCommand(ad.alias, ctx);
          if (ad != null) return { out: ad };
          return DS.runCommand(cmd, ctx);
        });
        DS.after(t);
      }
    }
  });

  /* =========================== POWERSHELL LOCAL =========================== */
  UI.reg('ps', {
    title: 'Windows PowerShell', short: 'PowerShell', color: '#1f3d7a', icon: 'ps', w: 820, h: 500, x: 170, y: 90, cls: 'w-term', keys: 'terminal cmd invite commande ping',
    init() { UI.termBuf('ps-local', 'Windows PowerShell\nModule ActiveDirectory chargé (RSAT). Tape « help » pour les commandes simulées.\nCmdlets AD : Get-ADUser <login> -Properties *, Search-ADAccount -LockedOut,\nUnlock-ADAccount <login>, Get-ADPrincipalGroupMembership <login>, Add-ADGroupMember <groupe> -Members <login>\n'); },
    render() { return UI.termHtml('ps-local', 'PS C:\\Users\\tech.support> ', 'ps full'); },
    after(w) { const o = w.body.querySelector('.tout'); if (o) o.scrollTop = o.scrollHeight; },
    actions: {
      tfocus(w, d, el, e) { if (!e.target.closest('input')) focusTerm(w); },
      hist(w, d, el, e) { UI.termHist(el, e); },
      run(w, d, el) {
        const t = DS.active();
        const p = DS.defaultProfile('PC-SUPPORT-01');
        if (t) { const m = DS.sc(t).machine ? DS.sc(t).machine(DS.F(t)) : {}; if (m && m.down) p.down = m.down; }
        const set = x => { if (t) DS.flag(t, x); };
        const ctx = { profile: p, setFlag: set, findUser: login => { const all = DS.adUsers(t); const k = Object.keys(all).find(id => all[id].login === login.toLowerCase()); return k ? all[k] : null; } };
        UI.termRun(w, el, 'PS C:\\Users\\tech.support> ', cmd => {
          const ad = adCmdlets(cmd, t, set);
          if (ad && ad.alias) return DS.runCommand(ad.alias, ctx);
          if (ad != null) return { out: ad };
          return DS.runCommand(cmd, ctx);
        });
        if (t) DS.after(t); else UI.render('ps');
      }
    }
  });

  /* =========================== PUTTY (SSH) =========================== */
  UI.reg('putty', {
    title: 'PuTTY', short: 'PuTTY (SSH)', color: '#4a5260', icon: 'putty', w: 860, h: 540, x: 200, y: 60, cls: 'w-term', keys: 'ssh linux debian serveur',
    init(w) { w.st = { phase: 'config', sess: null }; },
    titleExtra(w) { return w.st.phase === 'session' ? 'tech@' + w.st.sess.host + ': ' + (w.st.sess.cwd === '/home/tech' ? '~' : w.st.sess.cwd) : 'Configuration'; },
    render(w) {
      if (w.st.phase === 'config') {
        const t = DS.active();
        const sug = t && DS.sc(t).ssh ? DS.sc(t).ssh.host : '';
        return '<div class="putty"><div class="pt-tree"><div class="label">Catégorie :</div><div class="tn on">Session</div><div class="tn l2">Journalisation</div><div class="tn">Terminal</div><div class="tn">Fenêtre</div><div class="tn">Connexion</div><div class="tn l2">SSH</div></div>' +
          '<div class="pt-main"><fieldset><legend>Indique la destination de la connexion</legend><div class="two"><label class="field"><span>Nom d’hôte (ou adresse IP)</span><input type="text" class="mono" data-k="pt-host" value="' + esc(sug) + '" data-enter="open"></label><label class="field"><span>Port</span><input type="text" class="mono" value="22" readonly></label></div><div class="row small"><label><input type="radio" checked> SSH</label><label><input type="radio" disabled> Telnet</label><label><input type="radio" disabled> Série</label></div></fieldset>' +
          '<fieldset><legend>Sessions enregistrées</legend><div class="pt-saved">' + Object.keys(DS.linuxHosts).map(h => '<button class="tn" data-a="pick" data-h="' + h + '">' + h + '</button>').join('') + '</div></fieldset>' +
          (w.st.err ? '<div class="callout bad">' + esc(w.st.err) + '</div>' : '') +
          '<div class="row"><span class="grow"></span><button class="btn primary" data-a="open">Ouvrir</button></div><p class="small muted">srv-intra-01 : serveur intranet (Debian). lab-debian : poste Linux de formation, sans risque.</p></div></div>';
      }
      const s = w.st.sess;
      const prompt = '<span class="lx-u">tech@' + esc(s.host) + '</span>:<span class="lx-p">' + esc(s.cwd === '/home/tech' ? '~' : s.cwd.replace(/^\/home\/tech/, '~')) + '</span>$ ';
      return UI.termHtml('pt-' + s.key, prompt, 'lx full');
    },
    after(w) { const o = w.body.querySelector('.tout'); if (o) o.scrollTop = o.scrollHeight; },
    actions: {
      pick(w, d) { const i = w.body.querySelector('[data-k="pt-host"]'); i.value = d.h; },
      open(w) {
        const host = (w.body.querySelector('[data-k="pt-host"]').value || '').trim().toLowerCase().replace(/\.ostral\.local$/, '');
        if (!host) return;
        if (!DS.linuxHosts[host]) { w.st.err = DS.hosts[host] ? 'Erreur réseau : connexion refusée (' + host + ' n’accepte pas SSH, c’est un serveur Windows).' : 'Erreur réseau : nom d’hôte inconnu « ' + host + ' ».'; UI.render('putty'); return; }
        const t = DS.active();
        const key = host + '-' + (t ? t.tid : 'free');
        UI.sessions = UI.sessions || {};
        const sess = UI.sessions[key] = UI.sessions[key] && UI.sessions[key].connected ? UI.sessions[key] : DS.newLinuxSession(host);
        sess.key = key;
        w.st.phase = 'session'; w.st.sess = sess; w.st.err = null;
        delete UI.terms['pt-' + key];
        UI.termBuf('pt-' + key, 'login as: tech\ntech@' + host + '’s password: ********\nLinux ' + host + ' ' + DS.linuxHosts[host].kernel + ' #1 SMP PREEMPT_DYNAMIC Debian x86_64\n\nThe programs included with the Debian GNU/Linux system are free software.\nDebian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent permitted by applicable law.\nLast login: Mon Nov  2 08:12:40 2026 from 10.20.6.15\n');
        if (t) { DS.flag(t, 'ssh:' + host); DS.log(t, 'sys', 'Connexion SSH à ' + host + '.'); DS.after(t); } else UI.render('putty');
        setTimeout(() => focusTerm(w), 30);
      },
      tfocus(w, d, el, e) { if (!e.target.closest('input')) focusTerm(w); },
      hist(w, d, el, e) { UI.termHist(el, e); },
      run(w, d, el) {
        const s = w.st.sess, t = DS.active();
        const prompt = '<span class="lx-u">tech@' + esc(s.host) + '</span>:<span class="lx-p">' + esc(s.cwd === '/home/tech' ? '~' : s.cwd.replace(/^\/home\/tech/, '~')) + '</span>$ ';
        const tied = t && DS.sc(t).ssh && DS.sc(t).ssh.host === s.host;
        const r = UI.termRun(w, el, prompt, cmd => DS.runLinux(cmd, { sess: s, state: () => DS.sshState(tied ? t : null, s.host), setFlag: x => { if (t) DS.flag(t, x); } }));
        if (r && r.exit) { w.st.phase = 'config'; }
        if (t) DS.after(t); else UI.render('putty');
      }
    }
  });

  /* =========================== INTERVENTION SUR SITE =========================== */
  UI.reg('site', {
    title: 'Intervention sur site', short: 'Intervention sur site', color: '#b7791f', icon: 'site', w: 760, h: 560, x: 230, y: 70, keys: 'atelier deplacement materiel preparation',
    render() {
      const t = DS.active();
      if (!t) return '<div class="ra-off"><h3>Aucun ticket actif</h3><p class="muted">Ouvre un ticket dans le Service Desk pour planifier une intervention.</p></div>';
      const s = DS.sc(t);
      if (t.status === 'new') return '<div class="ra-off"><h3>Ticket non pris en charge</h3><p class="muted">Prends le ticket en charge d’abord.</p></div>';
      const a = DS.assets[s.ci] || {}, u = DS.users[s.req];
      const far = a.site && !['Siège', 'Stock IT', 'Salle serveurs'].includes(a.site);
      if (!t.onsite) return '<div class="ra-off"><h3>' + (s.id === 'prep' ? 'Atelier de préparation' : 'Se déplacer') + '</h3><dl class="kv"><dt>Lieu</dt><dd>' + esc(s.id === 'prep' ? 'Stock IT – atelier, siège' : u.office) + '</dd><dt>Matériel</dt><dd class="mono">' + esc(s.ci) + ' · ' + esc(a.model || '') + '</dd><dt>Trajet estimé</dt><dd>' + (far ? '30 min (site distant)' : '6 min') + '</dd></dl>' +
        '<p class="small muted">Un déplacement prend du temps sur le délai du ticket : quand le problème peut se régler à distance ou par téléphone, c’est souvent plus rapide.</p><button class="btn primary" data-a="go">' + (s.id === 'prep' ? 'Aller à l’atelier' : 'Se rendre sur place') + '</button></div>';
      const list = s.site || [];
      if (!list.length) return '<div class="ra-off"><h3>Sur place</h3><p>Tu es sur place auprès de ' + esc(u.name) + '. Rien de particulier à constater physiquement : ce problème se traite avec les outils logiciels (AD, prise en main, terminal) ou par téléphone.</p></div>';
      const groups = {};
      list.forEach(x => { (groups[x.g] = groups[x.g] || []).push(x); });
      return '<div class="site"><div class="site-h">Sur place : <b>' + esc(s.id === 'prep' ? 'atelier du stock IT' : u.office) + '</b> · <span class="mono">' + esc(s.ci) + '</span></div><div class="site-b" data-sk="site">' + Object.keys(groups).map(g => '<div class="actgroup"><div class="label">' + esc(g) + '</div>' + groups[g].map(x => '<div class="site-a"><button class="actbtn' + (t.done['site:' + x.id] ? ' done' : '') + '" data-a="do" data-id="' + x.id + '">' + esc(x.l) + '</button>' + (t.done['site:' + x.id] ? '<div class="result">' + esc(t.done['site:' + x.id]) + '</div>' : '') + '</div>').join('') + '</div>').join('') + '</div></div>';
    },
    actions: {
      go() { DS.goSite(DS.active()); },
      do(w, d) { const t = DS.active(); DS.doAct(t, DS.sc(t).site.find(x => x.id === d.id), 'site'); }
    }
  });

  /* =========================== SUPERVISION =========================== */
  const flagMonitor = () => { const t = DS.active(); if (t && t.status !== 'new' && !DS.F(t)('monitor:view')) { DS.flag(t, 'monitor:view'); DS.after(t); } };
  UI.reg('monitor', {
    title: 'Supervision', short: 'Supervision', color: '#3f8f7a', icon: 'monitor', w: 860, h: 520, x: 140, y: 80, keys: 'zabbix centreon serveurs etat',
    init() { setTimeout(flagMonitor, 0); },
    onFocus() { setTimeout(flagMonitor, 0); },
    render() {
      const rows = DS.monitorHosts(DS.active());
      const down = rows.filter(r => r.st === 'down').length;
      const c = DS.clockText();
      return UI.browser('https://supervision.ostral.local/hotes', '<div class="mo-top"><b>Supervision</b><span>Hôtes : ' + rows.length + '</span><span class="' + (down ? 'bad-t' : 'ok-t') + '">' + (down ? down + ' en alerte' : 'tous opérationnels') + '</span><span class="grow"></span><button class="btn sm" data-a="refresh">' + svg('refresh') + 'Actualiser</button></div>' +
        '<div class="tablewrap"><table class="grid"><thead><tr><th>État</th><th>Hôte</th><th>Rôle</th><th>Dernier contrôle</th><th>Détail</th></tr></thead><tbody>' + rows.map(r => '<tr class="' + (r.st === 'down' ? 'sus' : '') + '"><td><span class="led ' + r.st + '"></span>' + (r.st === 'down' ? 'CRITIQUE' : 'OK') + '</td><td class="mono">' + esc(r.host) + '</td><td>' + esc(r.desc) + '</td><td class="mono">' + c.time + '</td><td>' + esc(r.msg) + '</td></tr>').join('') + '</tbody></table></div>');
    },
    actions: { refresh() { flagMonitor(); UI.render('monitor'); } }
  });

  /* =========================== WIKI IT =========================== */
  UI.reg('wiki', {
    title: 'Wiki IT', short: 'Wiki IT', color: '#7a5a3a', icon: 'wiki', w: 980, h: 640, x: 90, y: 24, keys: 'documentation base connaissances procedure',
    init(w, arg) { w.st = { id: null, q: '' }; this.onArg(w, arg); },
    onArg(w, arg) { if (arg && arg.id) this.actions.art(w, { id: arg.id }); },
    render(w) {
      const kb = DS.kb || [];
      const q = DS.norm(w.st.q);
      const list = kb.filter(a => !q || DS.norm(a.title + ' ' + a.summary + ' ' + a.cat).includes(q));
      const cats = [...new Set(list.map(a => a.cat))];
      const nav = '<aside class="wk-nav" data-sk="wknav"><input type="search" data-k="wk-q" data-in="q" placeholder="Rechercher dans le wiki"><button class="wk-home' + (!w.st.id ? ' on' : '') + '" data-a="home">Accueil</button>' + cats.map(c => '<div class="label">' + esc(c) + '</div>' + list.filter(a => a.cat === c).map(a => '<button class="' + (w.st.id === a.id ? 'on' : '') + '" data-a="art" data-id="' + a.id + '">' + esc(a.title) + (DS.state.kbRead[a.id] ? '<span class="rd">lu</span>' : '') + '</button>').join('')).join('') + '</aside>';
      let main;
      const a = w.st.id && kb.find(x => x.id === w.st.id);
      if (a) main = '<article class="wk-art" data-sk="wkart"><div class="label">' + esc(a.cat) + ' · ' + a.minutes + ' min de lecture</div><h2>' + esc(a.title) + '</h2><p class="lead">' + esc(a.summary) + '</p><div class="prose">' + a.body + '</div></article>';
      else {
        const start = ['methode', 'itil', 'priorite', 'identite', 'communication', 'labo-medical', 'linux', 'entretien'].map(id => kb.find(x => x.id === id)).filter(Boolean);
        main = '<article class="wk-art"><h2>Wiki du support IT</h2><p class="lead">Procédures, méthodes et fiches techniques de l’équipe. ' + Object.keys(DS.state.kbRead).length + ' article(s) lu(s) sur ' + kb.length + '.</p><div class="label">Pour bien démarrer</div><div class="wk-cards">' + start.map(x => '<button class="wk-card" data-a="art" data-id="' + x.id + '"><b>' + esc(x.title) + '</b><span>' + esc(x.summary) + '</span></button>').join('') + '</div></article>';
      }
      return UI.browser('https://wiki.ostral.local/support' + (a ? '/' + a.id : ''), '<div class="wk">' + nav + main + '</div>');
    },
    actions: {
      q(w, d, el) { w.st.q = el.value; UI.render('wiki'); },
      home(w) { w.st.id = null; UI.render('wiki'); },
      art(w, d) {
        w.st.id = d.id;
        if (!DS.state.kbRead[d.id]) { DS.state.kbRead[d.id] = Date.now(); DS.state.xp += 5; DS.checkBadges(); }
        const t = DS.active();
        if (t) { DS.flag(t, 'kb:' + d.id); DS.after(t); } else { DS.save(); UI.refresh(); }
        const art = w.body.querySelector('.wk-art'); if (art) art.scrollTop = 0;
      }
    }
  });
})();
