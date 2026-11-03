/* DeskSim — bureau : gestionnaire de fenêtres, barre des tâches, menu Démarrer, notifications */
(function () {
  const UI = DS.UI = { apps: {}, wins: {}, z: 20, order: [] };
  const esc = UI.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  UI.mobile = () => window.matchMedia('(max-width: 760px)').matches;

  /* Pictogrammes (24×24, trait) */
  const P = {
    sd: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M10 8v1.5M10 11.2v1.6M10 14.5V16"/>',
    phone: '<path d="M6.5 3.5h3l1.6 4.2-2 1.2a10.5 10.5 0 0 0 5 5l1.2-2 4.2 1.6v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
    ad: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.4-3 2.7-5 5.5-5s5.1 2 5.5 5"/><path d="M15.5 5.2a3 3 0 0 1 0 5.6M17.5 14.3c1.7.6 2.8 2.2 3 4.7"/>',
    cloud: '<path d="M7 18.5h10.2a4 4 0 0 0 .3-8 6 6 0 0 0-11.5 1.6A3.5 3.5 0 0 0 7 18.5z"/>',
    remote: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8.5 20h7M12 16v4M9 10h6M13 8l2 2-2 2"/>',
    ps: '<rect x="3" y="4.5" width="18" height="15" rx="1.5"/><path d="M7 9l3 3-3 3M12.5 15H17"/>',
    putty: '<rect x="3" y="4.5" width="18" height="15" rx="1.5"/><path d="M3 8.5h18M7 12.5l2.5 1.8L7 16M12 16h4"/>',
    site: '<path d="M14.6 6.4a4 4 0 0 0-5.3 5.2L3.5 17.4l3 3 5.8-5.8a4 4 0 0 0 5.2-5.3l-2.5 2.5-2.3-.6-.6-2.3z"/>',
    monitor: '<path d="M3 12.5h4l2-5.5 4 11 2.2-5.5H21"/>',
    wiki: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5V4.5M9 7.5h6M9 10.5h4"/><path d="M6.5 21H19"/>',
    training: '<path d="M4 4v16h16"/><path d="M7.5 15l3.5-4 3 2.5 4.5-6"/>',
    coach: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.5.5.8 1.1.8 1.8V16h6v-.6c0-.7.3-1.3.8-1.8A6 6 0 0 0 12 3z"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    net: '<path d="M4 9.5a12 12 0 0 1 16 0M7 13a7.5 7.5 0 0 1 10 0M10 16.5a3 3 0 0 1 4 0"/><circle cx="12" cy="19.5" r=".6"/>',
    vol: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    min: '<path d="M6 12h12"/>', max: '<rect x="6.5" y="6.5" width="11" height="11" rx="1"/>', restore: '<rect x="6.5" y="8.5" width="9" height="9" rx="1"/><path d="M9 8.5V6.5h8.5V15h-2"/>', close: '<path d="M7 7l10 10M17 7L7 17"/>',
    power: '<path d="M12 3.5v8"/><path d="M7.2 6.2a7 7 0 1 0 9.6 0"/>', lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    folder: '<path d="M3.5 6.5h6l2 2h9v10h-17z"/>', user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.6-3.6 3.4-6 7-6s6.4 2.4 7 6"/>', pc: '<rect x="3.5" y="4.5" width="17" height="11" rx="1"/><path d="M8 19.5h8M12 15.5v4"/>',
    group: '<circle cx="8" cy="9" r="2.5"/><circle cx="16" cy="9" r="2.5"/><path d="M3.5 18c.5-2.5 2.2-4 4.5-4s4 1.5 4.5 4M11.5 18c.5-2.5 2.2-4 4.5-4s4 1.5 4.5 4"/>',
    refresh: '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 4.5V8h-3.5"/>', back: '<path d="M14.5 6l-6 6 6 6"/>', fwd: '<path d="M9.5 6l6 6-6 6"/>', padlock: '<rect x="6" y="11" width="12" height="9" rx="1.5"/><path d="M9 11V8.5a3 3 0 0 1 6 0V11"/>',
    key: '<circle cx="8" cy="15" r="3.5"/><path d="M10.5 12.5L19 4M16 7l2.5 2.5M14 9l2 2"/>', unlock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', ban: '<circle cx="12" cy="12" r="8"/><path d="M6.5 6.5l11 11"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M7 7l10 10M17 7L7 17"/>'
  };
  UI.svg = (name, cls) => '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[name] || '') + '</svg>';
  UI.appIcon = (id, size) => { const a = UI.apps[id]; return '<span class="appicon ' + (size || '') + '" style="--ac:' + a.color + '">' + UI.svg(a.icon || id) + '</span>'; };

  UI.reg = (id, app) => { UI.apps[id] = Object.assign({ w: 820, h: 560, actions: {} }, app); };

  /* Remplace le contenu d'un élément en conservant saisies, focus et défilements */
  UI.patch = function (el, html) {
    const vals = {};
    el.querySelectorAll('[data-k]').forEach(n => { vals[n.dataset.k] = (n.type === 'checkbox' || n.type === 'radio') ? n.checked : n.value; });
    const sc = {};
    el.querySelectorAll('[data-sk]').forEach(n => { sc[n.dataset.sk] = [n.scrollTop, n.scrollHeight - n.scrollTop - n.clientHeight < 4]; });
    const ae = document.activeElement;
    const fk = ae && el.contains(ae) && ae.dataset ? ae.dataset.k : null;
    let sel = null;
    try { if (fk) sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) { sel = null; }
    el.innerHTML = html;
    el.querySelectorAll('[data-k]').forEach(n => {
      if (!(n.dataset.k in vals) || n.hasAttribute('data-fresh')) return;
      if (n.type === 'checkbox' || n.type === 'radio') n.checked = vals[n.dataset.k]; else n.value = vals[n.dataset.k];
    });
    el.querySelectorAll('[data-sk]').forEach(n => { const v = sc[n.dataset.sk]; if (!v) return; n.scrollTop = (v[1] && n.hasAttribute('data-stick')) ? n.scrollHeight : v[0]; });
    if (fk) { const n = el.querySelector('[data-k="' + fk + '"]'); if (n) { n.focus({ preventScroll: true }); try { if (sel && sel[0] != null) n.setSelectionRange(sel[0], sel[1]); } catch (e) { /* */ } } }
  };

  /* ---------- Fenêtres ---------- */
  const layer = () => document.getElementById('wins');
  UI.open = function (id, arg) {
    const app = UI.apps[id];
    if (!app) return null;
    let w = UI.wins[id];
    if (w) {
      if (arg !== undefined && app.onArg) app.onArg(w, arg);
      w.el.hidden = false; w.min = false; UI.focus(id); UI.render(id); UI.taskbar();
      return w;
    }
    const el = document.createElement('section');
    el.className = 'win' + (app.cls ? ' ' + app.cls : '');
    el.dataset.id = id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', app.title);
    const desk = document.getElementById('desk').getBoundingClientRect();
    const n = Object.keys(UI.wins).length;
    let W = Math.min(app.w, desk.width - 24);
    const H = Math.min(app.h, desk.height - 70);
    if (!app.top && DS.state.settings.tuto && desk.width >= 1200) W = Math.min(W, desk.width - 470 - (app.x != null && app.x >= 0 ? app.x : 90));
    const x = app.x != null ? (app.x < 0 ? desk.width - W + app.x : app.x) : Math.max(8, Math.min(desk.width - W - 8, 90 + n * 34));
    let y = app.y != null ? (app.y < 0 ? desk.height - H + app.y : app.y) : Math.max(8, Math.min(desk.height - H - 12, 16 + n * 26));
    let x2 = x;
    if (!app.top && DS.state.settings.tuto && desk.width >= 1200 && x + W > desk.width - 440) x2 = Math.max(8, desk.width - 440 - W - 8);
    y = Math.max(0, y);
    el.style.cssText = 'left:' + x2 + 'px;top:' + y + 'px;width:' + W + 'px;height:' + H + 'px';
    el.innerHTML = '<header class="wt">' + UI.appIcon(id, 'xs') + '<span class="wtt">' + esc(app.title) + '</span><span class="wtx"></span>' +
      '<button class="wbtn" data-w="min" aria-label="Réduire">' + UI.svg('min') + '</button>' +
      '<button class="wbtn" data-w="max" aria-label="Agrandir">' + UI.svg('max') + '</button>' +
      '<button class="wbtn wclose" data-w="close" aria-label="Fermer">' + UI.svg('close') + '</button></header><div class="wb"></div>';
    layer().appendChild(el);
    w = UI.wins[id] = { id, app, el, body: el.querySelector('.wb'), st: {}, arg };
    if (app.init) app.init(w, arg);
    if (app.max || UI.mobile()) el.classList.add('max');
    bindWin(w);
    UI.focus(id); UI.render(id); UI.taskbar();
    return w;
  };
  UI.close = function (id) {
    const w = UI.wins[id];
    if (!w) return;
    if (w.app.onClose) w.app.onClose(w);
    w.el.remove(); delete UI.wins[id];
    UI.order = UI.order.filter(x => x !== id);
    UI.taskbar();
  };
  UI.focus = function (id) {
    const w = UI.wins[id];
    if (!w) return;
    w.el.style.zIndex = (w.app.top && !UI.mobile() ? 5000 : 0) + (++UI.z);
    UI.order = UI.order.filter(x => x !== id).concat([id]);
    Object.values(UI.wins).forEach(o => o.el.classList.toggle('on', o.id === id));
    if (w.app.onFocus) w.app.onFocus(w);
    UI.taskbar();
  };
  UI.toggleTask = function (id) {
    const w = UI.wins[id];
    if (!w) return UI.open(id);
    const top = UI.order[UI.order.length - 1] === id && !w.min;
    if (top) { w.min = true; w.el.hidden = true; UI.order = UI.order.filter(x => x !== id); UI.taskbar(); }
    else { w.min = false; w.el.hidden = false; UI.focus(id); UI.render(id); }
  };
  UI.render = function (id) {
    const w = UI.wins[id];
    if (!w || w.min) return;
    UI.patch(w.body, w.app.render(w));
    const extra = w.app.titleExtra ? w.app.titleExtra(w) : '';
    w.el.querySelector('.wtx').innerHTML = extra ? ' – ' + esc(extra) : '';
    if (w.app.after) w.app.after(w);
  };
  let raf = 0;
  UI.refresh = function () {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; Object.keys(UI.wins).forEach(UI.render); UI.taskbar(); });
  };

  function bindWin(w) {
    const el = w.el, head = el.querySelector('.wt');
    el.addEventListener('pointerdown', () => { if (UI.order[UI.order.length - 1] !== w.id) UI.focus(w.id); }, true);
    head.addEventListener('dblclick', e => { if (!e.target.closest('.wbtn')) el.classList.toggle('max'); });
    head.addEventListener('pointerdown', e => {
      if (e.target.closest('.wbtn') || el.classList.contains('max') || UI.mobile()) return;
      const r = el.getBoundingClientRect(), d = document.getElementById('desk').getBoundingClientRect();
      const ox = e.clientX - r.left, oy = e.clientY - r.top;
      head.setPointerCapture(e.pointerId);
      const mv = ev => {
        el.style.left = Math.max(-r.width + 120, Math.min(d.width - 120, ev.clientX - d.left - ox)) + 'px';
        el.style.top = Math.max(0, Math.min(d.height - 80, ev.clientY - d.top - oy)) + 'px';
      };
      const up = () => { head.removeEventListener('pointermove', mv); head.removeEventListener('pointerup', up); };
      head.addEventListener('pointermove', mv); head.addEventListener('pointerup', up);
    });
    head.addEventListener('click', e => {
      const b = e.target.closest('[data-w]');
      if (!b) return;
      if (b.dataset.w === 'close') UI.close(w.id);
      if (b.dataset.w === 'min') { w.min = true; el.hidden = true; UI.order = UI.order.filter(x => x !== w.id); UI.taskbar(); }
      if (b.dataset.w === 'max') el.classList.toggle('max');
    });
    const body = w.body, A = w.app.actions;
    const run = (name, n, e) => { const fn = A[name]; if (fn) { fn.call(A, w, n.dataset, n, e); } };
    body.addEventListener('click', e => { const n = e.target.closest('[data-a]'); if (n && body.contains(n) && !n.disabled) { e.preventDefault(); run(n.dataset.a, n, e); } });
    body.addEventListener('dblclick', e => { const n = e.target.closest('[data-dbl]'); if (n) run(n.dataset.dbl, n, e); });
    body.addEventListener('change', e => { const n = e.target.closest('[data-ch]'); if (n) run(n.dataset.ch, n, e); });
    body.addEventListener('input', e => { const n = e.target.closest('[data-in]'); if (n) run(n.dataset.in, n, e); });
    body.addEventListener('keydown', e => {
      const n = e.target.closest('[data-enter]');
      if (n && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run(n.dataset.enter, n, e); }
      const h = e.target.closest('[data-hist]');
      if (h && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); run(h.dataset.hist, h, e); }
    });
    body.addEventListener('submit', e => e.preventDefault());
  }

  /* ---------- Barre des tâches, menu Démarrer, notifications ---------- */
  UI.pinned = ['sd', 'phone', 'ad', 'cloud', 'remote', 'ps', 'putty', 'site', 'monitor', 'wiki', 'training'];
  UI.taskbar = function () {
    const tb = document.getElementById('tasks');
    if (!tb) return;
    const top = UI.order[UI.order.length - 1];
    const ids = UI.pinned.concat(Object.keys(UI.wins).filter(id => !UI.pinned.includes(id)));
    tb.innerHTML = ids.map(id => {
      const w = UI.wins[id], a = UI.apps[id];
      return '<button class="tbtn' + (w ? ' open' : '') + (w && top === id && !w.min ? ' cur' : '') + '" data-task="' + id + '" title="' + esc(a.title) + '" aria-label="' + esc(a.title) + '">' + UI.appIcon(id, 'sm') + '</button>';
    }).join('');
    const t = DS.active();
    const chip = document.getElementById('activechip');
    if (chip) {
      chip.hidden = !t;
      if (t) chip.innerHTML = '<b>' + esc(t.tid) + '</b> ' + esc(DS.users[DS.sc(t).req].name);
    }
    const tb2 = document.getElementById('tutobtn');
    if (tb2) { tb2.classList.toggle('on', !!DS.state.settings.tuto); tb2.setAttribute('aria-pressed', DS.state.settings.tuto ? 'true' : 'false'); }
    const nb = DS.state.tickets.filter(x => x.status === 'new').length;
    const bell = document.getElementById('bellcount');
    if (bell) { bell.textContent = nb; bell.hidden = !nb; }
  };
  UI.clock = function () {
    const c = DS.clockText();
    const el = document.getElementById('clock');
    if (el) el.innerHTML = '<span>' + c.time + '</span><span>' + c.date + '</span>';
  };
  UI.toast = function (title, text, open) {
    const wrap = document.getElementById('toasts');
    const n = document.createElement('button');
    n.className = 'toast';
    n.innerHTML = '<b>' + esc(title) + '</b><span>' + esc(text) + '</span>';
    n.addEventListener('click', () => { n.remove(); if (open) open(); });
    wrap.appendChild(n);
    setTimeout(() => n.remove(), 7000);
    while (wrap.children.length > 3) wrap.firstChild.remove();
  };

  function startMenu() {
    const m = document.getElementById('startmenu');
    const lv = DS.level(DS.state.xp);
    m.innerHTML = '<div class="sm-search">' + UI.svg('search') + '<input id="sm-q" type="search" placeholder="Rechercher une application" data-smq></div>' +
      '<div class="label sm-l">Épinglé</div><div class="sm-grid">' + UI.pinned.map(id => '<button class="sm-app" data-open="' + id + '">' + UI.appIcon(id) + '<span>' + esc(UI.apps[id].short || UI.apps[id].title) + '</span></button>').join('') + '</div>' +
      '<div class="sm-foot"><div class="sm-user">' + UI.svg('user') + '<div><b>' + esc(DS.state.name || 'Technicien') + '</b><span>' + esc(lv.name) + ' · OSTRAL\\tech.support</span></div></div>' +
      '<button class="sm-pow" data-open="training" data-tab="reglages" title="Réglages">' + UI.svg('power') + '</button></div>';
  }
  UI.toggleStart = function (force) {
    const m = document.getElementById('startmenu');
    const show = force != null ? force : m.hidden;
    if (show) startMenu();
    m.hidden = !show;
    if (show) setTimeout(() => { const q = document.getElementById('sm-q'); if (q && !UI.mobile()) q.focus(); }, 30);
  };

  /* ---------- Bureau ---------- */
  UI.boot = function () {
    const root = document.getElementById('app');
    root.innerHTML = '<div id="desk" class="desk"><div class="wall"><div class="wall-mark"><b>Ostral Biologie</b><span>Poste PC-SUPPORT-01 · Support IT</span></div>' +
      '<div class="icons">' + UI.pinned.map(id => '<button class="dicon" data-open="' + id + '">' + UI.appIcon(id, 'lg') + '<span>' + esc(UI.apps[id].short || UI.apps[id].title) + '</span></button>').join('') + '</div></div>' +
      '<div id="wins"></div><div id="startmenu" class="startmenu" hidden></div><div id="toasts" class="toasts" aria-live="polite"></div>' +
      '<div id="login" class="login" hidden></div></div>' +
      '<footer class="taskbar"><button class="startbtn" id="startbtn" aria-label="Démarrer"><span class="logo-o"></span></button>' +
      '<label class="tsearch">' + UI.svg('search') + '<input type="search" id="tsearch" placeholder="Rechercher"></label>' +
      '<div class="tasks" id="tasks"></div><div class="tray">' +
      '<button class="activechip" id="activechip" hidden title="Ticket actif"></button>' +
      '<button class="tutobtn" id="tutobtn" title="Le Coach explique chaque étape du ticket, dans l’ordre" aria-pressed="false">' + UI.svg('coach') + '<span>Tutoriel</span></button>' +
      '<button class="trayb" id="coachbtn" title="Coach">' + UI.svg('coach') + '</button>' +
      '<button class="trayb" id="bellbtn" title="Nouveaux tickets">' + UI.svg('bell') + '<i id="bellcount" hidden>0</i></button>' +
      '<span class="trayi" title="Réseau : OSTRAL-CORP (filaire)">' + UI.svg('net') + '</span><span class="trayi hide-s">' + UI.svg('vol') + '</span>' +
      '<button class="clock" id="clock" title="Horloge de service (temps simulé)"></button></div></footer>';
    document.body.addEventListener('click', e => {
      const o = e.target.closest('[data-open]');
      if (o) { UI.toggleStart(false); const w = UI.open(o.dataset.open, o.dataset.tab ? { tab: o.dataset.tab } : undefined); if (w && o.dataset.tab && w.app.onArg) { w.app.onArg(w, { tab: o.dataset.tab }); UI.render(w.id); } return; }
      const tk = e.target.closest('[data-task]');
      if (tk) { UI.toggleStart(false); UI.toggleTask(tk.dataset.task); return; }
      if (e.target.closest('#startbtn')) { UI.toggleStart(); return; }
      if (!e.target.closest('#startmenu')) UI.toggleStart(false);
      if (e.target.closest('#activechip')) { const t = DS.active(); if (t) UI.open('sd', { tid: t.tid }); }
      if (e.target.closest('#bellbtn')) UI.open('sd', { view: 'list' });
      if (e.target.closest('#coachbtn')) UI.toggleTask('coach');
      if (e.target.closest('#tutobtn')) { const on = !DS.state.settings.tuto; DS.setTuto(on); if (on) { UI.open('coach'); UI.toast('Mode tutoriel activé', 'Le Coach t’explique chaque étape du ticket actif, dans l’ordre.'); } else UI.toast('Mode tutoriel désactivé', 'Le Coach rappelle seulement la méthode. Tes tickets comptent à nouveau pleinement.'); }
      if (e.target.closest('#clock')) UI.toast('Horloge de service', 'Temps simulé : 1 seconde réelle = 10 secondes au bureau. Les délais (SLA) se comptent sur cette horloge.');
    });
    document.getElementById('tsearch').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const q = DS.norm(e.target.value);
      const hit = Object.keys(UI.apps).find(id => DS.norm(UI.apps[id].title + ' ' + (UI.apps[id].keys || '')).includes(q));
      if (hit) { UI.open(hit); e.target.value = ''; }
    });
    document.getElementById('startmenu').addEventListener('input', e => {
      if (!e.target.matches('[data-smq]')) return;
      const q = DS.norm(e.target.value);
      document.querySelectorAll('.sm-app').forEach(b => { b.hidden = q && !DS.norm(b.textContent + ' ' + (UI.apps[b.dataset.open].keys || '')).includes(q); });
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') UI.toggleStart(false); });

    DS.on(ev => {
      if (ev === 'reload') { Object.keys(UI.wins).forEach(UI.close); UI.start(); return; }
      if (ev && ev.type === 'arrival') UI.toast('Nouveau ticket ' + ev.t.tid, DS.users[DS.sc(ev.t).req].name + ' – ' + DS.sc(ev.t).title, () => UI.open('sd', { tid: ev.t.tid }));
      if (ev && ev.type === 'nudge') UI.toast('Relance sur ' + ev.t.tid, DS.users[DS.sc(ev.t).req].name + ' attend une réponse.', () => UI.open('sd', { tid: ev.t.tid }));
      if (ev && ev.type === 'badge') UI.toast('Badge obtenu : ' + ev.b[1], ev.b[2], () => UI.open('training', { tab: 'dash' }));
      UI.refresh();
    });
    UI.start();
    setInterval(() => {
      if (document.hidden || !DS.state.name) return;
      DS.tick(); UI.clock();
      const sd = UI.wins.sd;
      if (sd && !sd.min && !(document.activeElement && sd.body.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) {
        if (Math.floor(DS.state.clock * 3) % 15 === 0) UI.render('sd');
      }
    }, 1000);
    DS.initCloud();
  };

  UI.start = function () {
    if (DS.state.settings.tuto === undefined) DS.state.settings.tuto = true;
    DS.seed();
    UI.clock(); UI.taskbar();
    const lg = document.getElementById('login');
    if (!DS.state.name) {
      UI.open('sd', { view: 'list' });
      lg.hidden = false;
      lg.innerHTML = '<form class="login-card" id="loginform"><div class="login-av">' + UI.svg('user') + '</div><h2>Ouverture de session</h2>' +
        '<p>Tu es technicien·ne support IT chez <b>Ostral Biologie</b>, un laboratoire de biologie médicale multisite (siège et plateau technique, trois sites de prélèvement).</p>' +
        '<p>Des tickets arrivent dans le Service Desk. Tu les traites avec les vrais outils du poste : téléphone, Active Directory, PowerShell, assistance à distance, SSH Linux, intervention sur site. Chaque ticket est noté et tes progrès sont suivis dans l’Espace formation.</p>' +
        '<label class="field"><span>Ton prénom (il signera tes messages)</span><input id="login-name" type="text" autocomplete="given-name" maxlength="30" placeholder="Prénom" required></label>' +
        '<label class="chkline"><input type="checkbox" id="login-tuto" checked> Activer le mode tutoriel : le Coach m’explique chaque étape, dans l’ordre (recommandé pour débuter)</label>' +
        '<button class="btn primary" type="submit">Ouvrir la session</button><small>Le premier ticket est un tutoriel guidé : le Coach t’accompagne pas à pas.</small></form>';
      const f = document.getElementById('loginform');
      f.addEventListener('submit', e => {
        e.preventDefault();
        const v = document.getElementById('login-name').value.trim();
        if (!v) return;
        DS.state.name = v; DS.state.settings.tuto = document.getElementById('login-tuto').checked; DS.save();
        lg.hidden = true;
        UI.open('coach');
        const t = DS.state.tickets.find(x => x.sid === 'lock');
        UI.open('sd', t ? { tid: t.tid } : { view: 'list' });
      });
      setTimeout(() => { const i = document.getElementById('login-name'); if (i && !UI.mobile()) i.focus(); }, 50);
    } else {
      lg.hidden = true;
      if (DS.state.settings.coach && !UI.mobile()) UI.open('coach');
      const t = DS.active();
      UI.open('sd', t ? { tid: t.tid } : { view: 'list' });
    }
  };
})();
