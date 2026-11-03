/* DeskSim — applications de travail : Service Desk, Softphone, Active Directory, Console cloud, Coach */
(function () {
  const UI = DS.UI, esc = UI.esc, svg = UI.svg;
  const lbl = (arr, id) => { const x = arr.find(a => a.id === id); return x ? x.label : '—'; };
  const initials = n => n.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  UI.shuffle = (n, seed) => Array.from({ length: n }, (_, i) => i).sort((a, b) => hash(seed + a) - hash(seed + b));
  UI.browser = (url, inner, extra) => '<div class="browser"><div class="bbar"><span class="bnav">' + svg('back') + svg('fwd') + svg('refresh') + '</span><div class="burl">' + svg('padlock') + '<span>' + esc(url) + '</span></div>' + (extra || '') + '</div><div class="bview" data-sk="bv-' + esc(url) + '">' + inner + '</div></div>';
  UI.prio = p => p ? '<span class="prio p' + p + '">' + DS.prioLabels[p] + '</span>' : '<span class="prio p0">À qualifier</span>';
  UI.slaInfo = function (t) {
    const p = DS.myPrio(t);
    if (!p) return null;
    const target = DS.sla[p], left = target - t.age, pct = Math.min(100, t.age / target * 100);
    return { p, target, left, pct, cls: left < 0 ? 'late' : pct > 75 ? 'warn' : 'ok', text: left < 0 ? 'Dépassé de ' + DS.dur(-left) : DS.dur(left) + ' restantes' };
  };
  const statusTxt = { new: 'Nouveau', wip: 'En cours' };

  /* =========================== SERVICE DESK =========================== */
  UI.reg('sd', {
    title: 'Service Desk', short: 'Service Desk', color: '#2f6fde', icon: 'sd', w: 1080, h: 680, x: 70, y: 14, keys: 'tickets glpi incident',
    init(w, arg) { w.st = { view: 'list', tab: 'act', filter: 'all' }; this.onArg(w, arg); },
    onArg(w, arg) {
      if (!arg) return;
      if (arg.tid && DS.ticket(arg.tid)) { w.st.view = 'ticket'; w.st.tid = arg.tid; w.st.tab = 'act'; DS.setActive(arg.tid); }
      else if (arg.view) w.st.view = arg.view;
    },
    titleExtra(w) { const t = w.st.view === 'ticket' && DS.ticket(w.st.tid); return t ? t.tid : ''; },
    render(w) {
      if (w.st.view === 'ticket' && !DS.ticket(w.st.tid)) w.st.view = 'list';
      const v = w.st.view;
      const nav = [['list', 'File du groupe'], ['resolved', 'Résolus'], ['parc', 'Parc']].map(([id, l]) => '<button class="' + (v === id || (id === 'list' && v === 'ticket') ? 'on' : '') + '" data-a="nav" data-v="' + id + '">' + l + '</button>').join('');
      const top = '<div class="sd-top"><div class="sd-brand"><span class="logo-o sm"></span>Service Desk</div><nav class="sd-nav">' + nav + '</nav><div class="sd-user">' + esc(DS.state.name || 'Technicien') + ' · Support IT</div></div>';
      let inner = '';
      if (v === 'list') inner = this.list(w);
      if (v === 'ticket') inner = this.ticket(w, DS.ticket(w.st.tid));
      if (v === 'parc') inner = this.parc(w);
      if (v === 'resolved') inner = this.resolved(w);
      const url = 'https://servicedesk.ostral.local/' + (v === 'ticket' ? 'ticket/' + w.st.tid : v === 'parc' ? 'parc' : v === 'resolved' ? 'tickets?etat=resolu' : 'tickets?groupe=support-it');
      return UI.browser(url, top + '<div class="sd-body">' + inner + '</div>' + (w.st.modal ? this.modal(w) : ''));
    },
    list(w) {
      const st = DS.state;
      let rows = st.tickets.slice();
      if (w.st.filter === 'new') rows = rows.filter(t => t.status === 'new');
      if (w.st.filter === 'wip') rows = rows.filter(t => t.status === 'wip');
      rows.sort((a, b) => (DS.myPrio(a) || 9) - (DS.myPrio(b) || 9) || b.age - a.age);
      const cnt = k => st.tickets.filter(t => k === 'all' || t.status === k).length;
      const seg = [['all', 'Tous'], ['new', 'Nouveaux'], ['wip', 'En cours']].map(([k, l]) => '<button class="' + (w.st.filter === k ? 'on' : '') + '" data-a="filter" data-f="' + k + '">' + l + ' <span>' + cnt(k) + '</span></button>').join('');
      const body = rows.map(t => {
        const s = DS.sc(t), u = DS.users[s.req], sla = UI.slaInfo(t);
        return '<tr class="click" data-a="open" data-tid="' + t.tid + '"><td class="mono">' + t.tid + (t.tid === st.activeTid ? ' <span class="tag info">actif</span>' : '') + '</td><td>' + UI.prio(DS.myPrio(t)) + '</td><td><span class="st st-' + t.status + '">' + statusTxt[t.status] + '</span></td>' +
          '<td class="subj">' + esc(s.title) + (s.tuto ? ' <span class="tag info">Tutoriel</span>' : '') + '</td><td>' + esc(u.name) + '<small>' + esc(u.dept) + '</small></td><td>' + esc(s.channel) + '</td>' +
          '<td class="mono">' + DS.dur(t.age) + '</td><td>' + (sla ? '<span class="sla-t ' + sla.cls + '">' + sla.text + '</span>' : '<span class="muted">—</span>') + '</td></tr>';
      }).join('');
      const cards = rows.map(t => { const s = DS.sc(t), sla = UI.slaInfo(t); return '<button class="qc" data-a="open" data-tid="' + t.tid + '"><span class="r1"><span class="mono">' + t.tid + '</span>' + UI.prio(DS.myPrio(t)) + '</span><b>' + esc(s.title) + '</b><span class="muted">' + esc(DS.users[s.req].name) + ' · ' + statusTxt[t.status] + ' · ' + DS.dur(t.age) + (sla ? ' · ' + sla.text : '') + '</span></button>'; }).join('');
      return '<div class="sd-bar"><h2>File du groupe Support IT</h2><div class="seg">' + seg + '</div><span class="grow"></span><button class="btn" data-a="pull">' + svg('plus') + 'Prendre un ticket dans la file globale</button></div>' +
        (rows.length ? '<div class="tablewrap q-desk"><table class="grid"><thead><tr><th>Numéro</th><th>Priorité</th><th>État</th><th>Objet</th><th>Demandeur</th><th>Canal</th><th>Ouvert depuis</th><th>Délai (SLA)</th></tr></thead><tbody>' + body + '</tbody></table></div><div class="qcards">' + cards + '</div>'
          : '<div class="empty">Aucun ticket dans cette vue. Les nouveaux tickets arrivent tout seuls pendant ton service, ou clique « Prendre un ticket dans la file globale ».</div>') +
        '<p class="sd-foot">Le délai se calcule sur l’horloge de service à partir de la priorité que tu fixes. Tant que le ticket n’est pas qualifié, il n’a pas de délai affiché, mais le demandeur, lui, attend.</p>';
    },
    ticket(w, t) {
      const s = DS.sc(t), u = DS.user(s.req), f = DS.F(t), sla = UI.slaInfo(t);
      const ci = DS.assets[s.ci] || {};
      const sel = (k, arr, val, ph) => '<select data-k="' + k + '" data-ch="field" data-f="' + k + '"' + (t.status === 'new' ? ' disabled' : '') + '><option value="">' + ph + '</option>' + arr.map(o => '<option value="' + o.id + '"' + (val === o.id ? ' selected' : '') + ' title="' + esc(o.hint || '') + '">' + esc(o.label) + (o.hint ? ' – ' + esc(o.hint) : '') + '</option>').join('') + '</select>';
      const fv = t.fields;
      const head = '<div class="tk-head"><button class="lnk" data-a="nav" data-v="list">' + svg('back') + 'File</button><span class="mono tid">' + t.tid + '</span><span class="st st-' + t.status + '">' + statusTxt[t.status] + '</span>' + (s.tuto ? '<span class="tag info">Tutoriel guidé</span>' : '') + '<span class="grow"></span>' +
        (t.status === 'new' ? '<button class="btn primary" data-a="take">Prendre en charge</button>' : '') +
        '<button class="btn" data-a="call" ' + (t.status === 'new' ? 'disabled' : '') + '>' + svg('phone') + (t.call ? 'Appel en cours' : 'Appeler le demandeur') + '</button>' +
        (DS.state.settings.tuto ? '' : '<button class="btn" data-a="hint" ' + (t.status === 'new' ? 'disabled' : '') + ' title="Chaque indice retire 3 points">Indice (−3)</button>') +
        '<button class="btn' + (DS.state.settings.tuto ? ' tuto-on' : '') + '" data-a="tuto" title="Le Coach explique chaque étape, dans l’ordre">' + svg('coach') + 'Tutoriel : ' + (DS.state.settings.tuto ? 'activé' : 'désactivé') + '</button></div>' +
        (sla ? '<div class="sla"><div class="track"><i class="' + sla.cls + '" style="width:' + sla.pct + '%"></i></div><div class="meta"><span>' + DS.prioLabels[sla.p] + ' · délai cible ' + DS.slaText[sla.p] + '</span><span>' + sla.text + '</span></div></div>' : '<div class="sla-none">Pas encore de priorité : qualifie le ticket pour calculer son délai.</div>');
      const form = '<div class="tk-form"><div class="fcol">' +
        '<label><span>Demandeur</span><b><button class="lnk" data-a="tool" data-app="ad">' + esc(u.name) + '</button>' + (u.vip ? ' <span class="tag warn">VIP – comité de direction</span>' : '') + '</b></label>' +
        '<label><span>Fonction</span><b>' + esc(u.title) + ' · ' + esc(u.dept) + '</b></label>' +
        '<label><span>Localisation</span><b>' + esc(u.office) + '</b></label>' +
        '<label><span>Téléphone</span><b class="mono">' + esc(u.ext) + '</b></label>' +
        '<label><span>Élément de config.</span><b><button class="lnk mono" data-a="ci" data-ci="' + esc(s.ci) + '">' + esc(s.ci) + '</button> <small class="muted">' + esc(ci.model || '') + '</small></b></label>' +
        '<label><span>Canal</span><b>' + esc(s.channel) + '</b></label>' +
        '<label><span>Ouvert</span><b class="mono">' + DS.clockText(t.created < 0 ? 0 : t.created).date + ' ' + DS.clockText(t.created < 0 ? 0 : t.created).time + (t.created < 0 ? ' (avant ta prise de poste)' : '') + '</b></label>' +
        '</div><div class="fcol">' +
        '<label><span>Type</span>' + sel('type', DS.types, fv.type, '— Choisir —') + '</label>' +
        '<label><span>Catégorie</span>' + sel('cat', DS.categories, fv.cat, '— Choisir —') + '</label>' +
        '<label><span>Impact</span>' + sel('impact', DS.impacts, fv.impact, '— Choisir —') + '</label>' +
        '<label><span>Urgence</span>' + sel('urgency', DS.urgencies, fv.urgency, '— Choisir —') + '</label>' +
        '<label class="chkl"><span></span><span><input type="checkbox" data-ch="field" data-f="vip" ' + (fv.vip ? 'checked' : '') + (t.status === 'new' ? ' disabled' : '') + '> Relever d’un niveau (règle VIP)</span></label>' +
        '<label><span>Priorité</span><b>' + UI.prio(DS.myPrio(t)) + '</b></label>' +
        '<label><span>Groupe / affecté</span><b>Support IT · ' + (t.status === 'new' ? '<span class="muted">non affecté</span>' : esc(DS.state.name || 'Technicien')) + '</b></label>' +
        '</div></div>';
      const desc = '<div class="tk-desc"><div class="label">Objet</div><h3>' + esc(s.title) + '</h3><div class="label">Description du demandeur</div><p class="descr">' + esc(s.desc) + '</p>' +
        (s.attach ? '<button class="attach" data-a="attach">' + svg('folder') + esc(s.attach.name) + '</button>' : '') + '</div>';
      const tabs = '<div class="tabs"><button class="' + (w.st.tab === 'act' ? 'on' : '') + '" data-a="tab" data-t="act">Activité (' + t.act.length + ')</button><button class="' + (w.st.tab === 'res' ? 'on' : '') + '" data-a="tab" data-t="res">Résolution</button></div>';
      return head + '<div class="tk-cols"><div class="tk-main">' + form + desc + tabs + (w.st.tab === 'act' ? this.activity(w, t) : this.resolution(w, t)) + '</div></div>';
    },
    activity(w, t) {
      const items = t.act.map(a => {
        const c = DS.clockText(Math.max(0, a.at)).time;
        if (a.k === 'desc') return '<div class="ev ev-user"><div class="evh"><b>' + esc(a.who) + '</b> a ouvert le ticket · ' + c + '</div><div class="evb">' + esc(a.text) + '</div></div>';
        if (a.k === 'q') return '<div class="ev ev-tech"><div class="evh"><b>' + esc(a.who) + '</b> au téléphone · ' + c + '</div><div class="evb">' + esc(a.text) + '</div></div>';
        if (a.k === 'a') return '<div class="ev ev-user"><div class="evh"><b>' + esc(a.who) + '</b> · ' + c + '</div><div class="evb">' + esc(a.text) + '</div></div>';
        if (a.k === 'third') return '<div class="ev ev-third"><div class="evh"><b>' + esc(a.who) + '</b> · commentaire · ' + c + '</div><div class="evb">' + esc(a.text) + '</div></div>';
        if (a.k === 'note') return '<div class="ev ev-note"><div class="evh"><b>' + esc(a.who) + '</b> · note de travail (interne) · ' + c + '</div><div class="evb">' + esc(a.text) + '</div></div>';
        if (a.k === 'hint') return '<div class="ev ev-hint"><div class="evh"><b>Coach</b> · indice (−3 points) · ' + c + '</div><div class="evb">' + esc(a.text) + '</div></div>';
        if (a.k === 'attach') return '<div class="ev ev-sys"><span class="mono">' + c + '</span> Pièce jointe : ' + esc(a.text) + '</div>';
        return '<div class="ev ev-sys"><span class="mono">' + c + '</span> ' + esc(a.text) + '</div>';
      }).join('');
      return '<div class="stream" data-sk="stream" data-stick>' + items + '</div>' +
        '<div class="noteform"><textarea data-k="note-' + t.tid + '" placeholder="Note de travail interne : ce que tu as constaté, testé, fait…" rows="2"' + (t.status === 'new' ? ' disabled' : '') + '></textarea><button class="btn" data-a="note"' + (t.status === 'new' ? ' disabled' : '') + '>Publier la note</button></div>';
    },
    resolution(w, t) {
      const s = DS.sc(t);
      if (t.status === 'new') return '<div class="empty">Prends d’abord le ticket en charge.</div>';
      const k = 'res-' + t.tid;
      const modeEsc = w.st['mode-' + t.tid] === 'escalate';
      const causeOrder = UI.shuffle(s.causes.length, t.tid + 'c');
      const closeOrder = UI.shuffle(s.closing.length, t.tid + 'm');
      return '<div class="resform">' +
        '<div class="label">Issue du ticket</div><div class="radio-cards">' +
        '<label class="rcard"><input type="radio" name="' + k + '-mode" value="resolve" data-k="' + k + '-mode-r" data-ch="mode" data-m="resolve"' + (!modeEsc ? ' checked' : '') + '><span><b>Résoudre</b>Le problème est réglé ou la demande est traitée par le support.</span></label>' +
        '<label class="rcard"><input type="radio" name="' + k + '-mode" value="escalate" data-k="' + k + '-mode-e" data-ch="mode" data-m="escalate"' + (modeEsc ? ' checked' : '') + '><span><b>Escalader</b>Transférer à une équipe spécialisée, avec une note complète.</span></label></div>' +
        (modeEsc ? '<label class="field"><span>Équipe destinataire</span><select data-k="' + k + '-team"><option value="">— Choisir —</option>' + DS.teams.map(x => '<option value="' + x.id + '">' + esc(x.label) + ' – ' + esc(x.hint) + '</option>').join('') + '</select></label>' : '') +
        '<div class="label">Cause identifiée</div><div class="opts">' + causeOrder.map(i => '<label class="opt"><input type="radio" name="' + k + '-cause" value="' + i + '" data-k="' + k + '-cause-' + i + '"><span>' + esc(s.causes[i]) + '</span></label>').join('') + '</div>' +
        '<div class="label">Message envoyé au demandeur</div><div class="opts">' + closeOrder.map(i => '<label class="opt"><input type="radio" name="' + k + '-close" value="' + i + '" data-k="' + k + '-close-' + i + '"><span>' + esc(s.closing[i]) + '</span></label>').join('') + '</div>' +
        '<label class="field"><span>' + (modeEsc ? 'Note d’escalade (pour l’équipe destinataire)' : 'Note de résolution (interne)') + '</span><textarea data-k="' + k + '-note" rows="4" placeholder="' + (modeEsc ? 'Symptôme, périmètre, heure de début, tests effectués et résultats, urgence…' : 'Cause, actions réalisées, vérification faite avec l’utilisateur…') + '"></textarea></label>' +
        (w.st.err ? '<div class="callout bad">' + esc(w.st.err) + '</div>' : '') +
        '<div class="row"><button class="btn primary" data-a="close">' + (modeEsc ? 'Transférer le ticket' : 'Résoudre le ticket') + '</button><span class="muted small">Le ticket sera évalué et le bilan s’ouvrira dans l’Espace formation.</span></div></div>';
    },
    parc(w) {
      const ids = Object.keys(DS.assets);
      const sel = w.st.parcSel;
      const a = sel && DS.assets[sel];
      const rows = ids.map(id => { const x = DS.assets[id]; return '<tr class="click' + (sel === id ? ' sel' : '') + '" data-a="parcsel" data-id="' + id + '"><td class="mono">' + id + '</td><td>' + esc(x.kind) + '</td><td>' + esc(x.model) + '</td><td>' + esc(x.user === 'tech' ? 'Support IT' : x.user ? DS.users[x.user].name : '—') + '</td><td>' + esc(x.site) + '</td><td>' + esc(x.warranty) + '</td></tr>'; }).join('');
      const detail = a ? '<aside class="parc-d"><h3 class="mono">' + sel + '</h3><dl class="kv"><dt>Type</dt><dd>' + esc(a.kind) + '</dd><dt>Modèle</dt><dd>' + esc(a.model) + '</dd><dt>N° de série</dt><dd>' + esc(a.serial) + '</dd><dt>Système</dt><dd>' + esc(a.os) + '</dd><dt>Adresse IP</dt><dd>' + esc(a.ip) + '</dd><dt>Adresse MAC</dt><dd>' + esc(a.mac) + '</dd><dt>Utilisateur</dt><dd>' + esc(a.user === 'tech' ? 'Support IT' : a.user ? DS.users[a.user].name : '—') + '</dd><dt>Site</dt><dd>' + esc(a.site) + '</dd><dt>Garantie</dt><dd>' + esc(a.warranty) + '</dd></dl><div class="label">Historique</div><p class="small muted">' + (sel === 'PC-PAIL-03' ? '14/10/2026 – Remplacement de la souris (usure). ' : '') + 'Livraison et déploiement initial.</p></aside>' : '<aside class="parc-d empty">Sélectionne un élément pour voir sa fiche.</aside>';
      return '<div class="sd-bar"><h2>Parc informatique</h2><span class="muted">' + ids.length + ' éléments</span></div><div class="parc"><div class="tablewrap"><table class="grid"><thead><tr><th>Nom</th><th>Type</th><th>Modèle</th><th>Utilisateur</th><th>Site</th><th>Garantie</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + detail + '</div>';
    },
    resolved(w) {
      const h = DS.state.history.slice().reverse();
      if (!h.length) return '<div class="sd-bar"><h2>Tickets résolus</h2></div><div class="empty">Aucun ticket résolu pour l’instant.</div>';
      return '<div class="sd-bar"><h2>Tickets résolus</h2><span class="muted">' + h.length + '</span></div><div class="tablewrap"><table class="grid"><thead><tr><th>Numéro</th><th>Objet</th><th>Demandeur</th><th>Issue</th><th>Note</th><th></th></tr></thead><tbody>' +
        h.map((r, i) => '<tr class="click" data-a="bilan" data-i="' + (h.length - 1 - i) + '"><td class="mono">' + r.tid + '</td><td class="subj">' + esc(r.title) + '</td><td>' + esc(DS.users[r.req].name) + '</td><td>' + (DS.byId[r.sid].out.mode === 'escalate' ? 'Transféré' : 'Résolu') + '</td><td><span class="grade ' + r.grade + '">' + r.grade + '</span> <span class="mono">' + r.total + '/100</span></td><td><span class="lnk">Voir le bilan</span></td></tr>').join('') + '</tbody></table></div>';
    },
    modal(w) {
      const t = DS.ticket(w.st.tid);
      if (!t) return '';
      const a = DS.sc(t).attach;
      return '<div class="modal" data-a="closemodal"><div class="modal-c" data-a="noop"><div class="modal-h"><b>' + esc(a.name) + '</b><button class="wbtn" data-a="closemodal">' + svg('close') + '</button></div>' +
        '<div class="eml"><div class="hd"><span>De</span><span>' + esc(a.from) + '</span><span>À</span><span>' + esc(a.to) + '</span><span>Date</span><span>' + esc(a.date) + '</span><span>Objet</span><span>' + esc(a.subject) + '</span></div><div class="bd">' + a.body + '</div></div>' +
        '<p class="small muted">Pièce jointe ouverte en lecture seule : les liens sont désactivés.</p></div></div>';
    },
    actions: {
      nav(w, d) { w.st.view = d.v; w.st.err = null; UI.render('sd'); },
      filter(w, d) { w.st.filter = d.f; UI.render('sd'); },
      open(w, d) { w.st.view = 'ticket'; w.st.tid = d.tid; w.st.tab = 'act'; w.st.err = null; DS.setActive(d.tid); },
      pull() { const t = DS.requestTicket(); if (!t) UI.toast('File globale vide', 'Tous les scénarios sont déjà ouverts dans ta file.'); },
      take(w) { const t = DS.ticket(w.st.tid); DS.take(t); },
      field(w, d, el) {
        const t = DS.ticket(w.st.tid);
        const v = el.type === 'checkbox' ? el.checked : el.value;
        DS.saveFields(t, { [d.f]: v });
      },
      call(w) { const t = DS.ticket(w.st.tid); UI.open('phone'); if (!t.call) DS.call(t, true); },
      tuto() { const on = !DS.state.settings.tuto; DS.setTuto(on); if (on) UI.open('coach'); },
      hint(w) { const t = DS.ticket(w.st.tid); const h = DS.hint(t); if (h) { DS.log(t, 'hint', h); DS.save(); UI.open('coach'); UI.refresh(); } },
      tab(w, d) { w.st.tab = d.t; w.st.err = null; UI.render('sd'); },
      note(w) {
        const t = DS.ticket(w.st.tid);
        const ta = w.body.querySelector('[data-k="note-' + t.tid + '"]');
        const v = ta.value.trim();
        if (!v) return;
        ta.value = ''; ta.setAttribute('data-fresh', '');
        DS.addNote(t, v);
      },
      tool(w, d) { UI.open(d.app); },
      ci(w, d) {
        const t = DS.ticket(w.st.tid);
        if (DS.linuxHosts[d.ci]) { UI.open('putty'); return; }
        w.st.view = 'parc'; w.st.parcSel = d.ci; DS.flag(t, 'inv:' + d.ci); DS.after(t);
      },
      parcsel(w, d) { w.st.parcSel = d.id; const t = DS.active(); if (t) { DS.flag(t, 'inv:' + d.id); DS.after(t); } else UI.render('sd'); },
      attach(w) { const t = DS.ticket(w.st.tid); w.st.modal = true; DS.flag(t, 'attach_viewed'); DS.after(t); },
      closemodal(w) { w.st.modal = false; UI.render('sd'); },
      noop() { },
      mode(w, d) { w.st['mode-' + w.st.tid] = d.m; UI.render('sd'); },
      bilan(w, d) { UI.open('training', { tab: 'bilans', idx: +d.i }); },
      close(w) {
        const t = DS.ticket(w.st.tid), s = DS.sc(t), k = 'res-' + t.tid;
        const q = sel => w.body.querySelector(sel);
        const mode = w.st['mode-' + t.tid] === 'escalate' ? 'escalate' : 'resolve';
        const team = mode === 'escalate' ? (q('[data-k="' + k + '-team"]') || {}).value : null;
        const ci = q('input[name="' + k + '-cause"]:checked'), cl = q('input[name="' + k + '-close"]:checked');
        const note = (q('[data-k="' + k + '-note"]') || {}).value || '';
        const missing = [];
        if (!(t.fields.type && t.fields.cat && t.fields.impact && t.fields.urgency)) missing.push('qualifier le ticket (type, catégorie, impact, urgence)');
        if (mode === 'escalate' && !team) missing.push('choisir l’équipe destinataire');
        if (!ci) missing.push('choisir la cause');
        if (!cl) missing.push('choisir le message au demandeur');
        if (note.trim().length < 15) missing.push('rédiger la note (15 caractères minimum)');
        if (missing.length) { w.st.err = 'Avant de clôturer : ' + missing.join(', ') + '.'; UI.render('sd'); return; }
        if (t.call) DS.call(t, false);
        w.st.err = null;
        const rep = DS.close(t, { mode, team, cause: +ci.value, closing: +cl.value, note });
        w.st.view = 'list';
        UI.render('sd');
        UI.open('training', { tab: 'bilans', idx: DS.state.history.length - 1 });
        UI.toast('Ticket ' + rep.tid + ' clôturé', 'Note : ' + rep.total + '/100 (' + rep.grade + '). Le bilan est ouvert.');
      }
    }
  });

  /* =========================== SOFTPHONE =========================== */
  let phoneTimer = null;
  UI.reg('phone', {
    title: 'Softphone', short: 'Softphone', color: '#2e9d5b', icon: 'phone', w: 400, h: 640, x: -16, y: 14, cls: 'w-phone', keys: 'telephone appel',
    init() { phoneTimer = setInterval(() => { const el = document.getElementById('calltime'); const t = DS.active(); if (el && t && t.call) { const sec = Math.round((Date.now() - (t.callStart || Date.now())) / 1000); el.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); } }, 1000); },
    onClose() { clearInterval(phoneTimer); },
    titleExtra() { return 'poste 4012'; },
    render(w) {
      const t = DS.active();
      const head = '<div class="ph-top"><span class="ph-dot"></span>Disponible · Support IT <span class="grow"></span><span class="mono">4012</span></div>';
      if (!t) {
        const list = DS.state.tickets.map(x => { const u = DS.users[DS.sc(x).req]; return '<button class="ph-contact" data-a="openticket" data-tid="' + x.tid + '"><span class="av">' + initials(u.name) + '</span><span><b>' + esc(u.name) + '</b><small>' + esc(u.title) + ' · ' + u.ext + '</small></span><span class="mono small">' + x.tid + '</span></button>'; }).join('');
        return head + '<div class="ph-body"><p class="muted">Aucun ticket actif. Ouvre un ticket pour appeler son demandeur : l’appel sera tracé dans le ticket.</p><div class="label">Demandeurs des tickets ouverts</div>' + list + '</div>';
      }
      const s = DS.sc(t), u = DS.user(s.req);
      if (t.status === 'new') return head + '<div class="ph-body"><p class="muted">Prends d’abord le ticket ' + t.tid + ' en charge dans le Service Desk.</p></div>';
      const card = '<div class="ph-card"><span class="av lg">' + initials(u.name) + '</span><div><b>' + esc(u.name) + '</b><span>' + esc(u.title) + '</span><span class="mono">' + esc(u.ext) + ' · ' + esc(u.dept) + '</span></div></div>';
      if (!t.call) return head + '<div class="ph-body">' + card + '<button class="callbtn" data-a="dial">' + svg('phone') + 'Appeler ' + esc(u.name.split(' ')[0]) + '</button><p class="small muted">Ticket ' + t.tid + ' – ' + esc(s.title) + '</p></div>';
      const qs = DS.questions(t);
      const groups = DS.qCats.map(cat => {
        const list = qs.filter(q => q.cat === cat);
        if (!list.length) return '';
        return '<div class="ph-g"><div class="label">' + cat + '</div>' + list.map(q => { const asked = t.asked.includes(q.id) && !q.confirm; return '<button class="qbtn' + (asked ? ' asked' : '') + '" data-a="ask" data-q="' + q.id + '"' + (asked ? ' disabled' : '') + '>' + esc(q.q) + '</button>'; }).join('') + '</div>';
      }).join('');
      const conv = t.act.filter(a => a.k === 'q' || a.k === 'a').slice(-4).map(a => '<div class="ph-line ' + a.k + '"><b>' + (a.k === 'q' ? 'Toi' : esc(a.who.split(' ')[0])) + '</b> ' + esc(a.text) + '</div>').join('');
      const idw = t.claim ? '<div class="idcheck"><div class="label">Vérification d’identité</div><p>Matricule annoncé : <b class="mono">' + esc(t.claim) + '</b>. Compare-le avec la fiche AD de ' + esc(u.name) + ' (onglet Général › Matricule).</p><div class="row"><button class="btn sm" data-a="openad">Ouvrir l’AD</button><span class="grow"></span><button class="btn sm ok" data-a="idok">Conforme</button><button class="btn sm danger" data-a="idko">Non conforme</button></div></div>' : '';
      return head + '<div class="ph-call"><span class="av">' + initials(u.name) + '</span><div><b>' + esc(u.name) + '</b><span>En communication · <span id="calltime" class="mono">00:00</span></span></div><button class="hang" data-a="hang" aria-label="Raccrocher">' + svg('phone') + '</button></div>' +
        '<div class="ph-conv" data-sk="conv" data-stick>' + (conv || '<div class="muted small">Choisis ce que tu dis ci-dessous. Toute la conversation est tracée dans l’activité du ticket.</div>') + '</div>' + idw +
        '<div class="ph-qs" data-sk="qs">' + groups + '</div>';
    },
    actions: {
      openticket(w, d) { UI.open('sd', { tid: d.tid }); },
      dial() { const t = DS.active(); if (t) DS.call(t, true); },
      hang() { const t = DS.active(); if (t) DS.call(t, false); },
      ask(w, d) { const t = DS.active(); if (t) DS.ask(t, d.q); },
      idok() { const t = DS.active(); if (t) DS.judgeId(t, true); },
      idko() { const t = DS.active(); if (t) DS.judgeId(t, false); },
      openad(w) {
        const t = DS.active(); const ad = UI.open('ad');
        if (ad && !UI.mobile()) { const pr = w.el.getBoundingClientRect(), dr = document.getElementById('desk').getBoundingClientRect(); const left = pr.left - dr.left; if (left > 420) { ad.el.style.left = '8px'; ad.el.style.width = (left - 16) + 'px'; ad.el.classList.remove('max'); } }
        if (t && ad) { ad.st.sel = DS.sc(t).req; ad.st.node = 'ou:' + DS.users[DS.sc(t).req].ou; ad.st.dlg = { type: 'props', uid: DS.sc(t).req, tab: 'gen' }; DS.ad(t, 'view', DS.sc(t).req); } }
    }
  });

  /* =========================== ACTIVE DIRECTORY =========================== */
  const isComp = id => { const a = DS.assets[id]; return a && /Poste|PC|Portable|Serveur/.test(a.kind); };
  UI.reg('ad', {
    title: 'Utilisateurs et ordinateurs Active Directory', short: 'Utilisateurs et ordinateurs AD', color: '#6b5bd2', icon: 'ad', w: 940, h: 600, x: 150, y: 50, cls: 'w-mmc', keys: 'aduc annuaire compte mot de passe groupe',
    init(w) { w.st = { node: 'users', sel: null, dlg: null, q: '' }; },
    titleExtra() { const t = DS.active(); return t ? 'ticket ' + t.tid : 'lecture seule'; },
    render(w) {
      const t = DS.active();
      const all = DS.adUsers(t);
      const st = w.st;
      const ro = !t || t.status === 'new';
      const tree = '<div class="tree" data-sk="tree"><div class="tn root">' + svg('ad') + 'Utilisateurs et ordinateurs Active Directory [srv-dc-01.ostral.local]</div><div class="tn l1">' + svg('folder') + 'ostral.local</div>' +
        '<button class="tn l2' + (st.node === 'users' ? ' on' : '') + '" data-a="node" data-n="users">' + svg('folder') + 'Utilisateurs</button>' +
        DS.ous.map(ou => '<button class="tn l3' + (st.node === 'ou:' + ou ? ' on' : '') + '" data-a="node" data-n="ou:' + ou + '">' + svg('folder') + ou + '</button>').join('') +
        '<button class="tn l2' + (st.node === 'comp' ? ' on' : '') + '" data-a="node" data-n="comp">' + svg('folder') + 'Ordinateurs</button>' +
        '<button class="tn l2' + (st.node === 'groups' ? ' on' : '') + '" data-a="node" data-n="groups">' + svg('folder') + 'Groupes</button></div>';
      let list = '';
      const q = DS.norm(st.q);
      if (st.node === 'comp') {
        const ids = Object.keys(DS.assets).filter(isComp).filter(id => !q || DS.norm(id + ' ' + DS.assets[id].model).includes(q));
        list = '<table class="lv"><thead><tr><th>Nom</th><th>Type</th><th>Description</th><th>Utilisateur</th></tr></thead><tbody>' + ids.map(id => { const a = DS.assets[id]; return '<tr class="' + (st.sel === id ? 'sel' : '') + '" data-a="selc" data-dbl="openc" data-id="' + id + '"><td>' + svg('pc') + id + '</td><td>Ordinateur</td><td>' + esc(a.model) + '</td><td>' + esc(a.user === 'tech' ? 'Support IT' : a.user ? DS.users[a.user].name : '') + '</td></tr>'; }).join('') + '</tbody></table>';
      } else if (st.node === 'groups') {
        list = '<table class="lv"><thead><tr><th>Nom</th><th>Type</th><th>Description</th><th>Membres</th></tr></thead><tbody>' + DS.groups.map(g => '<tr><td>' + svg('group') + esc(g.id) + '</td><td>Groupe de sécurité – Global</td><td>' + esc(g.desc) + '</td><td>' + Object.values(all).filter(u => u.groups.includes(g.id)).length + '</td></tr>').join('') + '</tbody></table>';
      } else {
        let uids = Object.keys(all);
        if (st.node.startsWith('ou:')) uids = uids.filter(id => all[id].ou === st.node.slice(3));
        if (q) uids = Object.keys(all).filter(id => DS.norm(all[id].name + ' ' + all[id].login).includes(q));
        list = '<table class="lv"><thead><tr><th>Nom</th><th>Type</th><th>Identifiant</th><th>Description</th><th>État</th></tr></thead><tbody>' + uids.map(id => { const u = all[id]; return '<tr class="' + (st.sel === id ? 'sel' : '') + '" data-a="sel" data-dbl="props" data-id="' + id + '"><td>' + svg('user') + esc(u.name) + '</td><td>Utilisateur</td><td class="mono">' + esc(u.login) + '</td><td>' + esc(u.title) + '</td><td>' + (u.enabled === false ? '<span class="tag">Désactivé</span>' : '') + (u.locked ? '<span class="tag bad">Verrouillé</span>' : '') + (u.pwdExpired ? '<span class="tag warn">Mdp expiré</span>' : '') + '</td></tr>'; }).join('') + (uids.length ? '' : '<tr><td colspan="5" class="muted">Aucun résultat.</td></tr>') + '</tbody></table>';
      }
      const selU = st.sel && all[st.sel];
      const dis = (cond) => (ro || !cond) ? ' disabled' : '';
      const toolbar = '<div class="mmc-tb"><label class="mmc-search">' + svg('search') + '<input type="search" data-k="ad-q" data-in="q" placeholder="Rechercher un utilisateur ou un poste"></label>' +
        '<button class="tb" data-a="newu"' + dis(true) + '>' + svg('plus') + 'Nouvel utilisateur</button>' +
        '<button class="tb" data-a="props"' + (selU ? '' : ' disabled') + '>Propriétés</button>' +
        '<button class="tb" data-a="reset"' + dis(selU) + '>' + svg('key') + 'Réinitialiser le mot de passe…</button>' +
        '<button class="tb" data-a="addg"' + dis(selU) + '>' + svg('group') + 'Ajouter à un groupe…</button>' +
        '<button class="tb" data-a="toggle"' + dis(selU) + '>' + svg('ban') + (selU && selU.enabled === false ? 'Activer le compte' : 'Désactiver le compte') + '</button></div>';
      const status = '<div class="mmc-status">' + (t ? (ro ? 'Ticket ' + t.tid + ' non pris en charge : lecture seule.' : 'Actions tracées dans le ticket ' + t.tid + ' (' + esc(DS.users[DS.sc(t).req].name) + ').') : 'Lecture seule : aucun ticket actif. Ouvre un ticket dans le Service Desk pour agir.') + '</div>';
      return '<div class="mmc-menu"><span>Fichier</span><span>Action</span><span>Affichage</span><span>?</span></div>' + toolbar + '<div class="mmc">' + tree + '<div class="mmc-list" data-sk="list">' + list + '</div></div>' + status + (st.dlg ? this.dialog(w, t, all) : '');
    },
    dialog(w, t, all) {
      const d = w.st.dlg;
      const ro = !t || t.status === 'new';
      const frame = (title, body, foot) => '<div class="dlg-wrap"><div class="dlg" role="dialog" aria-label="' + esc(title) + '"><div class="dlg-t"><span>' + esc(title) + '</span><button class="wbtn wclose" data-a="dlgclose">' + svg('close') + '</button></div><div class="dlg-b">' + body + '</div><div class="dlg-f">' + foot + '</div></div></div>';
      if (d.type === 'props') {
        const u = all[d.uid];
        if (!u) return '';
        const tabs = [['gen', 'Général'], ['acc', 'Compte'], ['mem', 'Membre de'], ['org', 'Organisation']].map(([id, l]) => '<button class="' + (d.tab === id ? 'on' : '') + '" data-a="dtab" data-t="' + id + '">' + l + '</button>').join('');
        let b = '';
        if (d.tab === 'gen') b = '<div class="pform"><div class="phead">' + svg('user') + '<b>' + esc(u.name) + '</b></div><label><span>Description :</span><input type="text" value="' + esc(u.title) + '" readonly></label><label><span>Bureau :</span><input type="text" value="' + esc(u.office) + '" readonly></label><label><span>Téléphone :</span><input type="text" value="' + esc(u.ext) + '" readonly></label><label><span>Adresse de messagerie :</span><input type="text" value="' + esc(u.login) + '@ostral-bio.fr" readonly></label><label><span>Matricule (employeeID) :</span><input type="text" class="mono" value="' + esc(u.empId) + '" readonly></label></div>';
        if (d.tab === 'acc') b = '<div class="pform"><label><span>Nom d’ouverture de session :</span><input type="text" class="mono" value="' + esc(u.login) + '@ostral.local" readonly></label><label><span>Nom (antérieur à Windows 2000) :</span><input type="text" class="mono" value="OSTRAL\\' + esc(u.login) + '" readonly></label>' +
          '<label class="chkline' + (u.locked ? '' : ' dim') + '"><input type="checkbox" data-k="unlock-' + d.uid + '"' + (u.locked && !ro ? '' : ' disabled') + '> Déverrouiller le compte. ' + (u.locked ? '<b class="bad-t">Ce compte est actuellement verrouillé sur ce contrôleur de domaine Active Directory.</b>' : '') + '</label>' +
          '<fieldset><legend>Options de compte :</legend><label class="chkline"><input type="checkbox" disabled' + (u.mustChange ? ' checked' : '') + '> L’utilisateur doit changer le mot de passe à la prochaine ouverture de session</label><label class="chkline"><input type="checkbox" disabled' + (u.enabled === false ? ' checked' : '') + '> Le compte est désactivé</label></fieldset>' +
          '<dl class="kv"><dt>Dernière ouverture</dt><dd>' + esc(u.lastLogon) + '</dd><dt>Mot de passe modifié</dt><dd>' + (u.pwdAgeDays === 0 ? 'aujourd’hui' : 'il y a ' + u.pwdAgeDays + ' jours') + (u.pwdExpired ? ' (expiré)' : '') + '</dd><dt>Échecs d’authentification</dt><dd>' + (u.badPwd || 0) + '</dd></dl></div>';
        if (d.tab === 'mem') b = '<div class="pform"><div class="label">Membre de :</div><div class="glist-box">' + u.groups.map(g => { const gg = DS.groups.find(x => x.id === g) || { desc: '' }; return '<div class="grow-row">' + svg('group') + '<span class="mono">' + esc(g) + '</span><small>' + esc(gg.desc) + '</small>' + (ro ? '' : '<button class="btn sm" data-a="rmg" data-g="' + esc(g) + '">Supprimer</button>') + '</div>'; }).join('') + '</div><div class="row"><button class="btn" data-a="addg"' + (ro ? ' disabled' : '') + '>Ajouter…</button></div></div>';
        if (d.tab === 'org') b = '<div class="pform"><label><span>Fonction :</span><input type="text" value="' + esc(u.title) + '" readonly></label><label><span>Service :</span><input type="text" value="' + esc(u.dept) + '" readonly></label><label><span>Gestionnaire :</span><input type="text" value="' + esc(u.manager && DS.users[u.manager] ? DS.users[u.manager].name : '') + '" readonly></label><label><span>Unité d’organisation :</span><input type="text" class="mono" value="OU=' + esc(u.ou) + ',OU=Utilisateurs,DC=ostral,DC=local" readonly></label></div>';
        return frame('Propriétés de : ' + u.name, '<div class="dtabs">' + tabs + '</div>' + b, '<button class="btn" data-a="dlgok">OK</button><button class="btn" data-a="dlgclose">Annuler</button><button class="btn" data-a="dlgapply"' + (ro ? ' disabled' : '') + '>Appliquer</button>');
      }
      if (d.type === 'reset') {
        const u = all[d.uid];
        const pw = (w.body.querySelector('[data-k="pw1"]') || {}).value || '';
        const r = DS.pwdRules(pw, u);
        const rule = (ok, txt) => '<span class="' + (ok ? 'ok' : '') + '">' + txt + '</span>';
        return frame('Réinitialiser le mot de passe', '<div class="pform"><label><span>Nouveau mot de passe :</span><input type="password" data-k="pw1" data-in="pw" autocomplete="new-password"></label><label><span>Confirmer le mot de passe :</span><input type="password" data-k="pw2" autocomplete="new-password"></label>' +
          '<div class="pwrules">' + rule(r.len, '12 caractères') + rule(r.up, 'majuscule') + rule(r.low, 'minuscule') + rule(r.dig, 'chiffre') + rule(r.sp, 'caractère spécial') + rule(r.name && pw, 'sans le nom') + '</div>' +
          '<label class="chkline"><input type="checkbox" data-k="mustchg" checked> L’utilisateur doit changer le mot de passe à la prochaine ouverture de session</label>' +
          '<p class="small">État du verrouillage du compte sur ce contrôleur de domaine : <b>' + (u.locked ? 'Verrouillé' : 'Déverrouillé') + '</b></p><label class="chkline"><input type="checkbox" data-k="rsunlock"' + (u.locked ? '' : ' disabled') + '> Déverrouiller le compte de l’utilisateur</label>' +
          (d.err ? '<div class="callout bad">' + esc(d.err) + '</div>' : '') + '</div>', '<button class="btn primary" data-a="doreset">OK</button><button class="btn" data-a="dlgclose">Annuler</button>');
      }
      if (d.type === 'addg') {
        const u = all[d.uid];
        return frame('Sélectionnez des groupes – ' + u.name, '<p class="small">Sélectionne le ou les groupes à ajouter. Un accès à un dossier exige l’accord écrit de son responsable.</p><div class="gpick">' + DS.groups.filter(g => !u.groups.includes(g.id)).map(g => '<label class="chkline' + (g.danger ? ' danger' : '') + '"><input type="checkbox" data-k="ag-' + esc(g.id) + '" value="' + esc(g.id) + '"><span class="mono">' + esc(g.id) + '</span><small>' + esc(g.desc) + '</small></label>').join('') + '</div>', '<button class="btn primary" data-a="doaddg">OK</button><button class="btn" data-a="dlgclose">Annuler</button>');
      }
      if (d.type === 'newu') {
        const ou = d.ou || (w.st.node.startsWith('ou:') ? w.st.node.slice(3) : 'Secretariat');
        const copy = (w.body.querySelector('[data-k="nu-copy"]') || {}).value || '';
        const cgroups = copy && all[copy] ? all[copy].groups : ['GG_Tous'];
        return frame('Nouvel objet – Utilisateur', '<div class="pform"><label><span>Créer dans :</span><select data-k="nu-ou">' + DS.ous.map(o => '<option value="' + o + '"' + (o === ou ? ' selected' : '') + '>ostral.local/Utilisateurs/' + o + '</option>').join('') + '</select></label>' +
          '<div class="two"><label><span>Prénom :</span><input type="text" data-k="nu-first"></label><label><span>Nom :</span><input type="text" data-k="nu-last"></label></div>' +
          '<label><span>Nom d’ouverture de session :</span><span class="inl"><input type="text" class="mono" data-k="nu-login" placeholder="prenom.nom"><span class="mono muted">@ostral.local</span></span></label><label><span>Fonction :</span><input type="text" data-k="nu-title"></label>' +
          '<label><span>Copier les groupes de :</span><select data-k="nu-copy" data-ch="copy"><option value="">— Aucun (choisir à la main) —</option>' + Object.keys(all).filter(id => DS.users[id]).map(id => '<option value="' + id + '">' + esc(all[id].name) + ' – ' + esc(all[id].title) + '</option>').join('') + '</select></label>' +
          '<div class="label">Groupes</div><div class="gpick sm">' + DS.groups.map(g => '<label class="chkline' + (g.danger ? ' danger' : '') + '"><input type="checkbox" data-k="nug-' + esc(g.id) + '" value="' + esc(g.id) + '"' + (cgroups.includes(g.id) ? ' checked' : '') + '><span class="mono">' + esc(g.id) + '</span><small>' + esc(g.desc) + '</small></label>').join('') + '</div>' +
          '<div class="two"><label><span>Mot de passe :</span><input type="password" data-k="nu-pw1" autocomplete="new-password"></label><label><span>Confirmer :</span><input type="password" data-k="nu-pw2" autocomplete="new-password"></label></div>' +
          '<label class="chkline"><input type="checkbox" data-k="nu-must" checked> L’utilisateur doit changer le mot de passe à la prochaine ouverture de session</label>' + (d.err ? '<div class="callout bad">' + esc(d.err) + '</div>' : '') + '</div>',
          '<button class="btn primary" data-a="donewu">Terminer</button><button class="btn" data-a="dlgclose">Annuler</button>');
      }
      if (d.type === 'comp') {
        const c = DS.adComputer(t, d.id);
        const tabs = [['gen', 'Général'], ['bl', 'Récupération BitLocker']].map(([id, l]) => '<button class="' + (d.tab === id ? 'on' : '') + '" data-a="dtab" data-t="' + id + '">' + l + '</button>').join('');
        let b = '';
        if (d.tab === 'gen') b = '<div class="pform"><div class="phead">' + svg('pc') + '<b>' + esc(c.id) + '</b></div><dl class="kv"><dt>Nom DNS</dt><dd>' + esc(c.id.toLowerCase()) + '.ostral.local</dd><dt>Modèle</dt><dd>' + esc(c.model) + '</dd><dt>Système</dt><dd>' + esc(c.os) + '</dd><dt>Utilisateur</dt><dd>' + esc(c.user && DS.users[c.user] ? DS.users[c.user].name : '—') + '</dd><dt>Site</dt><dd>' + esc(c.site) + '</dd></dl></div>';
        if (d.tab === 'bl') {
          const shown = w.st.blShown || {};
          b = '<div class="pform"><p class="small">Mots de passe de récupération BitLocker de ce poste. Choisis la clé dont l’<b>ID</b> correspond à celui affiché sur l’écran de l’utilisateur.</p>' + (c.bitlocker.length ? c.bitlocker.map(k => '<div class="blk"><div class="kv2"><span>Date</span><b>' + esc(k.date) + '</b><span>ID du mot de passe</span><b class="mono">' + esc(k.id) + '</b></div>' + (shown[k.id] ? '<div class="bl-key mono">' + esc(k.key) + '</div>' : '<button class="btn sm" data-a="blshow" data-k2="' + esc(k.id) + '"' + (ro ? ' disabled' : '') + '>Afficher le mot de passe de récupération</button>') + '</div>').join('') : '<p class="muted">Aucune clé de récupération enregistrée pour ce poste.</p>') + '</div>';
        }
        return frame('Propriétés de : ' + c.id, '<div class="dtabs">' + tabs + '</div>' + b, '<button class="btn" data-a="dlgclose">Fermer</button>');
      }
      return '';
    },
    actions: {
      node(w, d) { w.st.node = d.n; w.st.sel = null; w.st.q = ''; const i = w.body.querySelector('[data-k="ad-q"]'); if (i) i.value = ''; UI.render('ad'); },
      q(w, d, el) { w.st.q = el.value; const t = DS.active(); if (t && el.value.length >= 3) DS.ad(t, 'search', null, { term: el.value }); else UI.render('ad'); },
      sel(w, d) {
        const dbl = w.st.sel === d.id && Date.now() - (w.st.lastClick || 0) < 450;
        w.st.lastClick = Date.now(); w.st.sel = d.id;
        if (dbl) return this.props(w, { id: d.id });
        const t = DS.active(); if (t) DS.ad(t, 'view', d.id); else UI.render('ad');
      },
      selc(w, d) {
        const dbl = w.st.sel === d.id && Date.now() - (w.st.lastClick || 0) < 450;
        w.st.lastClick = Date.now(); w.st.sel = d.id;
        if (dbl) return this.openc(w, { id: d.id });
        UI.render('ad');
      },
      openc(w, d) { w.st.dlg = { type: 'comp', id: d.id, tab: 'gen' }; w.st.blShown = {}; const t = DS.active(); if (t) DS.ad(t, 'comp', d.id); else UI.render('ad'); },
      props(w, d) {
        const id = d.id || w.st.sel;
        if (!id) return;
        if (isComp(id)) return this.openc(w, { id });
        w.st.sel = id; w.st.dlg = { type: 'props', uid: id, tab: 'gen' };
        const t = DS.active(); if (t) DS.ad(t, 'view', id); else UI.render('ad');
      },
      dtab(w, d) { w.st.dlg.tab = d.t; UI.render('ad'); },
      dlgclose(w) { w.st.dlg = null; UI.render('ad'); },
      dlgapply(w) {
        const d = w.st.dlg, t = DS.active();
        const cb = w.body.querySelector('[data-k="unlock-' + d.uid + '"]');
        if (t && cb && cb.checked) { DS.ad(t, 'unlock', d.uid); cb.checked = false; }
        UI.render('ad');
      },
      dlgok(w) { this.dlgapply(w); w.st.dlg = null; UI.render('ad'); },
      reset(w) { if (w.st.sel) { w.st.dlg = { type: 'reset', uid: w.st.sel }; UI.render('ad'); } },
      pw(w) { UI.render('ad'); },
      doreset(w) {
        const t = DS.active(), d = w.st.dlg, all = DS.adUsers(t);
        const v = k => w.body.querySelector('[data-k="' + k + '"]');
        const p1 = v('pw1').value, p2 = v('pw2').value;
        if (p1 !== p2) { d.err = 'Les mots de passe ne correspondent pas.'; UI.render('ad'); return; }
        if (!DS.pwdRules(p1, all[d.uid]).ok) { d.err = 'Le mot de passe ne répond pas aux exigences de longueur, de complexité ou d’historique de la stratégie de mot de passe.'; UI.render('ad'); return; }
        DS.ad(t, 'reset', d.uid, { mustChange: v('mustchg').checked, unlock: v('rsunlock').checked });
        w.st.dlg = null; UI.toast('Active Directory', 'Le mot de passe de ' + all[d.uid].name + ' a été modifié.'); UI.render('ad');
      },
      addg(w) { const id = (w.st.dlg && w.st.dlg.uid) || w.st.sel; if (id) { w.st.dlg = { type: 'addg', uid: id }; UI.render('ad'); } },
      doaddg(w) {
        const t = DS.active(), d = w.st.dlg;
        w.body.querySelectorAll('.gpick input:checked').forEach(cb => DS.ad(t, 'group+', d.uid, { g: cb.value }));
        w.st.dlg = { type: 'props', uid: d.uid, tab: 'mem' }; UI.render('ad');
      },
      rmg(w, d) { const t = DS.active(); DS.ad(t, 'group-', w.st.dlg.uid, { g: d.g }); },
      toggle(w) { const t = DS.active(), all = DS.adUsers(t), u = all[w.st.sel]; if (u) DS.ad(t, u.enabled === false ? 'enable' : 'disable', w.st.sel); },
      newu(w) { w.st.dlg = { type: 'newu' }; UI.render('ad'); },
      copy(w) {
        const all = DS.adUsers(DS.active());
        const id = w.body.querySelector('[data-k="nu-copy"]').value;
        const gs = id && all[id] ? all[id].groups : ['GG_Tous'];
        w.body.querySelectorAll('[data-k^="nug-"]').forEach(cb => { cb.checked = gs.includes(cb.value); });
      },
      donewu(w) {
        const t = DS.active(), d = w.st.dlg;
        const v = k => (w.body.querySelector('[data-k="' + k + '"]') || {}).value || '';
        const first = v('nu-first').trim(), last = v('nu-last').trim(), login = DS.norm(v('nu-login').trim());
        const groups = Array.from(w.body.querySelectorAll('[data-k^="nug-"]')).filter(c => c.checked).map(c => c.value);
        const all = DS.adUsers(t);
        if (!first || !last || !login) { d.err = 'Prénom, nom et nom d’ouverture de session sont obligatoires.'; UI.render('ad'); return; }
        if (Object.values(all).some(u => u.login === login)) { d.err = 'Ce nom d’ouverture de session existe déjà dans le domaine.'; UI.render('ad'); return; }
        if (v('nu-pw1') !== v('nu-pw2')) { d.err = 'Les mots de passe ne correspondent pas.'; UI.render('ad'); return; }
        if (!DS.pwdRules(v('nu-pw1'), { login }).ok) { d.err = 'Le mot de passe ne répond pas aux exigences de la stratégie (12 caractères, majuscule, minuscule, chiffre, caractère spécial).'; UI.render('ad'); return; }
        DS.ad(t, 'create', null, { first, last, login, ou: v('nu-ou'), title: v('nu-title'), groups, mustChange: w.body.querySelector('[data-k="nu-must"]').checked });
        w.st.dlg = null; w.st.node = 'ou:' + v('nu-ou'); w.st.sel = login;
        UI.toast('Active Directory', 'Utilisateur ' + login + ' créé.'); UI.render('ad');
      },
      blshow(w, d) { const t = DS.active(); w.st.blShown = Object.assign({}, w.st.blShown, { [d.k2]: true }); DS.ad(t, 'blreveal', w.st.dlg.id, { id: d.k2 }); }
    }
  });

  /* =========================== CONSOLE CLOUD =========================== */
  UI.reg('cloud', {
    title: 'Console cloud – identités et messagerie', short: 'Console cloud', color: '#1b8bb4', icon: 'cloud', w: 920, h: 600, x: 120, y: 40, keys: 'entra exchange office 365 boite mail session',
    init(w) { w.st = { sel: null, q: '' }; },
    render(w) {
      const t = DS.active();
      const all = DS.adUsers(t);
      const q = DS.norm(w.st.q);
      const ids = Object.keys(all).filter(id => !q || DS.norm(all[id].name + ' ' + all[id].login).includes(q));
      const side = '<aside class="cl-side"><input type="search" data-k="cl-q" data-in="q" placeholder="Rechercher un utilisateur"><div class="cl-list" data-sk="cl">' + ids.map(id => '<button class="' + (w.st.sel === id ? 'on' : '') + '" data-a="sel" data-id="' + id + '"><b>' + esc(all[id].name) + '</b><small>' + esc(all[id].login) + '@ostral-bio.fr</small></button>').join('') + '</div></aside>';
      let main = '<div class="empty">Sélectionne un utilisateur pour voir ses connexions, ses sessions et sa boîte aux lettres.</div>';
      const u = w.st.sel && all[w.st.sel];
      if (u) {
        const ro = !t || t.status === 'new';
        const sign = u.signins || [['Aujourd’hui 08:4' + (u.uid.length % 10), 'Lyon, FR', 'Windows (' + u.asset + ')', 'Réussie', false], ['Hier 17:2' + (u.uid.length % 10), 'Lyon, FR', 'Outlook', 'Réussie', false]];
        const used = u.mailboxUsed, quota = u.mailboxQuota, pct = Math.round(used / quota * 100);
        const s = t && DS.sc(t);
        const scActs = s && s.cloud && s.req === u.uid ? s.cloud : [];
        const revoked = t && DS.F(t)('ad:revoke:' + u.uid);
        const rules = u.rules || [];
        main = '<div class="cl-main"><div class="cl-h">' + svg('user') + '<div><h3>' + esc(u.name) + '</h3><span class="mono">' + esc(u.login) + '@ostral-bio.fr</span></div><span class="grow"></span>' + (u.enabled === false ? '<span class="tag">Connexion bloquée</span>' : '<span class="tag ok">Connexion autorisée</span>') + '</div>' +
          '<section><h4>Connexions récentes</h4><div class="tablewrap"><table class="grid sm"><thead><tr><th>Date</th><th>Lieu</th><th>Application</th><th>Résultat</th></tr></thead><tbody>' + sign.map(r => '<tr class="' + (r[4] ? 'sus' : '') + '"><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + (r[4] ? ' <span class="tag bad">inhabituel</span>' : '') + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td></tr>').join('') + '</tbody></table></div></section>' +
          '<section><h4>Sessions</h4><p class="small muted">Révoquer déconnecte l’utilisateur de toutes ses sessions ouvertes (PC, téléphone, navigateur, y compris celles d’un attaquant).</p><button class="btn" data-a="revoke"' + (ro ? ' disabled' : '') + '>' + (revoked ? 'Sessions révoquées ✓' : 'Révoquer toutes les sessions') + '</button></section>' +
          '<section><h4>Boîte aux lettres</h4><div class="meter"><i class="' + (pct > 95 ? 'bad' : '') + '" style="width:' + Math.min(100, pct) + '%"></i></div><p class="small"><b>' + String(used).replace('.', ',') + ' Go</b> utilisés sur ' + quota + ' Go (' + pct + ' %)</p></section>' +
          '<section><h4>Règles de boîte de réception</h4>' + (rules.length ? rules.map(r => '<div class="rule' + (r[1] ? ' sus' : '') + '"><span>' + esc(r[0]) + '</span>' + (r[1] ? '<span class="tag bad">créée depuis un lieu inhabituel</span>' : '') + '<button class="btn sm danger" data-a="rmrule"' + (ro ? ' disabled' : '') + '>Supprimer</button></div>').join('') : '<p class="small muted">Aucune règle.</p>') + '</section>' +
          (scActs.length ? '<section><h4>Actions de messagerie</h4>' + scActs.map(a => '<div class="cl-act"><button class="btn" data-a="sc" data-id="' + a.id + '"' + (ro ? ' disabled' : '') + '>' + esc(a.l) + '</button>' + (t.done['cloud:' + a.id] ? '<div class="result">' + esc(t.done['cloud:' + a.id]) + '</div>' : '') + '</div>').join('') + '</section>' : '') + '</div>';
      }
      return UI.browser('https://admin.cloud.ostral-bio.fr/utilisateurs' + (u ? '/' + u.login : ''), '<div class="cl-top">Console d’administration cloud · Identités et messagerie</div><div class="cl">' + side + main + '</div>');
    },
    actions: {
      q(w, d, el) { w.st.q = el.value; UI.render('cloud'); },
      sel(w, d) { w.st.sel = d.id; const t = DS.active(); if (t) DS.ad(t, 'cloudview', d.id); else UI.render('cloud'); },
      revoke(w) { const t = DS.active(); DS.ad(t, 'revoke', w.st.sel); },
      rmrule(w) { const t = DS.active(); DS.ad(t, 'rule', w.st.sel); },
      sc(w, d) { const t = DS.active(); const a = DS.sc(t).cloud.find(x => x.id === d.id); DS.doAct(t, a, 'cloud'); }
    }
  });

  /* =========================== COACH =========================== */
  UI.reg('coach', {
    title: 'Coach', short: 'Coach', color: '#b7791f', icon: 'coach', w: 410, h: 900, x: -12, y: -12, cls: 'w-coach', top: true, keys: 'aide guide methode tutoriel',
    init(w) { w.st = { all: false, cur: -1 }; },
    titleExtra() { return DS.state.settings.tuto ? 'mode tutoriel' : ''; },
    render(w) {
      const t = DS.active(), tuto = DS.state.settings.tuto;
      const bar = '<div class="coach-mode' + (tuto ? ' on' : '') + '"><span>' + (tuto ? '<b>Mode tutoriel activé.</b> Je t’explique chaque étape, dans l’ordre.' : '<b>Mode tutoriel désactivé.</b> Je rappelle seulement la méthode.') + '</span><button class="btn sm' + (tuto ? '' : ' primary') + '" data-a="tuto">' + (tuto ? 'Désactiver' : 'Activer') + '</button></div>';
      if (!t) {
        return bar + '<div class="coach">' + (tuto ? '<p><b>Par où commencer ?</b></p><ol class="steps"><li>Ouvre le Service Desk (première icône de la barre des tâches).</li><li>Dans « File du groupe », clique sur un ticket. Commence par celui marqué « Tutoriel ».</li><li>Je t’afficherai alors chaque étape : quoi faire, où cliquer et pourquoi.</li></ol>' : '') +
          '<p><b>Méthode du support</b></p><ol class="steps"><li>Prendre le ticket en charge</li><li>Qualifier : type, catégorie, impact, urgence</li><li>Appeler le demandeur et comprendre</li><li>Diagnostiquer avec les outils</li><li>Agir, ou escalader avec une note complète</li><li>Faire vérifier par l’utilisateur</li><li>Documenter et clôturer</li></ol><button class="btn sm" data-a="opensd">Ouvrir le Service Desk</button></div>';
      }
      return bar + (tuto ? this.tuto(w, t) : this.method(w, t));
    },
    tuto(w, t) {
      const s = DS.sc(t), steps = DS.tutoSteps(t);
      const ok = steps.map(st => DS.tutoDone(st, t));
      const cur = ok.indexOf(false);
      w.st.curNow = cur;
      const n = ok.filter(Boolean).length;
      const items = steps.map((st, i) => {
        const open = i === cur || w.st.all;
        return '<li class="ts' + (ok[i] ? ' done' : '') + (i === cur ? ' cur' : '') + '" data-i="' + i + '"><div class="ts-h"><span class="bx">' + (ok[i] ? '✓' : i + 1) + '</span><b>' + esc(st.t) + '</b></div>' +
          (open ? '<div class="ts-b"><div class="label">Comment faire</div><p>' + esc(st.how) + '</p><div class="label">Pourquoi</div><p class="muted">' + esc(st.why) + '</p>' + (i === cur && st.app && UI.apps[st.app] ? '<button class="btn sm primary" data-a="openapp" data-app="' + st.app + '">Ouvrir ' + esc(UI.apps[st.app].short) + '</button>' : '') + '</div>' : '') + '</li>';
      }).join('');
      return '<div class="coach"><div class="coach-t"><span class="mono">' + t.tid + '</span> ' + esc(s.title) + '</div>' +
        '<div class="tprog"><div class="xpbar"><i style="width:' + Math.round(n / steps.length * 100) + '%"></i></div><span class="mono small">' + n + ' / ' + steps.length + '</span></div>' +
        (cur === steps.length - 1 ? '<div class="callout ok small">Diagnostic et actions terminés. Il ne reste qu’à clôturer le ticket.</div>' : '') +
        '<ol class="tsteps">' + items + '</ol>' +
        '<label class="chkline small"><input type="checkbox" data-ch="all"' + (w.st.all ? ' checked' : '') + '> Afficher le détail de toutes les étapes</label>' +
        '<p class="small muted">Les étapes se cochent toutes seules quand tu les fais. En mode tutoriel, le ticket rapporte moitié moins d’XP : rejoue-le ensuite sans tutoriel pour vérifier que tu sais le faire seul.</p>' + this.kb(s) + '</div>';
    },
    method(w, t) {
      const s = DS.sc(t), f = DS.F(t);
      const steps = s.guide || [
        ['Prendre le ticket en charge', f => f('taken')],
        ['Qualifier le ticket et enregistrer', f => f('qualified')],
        ['Appeler le demandeur', f => f('called')],
        ['Comprendre : poser au moins deux questions utiles', f => t.asked.filter(id => !/^g_(identity|callback|consent|confirm)$/.test(id)).length >= 2],
        ['Diagnostiquer avec un outil (AD, prise en main, terminal, supervision, site…)', f => f.re(/^(ad:view|ad:comp|remote:connect|cmd:|lx:|onsite|monitor:view|cloud:view|inv:|attach_viewed|ping:)/)],
        [s.out.mode === 'escalate' ? 'Informer l’utilisateur avant de transmettre' : 'Faire vérifier la correction par l’utilisateur', f => s.out.mode === 'escalate' ? t.asked.length >= 3 : f('confirmed')],
        ['Onglet Résolution : cause, message, note, clôture', () => false]
      ];
      let firstOpen = -1;
      const items = steps.map((st, i) => { const ok = !!st[1](f); if (!ok && firstOpen < 0) firstOpen = i; return '<li class="' + (ok ? 'done' : (firstOpen === i ? 'next' : '')) + '"><span class="bx">' + (ok ? '✓' : '') + '</span><span>' + esc(st[0]) + '</span></li>'; }).join('');
      const lastHint = [...t.act].reverse().find(a => a.k === 'hint');
      return '<div class="coach"><div class="coach-t"><span class="mono">' + t.tid + '</span> ' + esc(s.title) + '</div>' +
        '<ol class="steps chk">' + items + '</ol>' + (lastHint ? '<div class="coach-hint"><div class="label">Dernier indice</div>' + esc(lastHint.text) + '</div>' : '') +
        '<div class="row"><button class="btn sm" data-a="hint"' + (t.status === 'new' ? ' disabled' : '') + '>Indice (−3 points)</button><span class="muted small">' + t.hints + ' utilisé' + (t.hints > 1 ? 's' : '') + '</span></div>' + this.kb(s) + '</div>';
    },
    kb(s) {
      return s.kb && s.kb.length ? '<div class="label">Fiches du wiki utiles</div><div class="chips">' + s.kb.map(id => { const a = DS.kb && DS.kb.find(x => x.id === id); return a ? '<button class="chip" data-a="kb" data-id="' + id + '">' + esc(a.title) + '</button>' : ''; }).join('') + '</div>' : '';
    },
    after(w) {
      if (w.st.curNow == null || w.st.curNow === w.st.cur) return;
      w.st.cur = w.st.curNow;
      const li = w.body.querySelector('.ts.cur');
      if (li) w.body.scrollTop = Math.max(0, li.offsetTop - 90);
    },
    actions: {
      tuto() { const on = !DS.state.settings.tuto; DS.setTuto(on); },
      all(w, d, el) { w.st.all = el.checked; UI.render('coach'); },
      openapp(w, d) { const t = DS.active(); UI.open(d.app, d.app === 'sd' && t ? { tid: t.tid } : undefined); },
      opensd() { UI.open('sd', { view: 'list' }); },
      hint() { const t = DS.active(); const h = DS.hint(t); if (h) { DS.log(t, 'hint', h); DS.save(); UI.refresh(); } },
      kb(w, d) { UI.open('wiki', { id: d.id }); }
    }
  });
})();
