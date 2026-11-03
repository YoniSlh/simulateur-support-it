/* DeskSim — Espace formation : suivi des performances, bilans, quiz, labo, réglages */
(function () {
  const UI = DS.UI, esc = UI.esc, svg = UI.svg;
  const SECS = [['q', 'Qualification', 'Type, catégorie et priorité justes'], ['d', 'Diagnostic', 'Les bonnes questions et les bons tests'], ['r', 'Résolution', 'Corriger, ou escalader au bon endroit'], ['s', 'Sécurité & procédure', 'Identité, accords, aucun raccourci dangereux'], ['c', 'Communication', 'Message clair, note utile, vérification']];
  const pct = (a) => Math.round(a[0] / a[1] * 100);
  const avg = arr => arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : null;
  const stars = n => '<span class="stars" aria-label="' + n + ' sur 5">' + '★★★★★'.slice(0, n) + '<span class="off">' + '★★★★★'.slice(0, 5 - n) + '</span></span>';

  DS.laboEx = [
    { id: 'w_ip', os: 'win', t: 'Affiche la configuration IP de ton poste', how: 'ipconfig', f: 'cmd:ipconfig' },
    { id: 'w_all', os: 'win', t: 'Trouve l’adresse MAC et les serveurs DNS', how: 'ipconfig /all', f: 'cmd:ipconfig_all' },
    { id: 'w_host', os: 'win', t: 'Affiche le nom de ton poste', how: 'hostname', f: 'cmd:hostname' },
    { id: 'w_ping', os: 'win', t: 'Teste la connexion vers le serveur srv-fic-01', how: 'ping srv-fic-01', f: 'ping:srv-fic-01' },
    { id: 'w_ns', os: 'win', t: 'Trouve l’adresse IP de intranet.ostral-bio.fr', how: 'nslookup intranet.ostral-bio.fr', f: 'nslookup:intranet.ostral-bio.fr' },
    { id: 'w_tnc', os: 'win', t: 'Vérifie que le port 443 de l’intranet répond', how: 'Test-NetConnection intranet.ostral-bio.fr -Port 443', f: 'cmd:tncport' },
    { id: 'w_flush', os: 'win', t: 'Vide le cache DNS du poste', how: 'ipconfig /flushdns', f: 'cmd:flushdns' },
    { id: 'w_grp', os: 'win', t: 'Affiche les groupes de ton compte', how: 'whoami /groups', f: 'cmd:whoami_groups' },
    { id: 'w_gp', os: 'win', t: 'Force l’application des stratégies de groupe', how: 'gpupdate /force', f: 'cmd:gpupdate' },
    { id: 'w_task', os: 'win', t: 'Liste les processus, puis les plus gourmands en CPU', how: 'Get-Process | Sort-Object CPU -Descending', f: 'cmd:topcpu' },
    { id: 'w_spool', os: 'win', t: 'Vérifie l’état du service Spouleur', how: 'Get-Service Spooler', f: 'getservice:spooler' },
    { id: 'w_disk', os: 'win', t: 'Vérifie l’espace libre du disque C:', how: 'Get-PSDrive C', f: 'cmd:disk' },
    { id: 'w_aduser', os: 'win', t: 'Affiche la fiche AD complète de camille.roussel', how: 'Get-ADUser camille.roussel -Properties *', f: 'ps:getaduser' },
    { id: 'w_locked', os: 'win', t: 'Liste les comptes verrouillés du domaine', how: 'Search-ADAccount -LockedOut', f: 'ps:lockedout' },
    { id: 'l_pwd', os: 'lx', t: 'Affiche le dossier où tu te trouves', how: 'pwd', f: 'lx:pwd' },
    { id: 'l_ls', os: 'lx', t: 'Liste le contenu du dossier en format détaillé', how: 'ls -l', f: 'lx:ls' },
    { id: 'l_cat', os: 'lx', t: 'Lis le fichier bienvenue.txt', how: 'cat bienvenue.txt', f: 'lx:cat:/home/tech/bienvenue.txt' },
    { id: 'l_grep', os: 'lx', t: 'Affiche seulement les lignes ERROR de logs/app.log', how: 'grep ERROR logs/app.log', f: 'lx:grep' },
    { id: 'l_wc', os: 'lx', t: 'Compte ces lignes ERROR avec un tube', how: 'grep ERROR logs/app.log | wc -l', f: 'lx:wc' },
    { id: 'l_df', os: 'lx', t: 'Affiche l’espace disque en format lisible', how: 'df -h', f: 'lx:df' },
    { id: 'l_free', os: 'lx', t: 'Affiche la mémoire disponible', how: 'free -h', f: 'lx:free' },
    { id: 'l_ip', os: 'lx', t: 'Affiche l’adresse IP de la machine', how: 'ip a', f: 'lx:ipa' },
    { id: 'l_ping', os: 'lx', t: 'Envoie 4 pings à srv-dc-01', how: 'ping -c 4 srv-dc-01', f: 'lx:ping:srv-dc-01' },
    { id: 'l_svc', os: 'lx', t: 'Vérifie l’état du service d’impression cups', how: 'systemctl status cups', f: 'lx:status:cups' },
    { id: 'l_jr', os: 'lx', t: 'Lis les journaux du service cups', how: 'journalctl -u cups', f: 'lx:journal:cups' },
    { id: 'l_rs', os: 'lx', t: 'Redémarre le service cups avec les droits admin', how: 'sudo systemctl restart cups', f: 'lx:restart:cups' },
    { id: 'l_lp', os: 'lx', t: 'Affiche l’état des imprimantes', how: 'lpstat -p', f: 'lx:lpstat' },
    { id: 'l_for', os: 'lx', t: 'Pingue chaque serveur de serveurs.txt avec une boucle', how: 'for h in $(cat serveurs.txt); do ping -c 1 $h; done', f: 'lx:for' }
  ];

  /* ---------- Graphiques (SVG, une teinte) ---------- */
  function lineChart(hist) {
    const W = 660, H = 230, L = 34, R = 12, T = 14, B = 30;
    const ex = hist.length < 2;
    const data = ex ? [52, 61, 58, 70, 66, 78, 74, 85] : hist.map(h => h.total);
    const n = data.length;
    const x = i => L + (n === 1 ? 0 : i * (W - L - R) / (n - 1));
    const y = v => T + (100 - v) * (H - T - B) / 100;
    const ma = data.map((v, i) => { const s = data.slice(Math.max(0, i - 4), i + 1); return s.reduce((a, b) => a + b, 0) / s.length; });
    const path = arr => arr.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    const grid = [0, 25, 50, 75, 100].map(v => '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="gl' + (v === 75 ? ' goal' : '') + '"/><text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" class="ax" text-anchor="end">' + v + '</text>').join('');
    const step = Math.max(1, Math.ceil(n / 10));
    const xl = data.map((v, i) => (i % step === 0 || i === n - 1) ? '<text x="' + x(i) + '" y="' + (H - 10) + '" class="ax" text-anchor="middle">' + (i + 1) + '</text>' : '').join('');
    const dots = data.map((v, i) => '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="4.5" class="dot"/>').join('');
    const hits = ex ? '' : data.map((v, i) => '<rect x="' + (x(i) - (W - L - R) / Math.max(1, n - 1) / 2) + '" y="' + T + '" width="' + Math.max(8, (W - L - R) / Math.max(1, n - 1)) + '" height="' + (H - T - B) + '" class="hit" data-i="' + i + '"/>').join('');
    return '<div class="chart' + (ex ? ' example' : '') + '"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Score par ticket">' + grid +
      '<text x="' + (W - R) + '" y="' + (y(75) - 5) + '" class="ax goal-t" text-anchor="end">objectif 75</text>' +
      '<path d="' + path(data) + '" class="ln-raw"/><path d="' + path(ma) + '" class="ln-ma"/>' + dots + '<line class="xh" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" hidden/>' + hits + xl +
      '<text x="' + ((W + L) / 2) + '" y="' + (H) + '" class="ax" text-anchor="middle">tickets, dans l’ordre</text></svg>' +
      (ex ? '<div class="ex-badge">Exemple : ta courbe apparaît après 2 tickets</div>' : '') + '<div class="tip" hidden></div></div>' +
      '<div class="legend"><span><i class="lg-dot"></i>Score du ticket</span><span><i class="lg-line"></i>Moyenne sur 5 tickets</span></div>';
  }
  function spark(vals) {
    if (vals.length < 2) return '<svg viewBox="0 0 120 32" class="spark"><line x1="0" x2="120" y1="30" y2="30" class="gl"/></svg>';
    const x = i => 2 + i * 116 / (vals.length - 1), y = v => 30 - v * 0.28;
    return '<svg viewBox="0 0 120 32" class="spark" aria-hidden="true"><line x1="0" x2="120" y1="30" y2="30" class="gl"/><path d="' + vals.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ') + '" class="ln-ma"/><circle cx="' + x(vals.length - 1) + '" cy="' + y(vals[vals.length - 1]) + '" r="3" class="dot"/></svg>';
  }

  UI.reg('training', {
    title: 'Espace formation', short: 'Espace formation', color: '#c2453a', icon: 'training', w: 1060, h: 680, x: 60, y: 10, keys: 'suivi progression stats quiz labo bilan',
    init(w, arg) { w.st = { tab: 'dash', idx: null, os: 'win' }; this.onArg(w, arg); },
    onArg(w, arg) { if (!arg) return; if (arg.tab) w.st.tab = arg.tab; if (arg.idx != null) w.st.idx = arg.idx; },
    titleExtra(w) { return { dash: 'Mon suivi', bilans: 'Bilans', quiz: 'Quiz', labo: 'Labo commandes', reglages: 'Réglages' }[w.st.tab]; },
    render(w) {
      const tabs = [['dash', 'Mon suivi'], ['bilans', 'Bilans des tickets'], ['quiz', 'Quiz'], ['labo', 'Labo commandes'], ['reglages', 'Réglages']].map(([id, l]) => '<button class="' + (w.st.tab === id ? 'on' : '') + '" data-a="tab" data-t="' + id + '">' + l + '</button>').join('');
      const body = this[w.st.tab](w);
      return '<div class="tr"><nav class="tr-nav">' + tabs + '</nav><div class="tr-body" data-sk="tr-' + w.st.tab + '">' + body + '</div></div>';
    },
    after(w) {
      const ch = w.body.querySelector('.chart:not(.example)');
      if (!ch || ch.dataset.bound) return;
      ch.dataset.bound = 1;
      const tip = ch.querySelector('.tip'), xh = ch.querySelector('.xh'), svgEl = ch.querySelector('svg');
      const hist = DS.state.history;
      ch.addEventListener('pointerover', e => {
        const r = e.target.closest('.hit');
        if (!r) return;
        const i = +r.dataset.i, h = hist[i];
        const cx = +r.getAttribute('x') + +r.getAttribute('width') / 2;
        xh.setAttribute('x1', cx); xh.setAttribute('x2', cx); xh.hidden = false;
        tip.hidden = false;
        tip.innerHTML = '<b>Ticket ' + (i + 1) + ' · ' + h.total + '/100</b><span>' + esc(h.title) + '</span><span class="muted">' + new Date(h.date).toLocaleDateString('fr-FR') + ' · note ' + h.grade + (h.hints ? ' · ' + h.hints + ' indice(s)' : '') + '</span>';
        const box = svgEl.getBoundingClientRect(), cb = ch.getBoundingClientRect();
        const px = box.left - cb.left + cx / 660 * box.width;
        tip.style.left = Math.max(4, Math.min(cb.width - 230, px - 110)) + 'px';
      });
      ch.addEventListener('pointerleave', () => { tip.hidden = true; xh.hidden = true; });
    },

    dash(w) {
      const st = DS.state, h = st.history, lv = DS.level(st.xp);
      const last = h.slice(-10);
      const scoreAvg = avg(last.map(x => x.total));
      const slaOk = h.length ? Math.round(h.filter(x => !x.late).length / h.length * 100) : null;
      const sat = avg(h.map(x => x.stars));
      const kpi = (v, l, s) => '<div class="kpi"><span class="label">' + l + '</span><span class="v">' + v + '</span><span class="s">' + s + '</span></div>';
      const head = '<div class="tr-hello"><div><h2>' + (st.name ? 'Bonjour ' + esc(st.name) : 'Mon suivi') + '</h2><p class="muted">' + esc(lv.name) + (lv.next ? ' · encore ' + lv.toNext + ' XP pour « ' + esc(lv.next) + ' »' : ' · niveau maximum') + '</p></div><div class="xp"><div class="xpbar"><i style="width:' + lv.pct + '%"></i></div><span class="mono">' + st.xp + ' XP</span></div></div>';
      const kpis = '<div class="kpis">' + kpi(h.length, 'Tickets traités', h.length ? DS.scenarios.filter(s => h.some(x => x.sid === s.id)).length + ' scénarios sur ' + DS.scenarios.length : 'aucun pour l’instant') +
        kpi(scoreAvg == null ? '—' : Math.round(scoreAvg) + '<small>/100</small>', 'Score moyen', last.length ? 'sur les ' + last.length + ' derniers tickets' : 'traite un premier ticket') +
        kpi(slaOk == null ? '—' : slaOk + '<small> %</small>', 'Délais respectés', 'tickets clôturés dans le délai') +
        kpi(sat == null ? '—' : stars(Math.round(sat)), 'Satisfaction', sat == null ? 'note des demandeurs' : (Math.round(sat * 10) / 10).toString().replace('.', ',') + ' sur 5 en moyenne') + '</div>';
      // compétences
      const skills = SECS.map(([k, name, desc]) => {
        const vals = h.map(x => pct(x.secs[k]));
        const cur = avg(vals.slice(-5)), first = avg(vals.slice(0, Math.min(5, Math.max(1, vals.length - 5))));
        const delta = vals.length >= 6 ? Math.round(cur - first) : null;
        return '<div class="skill"><div class="sk-h"><b>' + name + '</b><span class="mono">' + (cur == null ? '—' : Math.round(cur) + ' %') + '</span></div>' + spark(vals) + '<div class="sk-f"><span class="muted small">' + desc + '</span>' + (delta != null ? '<span class="delta ' + (delta >= 0 ? 'up' : 'down') + '">' + (delta >= 0 ? '▲ +' : '▼ ') + delta + ' pts</span>' : '') + '</div></div>';
      }).join('');
      // points à travailler
      const miss = {};
      h.slice(-15).forEach(r => (r.items || []).forEach(it => { if (it.sec === 'q') return; const m = miss[it.label] = miss[it.label] || { seen: 0, ko: 0, sid: r.sid }; m.seen++; if (!it.ok) m.ko++; }));
      h.slice(-15).forEach(r => (r.pens || []).forEach(p => { const m = miss['⚠ ' + p.label] = miss['⚠ ' + p.label] || { seen: 0, ko: 0, pen: true }; m.seen++; m.ko++; }));
      const top = Object.keys(miss).filter(k => miss[k].ko).sort((a, b) => miss[b].ko - miss[a].ko || miss[b].ko / miss[b].seen - miss[a].ko / miss[a].seen).slice(0, 6);
      const weak = top.length ? '<ul class="weak">' + top.map(k => '<li><span>' + esc(k) + '</span><span class="mono muted">' + (miss[k].pen ? miss[k].ko + ' fois' : 'manqué ' + miss[k].ko + '/' + miss[k].seen) + '</span></li>').join('') + '</ul>' : '<p class="muted">Rien à signaler pour l’instant. Les étapes que tu oublies le plus souvent apparaîtront ici.</p>';
      // catégories
      const cats = DS.categories.map(c => { const v = h.filter(x => x.cat === c.id).map(x => x.total); return { c, n: v.length, a: avg(v) }; });
      const catBars = '<div class="bars">' + cats.map(o => '<div class="bar"><span>' + esc(o.c.label) + '</span><span class="track">' + (o.a != null ? '<i style="width:' + o.a + '%"></i>' : '') + '</span><span class="pct">' + (o.a != null ? Math.round(o.a) + ' · ' + o.n : '—') + '</span></div>').join('') + '</div>';
      // régularité (14 derniers jours)
      const days = [];
      for (let i = 13; i >= 0; i--) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push(d); }
      const counts = days.map(d => h.filter(x => { const e = new Date(x.date); e.setHours(0, 0, 0, 0); return e.getTime() === d.getTime(); }).length + st.quiz.runs.filter(x => { const e = new Date(x.date); e.setHours(0, 0, 0, 0); return e.getTime() === d.getTime(); }).length);
      const mx = Math.max(3, ...counts);
      const act = '<svg viewBox="0 0 280 74" class="actbars" role="img" aria-label="Activité des 14 derniers jours">' + counts.map((c, i) => '<rect x="' + (i * 20 + 2) + '" y="' + (58 - c / mx * 52) + '" width="16" height="' + Math.max(c ? 3 : 1, c / mx * 52) + '" rx="2" class="' + (c ? 'b' : 'b0') + '"><title>' + days[i].toLocaleDateString('fr-FR') + ' : ' + c + ' activité(s)</title></rect>').join('') + '<text x="2" y="72" class="ax">il y a 13 j</text><text x="278" y="72" class="ax" text-anchor="end">aujourd’hui</text></svg>';
      // scénarios
      const best = {};
      h.forEach(r => { best[r.sid] = Math.max(best[r.sid] == null ? -1 : best[r.sid], r.total); });
      const scen = '<div class="scen-grid">' + DS.scenarios.map(s => '<div class="scen' + (best[s.id] != null ? ' done' : '') + '"><span class="t">' + esc(s.title) + '</span><span class="small muted">' + esc(DS.categories.find(c => c.id === s.cat[0]).label) + ' · ' + '●●●'.slice(0, s.diff) + '<span class="off">' + '●●●'.slice(0, 3 - s.diff) + '</span></span><span class="sc">' + (best[s.id] != null ? 'meilleur : ' + best[s.id] + '/100' : 'à découvrir') + '</span></div>').join('') + '</div>';
      const badges = '<div class="badges">' + DS.badgeDefs.map(b => '<div class="badge' + (st.badges[b[0]] ? ' got' : '') + '"><span class="bic">' + (st.badges[b[0]] ? svg('check') : '') + '</span><b>' + esc(b[1]) + '</b><span>' + esc(b[2]) + '</span></div>').join('') + '</div>';
      const quizT = (DS.quizThemes || []).map(th => { const runs = st.quiz.runs.filter(r => r.theme === th.id); return '<div class="bar"><span>' + esc(th.label) + '</span><span class="track">' + (runs.length ? '<i style="width:' + Math.max(...runs.map(r => r.pct)) + '%"></i>' : '') + '</span><span class="pct">' + (runs.length ? Math.max(...runs.map(r => r.pct)) + ' %' : '—') + '</span></div>'; }).join('');
      return head + kpis + '<div class="tr-grid"><section class="card span2"><div class="ch"><h3>Score par ticket</h3><span class="muted small">Survole un point pour le détail</span></div>' + lineChart(h) + '</section>' +
        '<section class="card"><div class="ch"><h3>Points à travailler</h3><span class="muted small">15 derniers tickets</span></div>' + weak + '</section></div>' +
        '<section class="card"><div class="ch"><h3>Compétences</h3><span class="muted small">moyenne des 5 derniers tickets, évolution par rapport aux premiers</span></div><div class="skills">' + skills + '</div></section>' +
        '<div class="tr-grid"><section class="card"><div class="ch"><h3>Score moyen par catégorie</h3><span class="muted small">score · nombre</span></div>' + catBars + '</section><section class="card"><div class="ch"><h3>Régularité</h3><span class="muted small">tickets et quiz par jour</span></div>' + act + '<div class="ch" style="margin-top:12px"><h3>Meilleur score aux quiz</h3></div><div class="bars">' + quizT + '</div></section></div>' +
        '<section class="card"><div class="ch"><h3>Scénarios</h3><span class="muted small">' + Object.keys(best).length + ' sur ' + DS.scenarios.length + ' traités</span></div>' + scen + '</section>' +
        '<section class="card"><div class="ch"><h3>Badges</h3><span class="muted small">' + Object.keys(st.badges).length + ' sur ' + DS.badgeDefs.length + '</span></div>' + badges + '</section>';
    },

    bilans(w) {
      const h = DS.state.history;
      if (!h.length) return '<div class="empty">Aucun bilan pour l’instant. Clôture un ticket dans le Service Desk : son bilan détaillé s’affichera ici.</div>';
      const idx = w.st.idx != null && h[w.st.idx] ? w.st.idx : h.length - 1;
      const r = h[idx];
      const s = DS.byId[r.sid];
      const list = '<aside class="bl-list" data-sk="bl">' + h.map((x, i) => i).reverse().map(i => { const x = h[i]; return '<button class="' + (i === idx ? 'on' : '') + '" data-a="bil" data-i="' + i + '"><span class="grade ' + x.grade + '">' + x.grade + '</span><span><b>' + esc(x.title) + '</b><small>' + x.tid + ' · ' + new Date(x.date).toLocaleDateString('fr-FR') + '</small>' + (x.tuto ? '<small class="tg">mode tutoriel</small>' : '') + '</span><span class="mono">' + x.total + '</span></button>'; }).join('') + '</aside>';
      const C = 2 * Math.PI * 64;
      const ring = '<div class="ring"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="64" class="rg-bg"/><circle cx="75" cy="75" r="64" class="rg-v g' + r.grade + '" stroke-dasharray="' + (C * r.total / 100) + ' ' + C + '"/></svg><div class="rv"><b>' + r.total + '</b><span>sur 100</span></div></div>';
      const verdict = { A: 'Excellent travail, digne d’un technicien confirmé.', B: 'Bon traitement, quelques points à soigner.', C: 'Correct, mais des étapes importantes ont manqué.', D: 'Insuffisant : relis la procédure idéale ci-dessous.', E: 'À reprendre : rejoue ce scénario après avoir lu la fiche du wiki.' }[r.grade];
      const secs = '<div class="secs">' + SECS.map(([k, n]) => '<div class="sec"><span class="label">' + n + '</span><span class="n">' + r.secs[k][0] + '<small>/' + r.secs[k][1] + '</small></span><span class="mtr"><i style="width:' + pct(r.secs[k]) + '%"></i></span></div>').join('') + '</div>';
      const top = '<div class="bl-top">' + ring + '<div><div class="label">' + r.tid + ' · ' + esc(DS.users[r.req].name) + (r.tuto ? ' · <span class="tag info">fait en mode tutoriel, XP divisée par 2</span>' : '') + '</div><h2>' + esc(r.title) + '</h2><p>' + verdict + '</p><p class="small muted">Satisfaction du demandeur : ' + stars(r.stars) + ' · Durée : ' + DS.dur(r.age) + ' pour un délai de ' + DS.dur(r.target) + (r.late ? ' <b class="bad-t">(délai dépassé, −5)</b>' : '') + (r.hints ? ' · ' + r.hints + ' indice(s), −' + r.hintPen : '') + '</p></div></div>' + secs;
      if (!r.items) return '<div class="bl">' + list + '<div class="bl-main">' + top + '<p class="muted">Le détail des anciens bilans n’est plus conservé.</p></div></div>';
      const secName = { q: 'Qualification', d: 'Diagnostic', r: 'Résolution', c: 'Communication' };
      const items = ['q', 'd', 'r', 'c'].map(k => '<div class="ckg"><div class="label">' + secName[k] + '</div><div class="checklist">' + r.items.filter(i => i.sec === k).map(i => '<div class="ck ' + (i.ok ? 'ok' : 'ko') + '"><span class="ic">' + (i.ok ? '✓' : '✗') + '</span><span>' + esc(i.label) + '</span><span class="pts">' + (Math.round(i.pts * 10) / 10) + '/' + (Math.round(i.max * 10) / 10) + '</span></div>').join('') + '</div></div>').join('');
      const pens = r.pens.length ? '<div class="ckg"><div class="label">Sécurité, procédure et maladresses</div><div class="checklist">' + r.pens.map(p => '<div class="ck ko"><span class="ic">!</span><span>' + esc(p.label) + (p.grave ? ' <span class="tag bad">faute grave : note plafonnée à 40</span>' : '') + '</span><span class="pts">' + p.pts + '</span></div>').join('') + '</div></div>' : '<div class="ckg"><div class="label">Sécurité et procédure</div><p class="small ok-t">Aucune faute de sécurité ou de procédure.</p></div>';
      const ch = r.choices;
      const L = (arr, id) => { const x = arr.find(a => a.id === id); return x ? x.label : '—'; };
      const same = (a, b) => a === b ? '<span class="tag ok">juste</span>' : '<span class="tag bad">écart</span>';
      const cmp = '<table class="cmp"><thead><tr><th></th><th>Ton choix</th><th>Attendu</th><th></th></tr></thead><tbody>' +
        '<tr><th>Type</th><td>' + L(DS.types, ch.type) + '</td><td>' + L(DS.types, s.type[0]) + '</td><td>' + same(ch.type, s.type[0]) + '</td></tr>' +
        '<tr><th>Catégorie</th><td>' + L(DS.categories, ch.cat) + '</td><td>' + s.cat.map(c => L(DS.categories, c)).join(' ou ') + '</td><td>' + (s.cat.includes(ch.cat) ? '<span class="tag ok">juste</span>' : '<span class="tag bad">écart</span>') + '</td></tr>' +
        '<tr><th>Priorité</th><td>' + (ch.prio ? DS.prioLabels[ch.prio] : '—') + '</td><td>' + DS.prioLabels[ch.expPrio] + ' <small class="muted">(' + L(DS.impacts, s.impact) + ' × ' + L(DS.urgencies, s.urgency) + (DS.users[s.req].vip && !s.prio ? ', VIP +1' : '') + ')</small></td><td>' + same(ch.prio, ch.expPrio) + '</td></tr>' +
        '<tr><th>Issue</th><td>' + (ch.mode === 'escalate' ? 'Escalade · ' + L(DS.teams, ch.team) : 'Résolu par le support') + '</td><td>' + (s.out.mode === 'escalate' ? 'Escalade · ' + L(DS.teams, s.out.team) : 'Résolu par le support') + '</td><td>' + same(ch.mode + (ch.mode === 'escalate' ? ch.team : ''), s.out.mode + (s.out.mode === 'escalate' ? s.out.team : '')) + '</td></tr>' +
        '<tr><th>Cause</th><td>' + esc(ch.causeText) + '</td><td>' + esc(s.causes[0]) + '</td><td>' + same(ch.cause, 0) + '</td></tr>' +
        '<tr><th>Message</th><td colspan="2">' + esc(ch.closingText) + '</td><td>' + (ch.closing === 0 ? '<span class="tag ok">clair</span>' : ch.closing === 1 ? '<span class="tag warn">trop sec</span>' : '<span class="tag bad">à éviter</span>') + '</td></tr>' +
        (ch.closing !== 0 ? '<tr><th>Message conseillé</th><td colspan="3">' + esc(s.closing[0]) + '</td></tr>' : '') + '</tbody></table>';
      const kbl = (s.kb || []).map(id => { const a = DS.kb && DS.kb.find(x => x.id === id); return a ? '<button class="chip" data-a="kb" data-id="' + id + '">' + esc(a.title) + '</button>' : ''; }).join('');
      const open = DS.state.tickets.some(t => t.sid === s.id);
      return '<div class="bl">' + list + '<div class="bl-main">' + top +
        '<div class="bl-cols"><section class="card"><h3>Le détail de ta note</h3>' + items + pens + '</section>' +
        '<section class="card"><h3>Tes choix comparés à l’attendu</h3><div class="tablewrap">' + cmp + '</div><h3>La procédure idéale</h3><ol class="ideal">' + s.ideal.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol><h3>À retenir</h3><div class="lesson">' + s.lesson + '</div>' + (kbl ? '<div class="label">Pour approfondir</div><div class="chips">' + kbl + '</div>' : '') +
        '<div class="row" style="margin-top:14px"><button class="btn primary" data-a="replay" data-sid="' + s.id + '"' + (open ? ' disabled' : '') + '>' + (open ? 'Déjà dans ta file' : 'Rejouer ce scénario') + '</button></div></section></div></div></div>';
    },

    quiz(w) {
      const qz = w.st.qz;
      const runs = DS.state.quiz.runs;
      if (!qz) {
        const th = (DS.quizThemes || []).map(t => { const n = (DS.quiz || []).filter(q => q.theme === t.id).length; const r = runs.filter(x => x.theme === t.id); return '<button class="qtheme" data-a="qstart" data-th="' + t.id + '"><b>' + esc(t.label) + '</b><span class="muted">' + n + ' questions</span><span class="mono small">' + (r.length ? 'meilleur : ' + Math.max(...r.map(x => x.pct)) + ' %' : 'pas encore fait') + '</span></button>'; }).join('');
        const exam = runs.filter(x => x.theme === 'exam');
        return '<div class="tr-hello"><div><h2>Quiz</h2><p class="muted">Des questions de mise en situation, avec l’explication de chaque réponse.</p></div><button class="btn primary" data-a="qstart" data-th="exam">Examen blanc : 20 questions' + (exam.length ? ' (meilleur ' + Math.max(...exam.map(x => x.pct)) + ' %)' : '') + '</button></div><div class="quiz-themes">' + th + '</div>' +
          (runs.length ? '<section class="card"><h3>Derniers quiz</h3><div class="tablewrap"><table class="grid sm"><thead><tr><th>Date</th><th>Thème</th><th>Score</th></tr></thead><tbody>' + runs.slice(-8).reverse().map(r => '<tr><td>' + new Date(r.date).toLocaleDateString('fr-FR') + '</td><td>' + esc(r.theme === 'exam' ? 'Examen blanc' : (DS.quizThemes.find(t => t.id === r.theme) || {}).label) + '</td><td class="mono">' + r.pct + ' %</td></tr>').join('') + '</tbody></table></div></section>' : '');
      }
      const q = DS.quiz.find(x => x.id === qz.ids[qz.i]);
      if (qz.i >= qz.ids.length) {
        const ok = qz.ans.filter(a => a.ok).length, p = Math.round(ok / qz.ids.length * 100);
        return '<div class="qcard"><h3>Résultat : ' + ok + ' / ' + qz.ids.length + ' (' + p + ' %)</h3><p>' + (p >= 90 ? 'Excellent, tu maîtrises ce thème.' : p >= 70 ? 'Bien. Relis les explications des erreurs.' : 'Il reste du travail : lis les fiches du wiki puis recommence.') + '</p><div class="checklist">' + qz.ans.map(a => { const qq = DS.quiz.find(x => x.id === a.id); return '<div class="ck ' + (a.ok ? 'ok' : 'ko') + '"><span class="ic">' + (a.ok ? '✓' : '✗') + '</span><span>' + esc(qq.q) + (a.ok ? '' : '<br><small class="muted">Réponse : ' + esc(qq.opts[qq.ans]) + '</small>') + '</span><span></span></div>'; }).join('') + '</div><div class="row"><button class="btn primary" data-a="qstart" data-th="' + qz.theme + '">Recommencer</button><button class="btn" data-a="qquit">Autres thèmes</button></div></div>';
      }
      const a = qz.cur;
      const prog = '<div class="qprog">' + qz.ids.map((id, i) => '<i class="' + (i < qz.i ? (qz.ans[i].ok ? 'ok' : 'ko') : i === qz.i ? 'cur' : '') + '"></i>').join('') + '</div>';
      const opts = q.opts.map((o, i) => '<button class="qopt' + (a != null ? (i === q.ans ? ' right' : i === a ? ' wrong' : '') : '') + '" data-a="qans" data-i="' + i + '"' + (a != null ? ' disabled' : '') + '><span class="k">' + 'ABCD'[i] + '</span><span>' + esc(o) + '</span></button>').join('');
      return '<div class="qcard">' + prog + '<div class="label">Question ' + (qz.i + 1) + ' sur ' + qz.ids.length + ' · ' + esc((DS.quizThemes.find(t => t.id === q.theme) || {}).label || '') + '</div><h3>' + esc(q.q) + '</h3><div class="opts">' + opts + '</div>' +
        (a != null ? '<div class="callout ' + (a === q.ans ? 'ok' : 'bad') + '"><b>' + (a === q.ans ? 'Bonne réponse.' : 'Ce n’est pas ça.') + '</b> ' + esc(q.why) + '</div><div class="row"><button class="btn primary" data-a="qnext">' + (qz.i + 1 < qz.ids.length ? 'Question suivante' : 'Voir le résultat') + '</button></div>' : '') + '<button class="lnk small" data-a="qquit">Quitter le quiz</button></div>';
    },

    labo(w) {
      const os = w.st.os;
      const ex = DS.laboEx.filter(e => e.os === os);
      const done = ex.filter(e => DS.state.labo[e.id]).length;
      const cur = ex.find(e => !DS.state.labo[e.id]);
      const list = '<div class="exs">' + ex.map(e => '<div class="ex' + (DS.state.labo[e.id] ? ' done' : '') + (cur === e ? ' cur' : '') + '"><span class="ic">' + (DS.state.labo[e.id] ? '✓' : '') + '</span><div><span>' + esc(e.t) + '</span><details><summary>Voir la commande</summary><code>' + esc(e.how) + '</code></details></div></div>').join('') + '</div>';
      const term = os === 'win' ? UI.termHtml('lab-win', 'PS C:\\Users\\tech.support> ', 'ps', 'PowerShell – PC-SUPPORT-01 (labo, sans risque)') : UI.termHtml('lab-lx', '<span class="lx-u">tech@lab-debian</span>:<span class="lx-p">' + esc((UI.labLx && UI.labLx.cwd !== '/home/tech') ? UI.labLx.cwd.replace(/^\/home\/tech/, '~') : '~') + '</span>$ ', 'lx', 'SSH – tech@lab-debian (labo)');
      return '<div class="tr-hello"><div><h2>Labo commandes</h2><p class="muted">Entraîne-toi sur des machines de test : rien de ce que tu tapes ici n’a de conséquence. ' + done + ' / ' + ex.length + ' exercices réussis.</p></div><div class="seg"><button class="' + (os === 'win' ? 'on' : '') + '" data-a="los" data-os="win">Windows / PowerShell</button><button class="' + (os === 'lx' ? 'on' : '') + '" data-a="los" data-os="lx">Linux / bash</button></div></div>' +
        '<div class="labo">' + term + list + '</div>';
    },

    reglages(w) {
      const st = DS.state;
      return '<div class="set"><section class="card"><h3>Profil</h3><label class="field"><span>Prénom affiché dans les tickets</span><span class="row"><input type="text" data-k="set-name" value="' + esc(st.name) + '" maxlength="30"><button class="btn" data-a="savename">Enregistrer</button></span></label></section>' +
        '<section class="card"><h3>Entraînement</h3><label class="chkline"><input type="checkbox" data-ch="chrono"' + (st.settings.chrono ? ' checked' : '') + '> Horloge de service et délais (SLA) actifs. Désactive-la pour travailler sans pression de temps : aucune pénalité de délai.</label><label class="chkline"><input type="checkbox" data-ch="coach"' + (st.settings.coach ? ' checked' : '') + '> Ouvrir le Coach au démarrage</label><label class="chkline"><input type="checkbox" data-ch="tuto"' + (st.settings.tuto ? ' checked' : '') + '> Mode tutoriel : le Coach explique chaque étape du ticket, dans l’ordre. Les tickets faits ainsi rapportent moitié moins d’XP.</label></section>' +
        '<section class="card"><h3>Sauvegarde</h3><p>' + esc(DS.sync.note) + '.</p><p class="small muted">' + st.history.length + ' bilans, ' + st.quiz.runs.length + ' quiz, ' + Object.keys(st.kbRead).length + ' articles lus.</p></section>' +
        '<section class="card danger-zone"><h3>Recommencer à zéro</h3><p class="small">Efface tous les tickets, bilans, quiz, badges et l’expérience. Ton prénom est conservé.</p>' + (w.st.confirmReset ? '<div class="row"><b>Tout effacer définitivement ?</b><button class="btn danger" data-a="doreset">Oui, tout effacer</button><button class="btn" data-a="noreset">Annuler</button></div>' : '<button class="btn danger" data-a="askreset">Réinitialiser ma progression</button>') + '</section></div>';
    },

    actions: {
      tab(w, d) { w.st.tab = d.t; UI.render('training'); },
      bil(w, d) { w.st.idx = +d.i; UI.render('training'); const m = w.body.querySelector('.tr-body'); if (m) m.scrollTop = 0; },
      kb(w, d) { UI.open('wiki', { id: d.id }); },
      replay(w, d) { const t = DS.newTicket(d.sid); UI.open('sd', { tid: t.tid }); },
      qstart(w, d) {
        let pool = DS.quiz.filter(q => d.th === 'exam' || q.theme === d.th).map(q => q.id);
        pool = pool.sort(() => Math.random() - 0.5).slice(0, d.th === 'exam' ? 20 : 8);
        w.st.qz = { theme: d.th, ids: pool, i: 0, ans: [], cur: null }; UI.render('training');
      },
      qans(w, d) {
        const qz = w.st.qz, q = DS.quiz.find(x => x.id === qz.ids[qz.i]);
        qz.cur = +d.i; qz.ans.push({ id: q.id, ok: +d.i === q.ans });
        UI.render('training');
      },
      qnext(w) {
        const qz = w.st.qz;
        qz.i++; qz.cur = null;
        if (qz.i >= qz.ids.length) {
          const p = Math.round(qz.ans.filter(a => a.ok).length / qz.ids.length * 100);
          DS.state.quiz.runs.push({ theme: qz.theme, pct: p, date: Date.now(), n: qz.ids.length });
          DS.state.xp += Math.round(p / 10); DS.checkBadges(); DS.save();
        }
        UI.render('training');
      },
      qquit(w) { w.st.qz = null; UI.render('training'); },
      los(w, d) { w.st.os = d.os; UI.render('training'); },
      tfocus(w, d, el, e) { if (!e.target.closest('input')) { const i = w.body.querySelector('.tin input'); if (i) i.focus(); } },
      hist(w, d, el, e) { UI.termHist(el, e); },
      run(w, d, el) {
        const flags = {};
        const set = x => { flags[x] = 1; };
        if (w.st.os === 'win') {
          const ctx = { profile: DS.defaultProfile('PC-SUPPORT-01'), setFlag: set, findUser: login => { const all = DS.adUsers(null); const k = Object.keys(all).find(id => all[id].login === login.toLowerCase()); return k ? all[k] : null; } };
          UI.termRun(w, el, 'PS C:\\Users\\tech.support> ', cmd => { const ad = UI.adCmdlets(cmd, null, set); if (ad && ad.alias) return DS.runCommand(ad.alias, ctx); if (ad != null) return { out: ad }; return DS.runCommand(cmd, ctx); });
        } else {
          UI.labLx = UI.labLx && UI.labLx.connected ? UI.labLx : DS.newLinuxSession('lab-debian');
          const s = UI.labLx;
          const prompt = '<span class="lx-u">tech@lab-debian</span>:<span class="lx-p">' + esc(s.cwd === '/home/tech' ? '~' : s.cwd.replace(/^\/home\/tech/, '~')) + '</span>$ ';
          const r = UI.termRun(w, el, prompt, cmd => DS.runLinux(cmd, { sess: s, state: () => DS.sshState(null, 'lab-debian'), setFlag: set }));
          if (r && r.exit) { UI.labLx = null; UI.termBuf('lab-lx').lines.push({ c: 'out', t: 'Tape une commande pour te reconnecter.' }); }
        }
        let gained = 0;
        DS.laboEx.forEach(e => { if (!DS.state.labo[e.id] && flags[e.f]) { DS.state.labo[e.id] = Date.now(); gained++; } });
        if (gained) { DS.state.xp += 10 * gained; DS.checkBadges(); UI.toast('Exercice réussi', gained > 1 ? gained + ' exercices validés.' : 'Bien joué, passe au suivant.'); }
        DS.save();
        UI.render('training');
        const o = w.body.querySelector('.tout'); if (o) o.scrollTop = o.scrollHeight;
      },
      savename(w) { const v = w.body.querySelector('[data-k="set-name"]').value.trim(); if (v) { DS.state.name = v; DS.save(); UI.toast('Profil', 'Prénom enregistré.'); UI.refresh(); } },
      chrono(w, d, el) { DS.state.settings.chrono = el.checked; DS.save(); UI.refresh(); },
      coach(w, d, el) { DS.state.settings.coach = el.checked; DS.save(); },
      tuto(w, d, el) { DS.setTuto(el.checked); if (el.checked) UI.open('coach'); },
      askreset(w) { w.st.confirmReset = true; UI.render('training'); },
      noreset(w) { w.st.confirmReset = false; UI.render('training'); },
      doreset(w) { w.st.confirmReset = false; Object.keys(UI.terms).forEach(k => delete UI.terms[k]); DS.resetAll(); UI.toast('Progression réinitialisée', 'Trois nouveaux tickets t’attendent dans le Service Desk.'); }
    }
  });
  UI.termBuf('lab-win', 'Labo Windows : tape les commandes demandées à droite. « help » liste les commandes simulées.\n');
  UI.termBuf('lab-lx', 'Labo Linux (Debian 12). Tu es connecté en tant que tech dans /home/tech.\nTape « help » pour la liste des commandes simulées.\n');
})();
