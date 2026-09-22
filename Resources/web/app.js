/* Dirigent · Oberfläche (Vanilla JS, keine Abhängigkeiten) */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BASE = location.origin;

/* ───────── Icons (Lucide-Stil) ───────── */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M8 3h8M9 14h.01M15 14h.01"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  template: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>',
  flow: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7.5 6h9M6.5 8.2l4.2 7.6M17.5 8.2l-4.2 7.6"/>',
  pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  plug: '<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  play: '<path d="m7 4 13 8-13 8z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  crown: '<path d="m3 7 4.5 4L12 5l4.5 6L21 7l-2 12H5z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14 9l2 2"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  hook: '<path d="M18 16.1A5 5 0 0 1 15 7M6 16.1a5 5 0 1 0 6 2.9M12 6a3 3 0 1 1 0 .01M6 16l6-10 6 10"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};
const icon = (n, cls = '') => `<span class="ico ${cls}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[n] || ''}</svg></span>`;
function hydrateIcons(root = document) { root.querySelectorAll('[data-ico]').forEach(el => { el.outerHTML = icon(el.dataset.ico); }); }

/* ───────── Zustand ───────── */
let S = { agents: [], tasks: [], templates: [], workflows: [], runs: [], webhooks: [], events: [], settings: {}, server: {} };
let docs = [];
const ui = {
  view: (() => { try { return localStorage.getItem('dirigent.view') || 'overview'; } catch { return 'overview'; } })(),
  taskFilter: 'all', taskSearch: '', drawerTask: null, connected: false,
};

const api = async (method, path, body) => {
  const opt = { method, headers: {} };
  if (body !== undefined) {
    if (typeof body === 'string') { opt.body = body; opt.headers['Content-Type'] = 'text/plain'; }
    else { opt.body = JSON.stringify(body); opt.headers['Content-Type'] = 'application/json'; }
  }
  const r = await fetch(BASE + path, opt);
  const ct = r.headers.get('content-type') || '';
  const data = ct.includes('json') ? await r.json() : await r.text();
  if (!r.ok) throw new Error((data && data.error) || data || r.statusText);
  return data;
};

async function refresh() {
  try {
    S = await api('GET', '/api/state');
    ui.connected = true;
    render();
  } catch (e) { ui.connected = false; renderServerCard(); }
}
let refreshTimer = null;
const refreshSoon = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 120); };

function connectEvents() {
  const es = new EventSource(BASE + '/api/events');
  es.onmessage = (m) => {
    let ev; try { ev = JSON.parse(m.data); } catch { return; }
    refreshSoon();
    if (ev.type === 'task.completed') toast('✅', ev.message);
    else if (ev.type === 'task.failed') toast('⚠️', ev.message);
    else if (ev.type === 'agent.registered') toast('👋', ev.message);
    else if (ev.type === 'workflow.completed') toast('🎼', ev.message);
  };
  es.onerror = () => { ui.connected = false; renderServerCard(); };
  es.onopen = () => { ui.connected = true; refreshSoon(); };
}

/* ───────── Hilfen ───────── */
const ago = (ms) => {
  if (!ms) return '–';
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 10) return 'gerade eben';
  if (s < 60) return `vor ${Math.floor(s)} s`;
  if (s < 3600) return `vor ${Math.floor(s / 60)} Min`;
  if (s < 86400) return `vor ${Math.floor(s / 3600)} Std`;
  return new Date(ms).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + new Date(ms).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};
const dur = (a, b) => {
  if (!a) return '–';
  const s = Math.round(((b || Date.now()) - a) / 1000);
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} Min ${s % 60} s`;
  return `${Math.floor(s / 3600)} Std ${Math.floor((s % 3600) / 60)} Min`;
};
const agentById = (id) => S.agents.find(a => a.id === id);
const initials = (n) => (n || '?').split(/[\s\-_]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
const avatar = (a, cls = '') => `<div class="avatar ${cls}" style="--ac:${esc(a?.color || '#8b5cf6')}">${esc(initials(a?.name))}${a?.role === 'manager' && !cls ? '<span class="role-badge">👑</span>' : ''}</div>`;
const STATUS = { waiting: 'Bereit', working: 'Arbeitet', idle: 'Verbindet…', offline: 'Offline' };
const TSTATUS = { queued: 'Wartet', running: 'Läuft', done: 'Erledigt', failed: 'Fehler', cancelled: 'Abgebrochen' };
const statusPill = (s) => `<span class="pill ${s}"><span class="dot ${s}"></span>${STATUS[s] || s}</span>`;
const taskPill = (s) => `<span class="pill ${s}">${TSTATUS[s] || s}</span>`;
function targetLabel(t) {
  if (!t || t === 'any') return 'Beliebiger Worker';
  if (t === 'manager') return 'Manager';
  if (t === 'all') return 'Alle Worker';
  if (t.startsWith('agent:')) { const r = t.slice(6); const a = S.agents.find(x => x.id === r || x.name.toLowerCase() === r.toLowerCase()); return a ? a.name : r; }
  if (t.startsWith('tag:')) return '#' + t.slice(4);
  return t;
}
const hlVars = (s) => esc(s).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, '<span class="var">{{$1}}</span>');
const varsOf = (s) => [...new Set([...(s || '').matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)].map(m => m[1]))];
function creatorLabel(c) {
  if (!c) return '–';
  if (c === 'user') return 'Du (Dashboard)';
  if (c === 'system') return 'Dirigent';
  if (c === 'zeitplan') return 'Zeitplan';
  if (c.startsWith('agent:')) return agentById(c.slice(6))?.name || c;
  if (c.startsWith('workflow:')) return 'Workflow';
  return c;
}

function copy(text) {
  if (window.webkit?.messageHandlers?.dirigent) window.webkit.messageHandlers.dirigent.postMessage({ action: 'copy', text });
  else if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  else fallbackCopy(text);
  toast('📋', 'In die Zwischenablage kopiert');
}
function fallbackCopy(text) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
function openExternal(url) {
  if (window.webkit?.messageHandlers?.dirigent) window.webkit.messageHandlers.dirigent.postMessage({ action: 'open', url });
  else window.open(url, '_blank');
}

function toast(ico, msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${ico}</span><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3800);
}

const joinPrompt = (role = 'worker') => role === 'manager'
  ? `Melde dich bei Dirigent als MANAGER an (role=manager) und halte dich bereit – du orchestrierst die anderen Agenten. Anleitung: curl -s "${BASE}/join?role=manager"`
  : `Melde dich bei Dirigent als Agent an und halte dich bereit. Anleitung: curl -s ${BASE}/join`;

/* ───────── Navigation ───────── */
const VIEWS = [
  { id: 'overview', label: 'Übersicht', icon: 'home', sub: 'Dein Orchester auf einen Blick' },
  { id: 'agents', label: 'Agenten', icon: 'bot', sub: 'Angemeldete KI-Agenten – bereit ohne Token-Verbrauch' },
  { id: 'tasks', label: 'Aufträge', icon: 'list', sub: 'Alle Aufträge, live verteilt' },
  { id: 'templates', label: 'Vorlagen', icon: 'template', sub: 'Vorgefertigte Aufgaben, die Agenten als Prompt erhalten' },
  { id: 'workflows', label: 'Workflows', icon: 'flow', sub: 'Mehrstufige Abläufe über mehrere Agenten' },
  { id: 'activity', label: 'Aktivität', icon: 'pulse', sub: 'Ereignisprotokoll in Echtzeit' },
  { sep: true },
  { id: 'integrate', label: 'Integration', icon: 'plug', sub: 'Offene API, Webhooks, Live-Events – dock an, was du willst' },
  { id: 'settings', label: 'Einstellungen', icon: 'gear', sub: 'Server, Zugriff und Sicherheit' },
];

function renderNav() {
  const counts = {
    agents: S.agents.filter(a => a.status === 'waiting' || a.status === 'working').length,
    tasks: S.tasks.filter(t => t.status === 'queued' || t.status === 'running').length,
    templates: S.templates.length, workflows: S.runs.filter(r => r.status === 'running').length,
  };
  $('#nav').innerHTML = VIEWS.map(v => v.sep ? '<div class="nav-sep"></div>' : `
    <button class="nav-item ${ui.view === v.id ? 'active' : ''}" data-action="nav" data-view="${v.id}">
      ${icon(v.icon)}<span>${v.label}</span>
      ${counts[v.id] ? `<span class="count ${v.id === 'agents' || v.id === 'tasks' || v.id === 'workflows' ? 'live' : ''}">${counts[v.id]}</span>` : ''}
    </button>`).join('');
}

function renderServerCard() {
  const sv = S.server || {};
  const err = sv.error;
  const ok = ui.connected && !err;
  $('#serverCard').innerHTML = `
    <div class="flex gap-s"><span class="dot ${ok ? 'ok' : 'bad'}"></span><b>${ok ? 'Server läuft' : (err ? 'Server-Fehler' : 'Verbinde…')}</b></div>
    <div class="mono faint" style="margin-top:4px">${esc(location.host)}</div>
    ${sv.lanAccess ? `<div class="faint" style="margin-top:2px">${icon('globe', 'sm')} Netzwerk: ${esc((sv.addresses || [])[0] || '–')}</div>` : ''}`;
}

function render() {
  renderNav();
  renderServerCard();
  const v = VIEWS.find(x => x.id === ui.view) || VIEWS[0];
  $('#viewTitle').textContent = v.label;
  $('#viewSub').textContent = v.sub;
  const actions = {
    overview: `<button class="btn" data-action="join">${icon('terminal')} Agent anmelden</button><button class="btn btn-primary" data-action="compose">${icon('send')} Neuer Auftrag <kbd>⌘K</kbd></button>`,
    agents: `<button class="btn btn-primary" data-action="join">${icon('plus')} Agent anmelden</button>`,
    tasks: `<button class="btn btn-primary" data-action="compose">${icon('send')} Neuer Auftrag</button>`,
    templates: `<button class="btn btn-primary" data-action="tpl-edit">${icon('plus')} Neue Vorlage</button>`,
    workflows: `<button class="btn btn-primary" data-action="wf-edit">${icon('plus')} Neuer Workflow</button>`,
    integrate: `<button class="btn" data-action="open-browser">${icon('globe')} Im Browser öffnen</button>`,
  };
  $('#topActions').innerHTML = actions[ui.view] || '';
  const views = { overview: vOverview, agents: vAgents, tasks: vTasks, templates: vTemplates, workflows: vWorkflows, activity: vActivity, integrate: vIntegrate, settings: vSettings };
  const ae = document.activeElement;
  if (ae && $('#view').contains(ae) && /INPUT|TEXTAREA|SELECT/.test(ae.tagName) && ae.id !== 'taskSearch') { if (ui.drawerTask) renderDrawer(); return; }
  const scroll = $('#view').scrollTop;
  const focused = ae?.id;
  $('#view').innerHTML = (S.server?.error ? `<div class="banner">⚠️ ${esc(S.server.error)} – ändere den Port in den Einstellungen.</div>` : '') + (views[ui.view] || vOverview)();
  $('#view').scrollTop = scroll;
  if (focused && $('#' + focused)) { const el = $('#' + focused); el.focus(); if (el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length); }
  if (ui.drawerTask) renderDrawer();
}

/* ───────── Ansicht: Übersicht ───────── */
function vOverview() {
  const A = S.agents, T = S.tasks;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const doneToday = T.filter(t => t.status === 'done' && t.finishedAt >= today.getTime()).length;
  const kpi = (label, val, ico, c, foot) => `<div class="panel kpi" style="--kpi-c:${c}"><div class="kpi-label">${icon(ico, 'sm')}${label}</div><div class="kpi-value">${val}</div><div class="kpi-foot">${foot}</div></div>`;
  const active = T.filter(t => t.status === 'running' || t.status === 'queued').sort((a, b) => b.createdAt - a.createdAt);
  let html = '';
  if (!A.length) html += onboarding();
  html += `<div class="grid grid-kpi ${A.length ? '' : 'mt'}">
    ${kpi('Bereit', A.filter(a => a.status === 'waiting').length, 'zap', '#22d3ee', '0 Tokens im Wartezustand')}
    ${kpi('Arbeiten gerade', A.filter(a => a.status === 'working').length, 'bot', '#a78bfa', `${A.length} Agenten insgesamt`)}
    ${kpi('Warteschlange', T.filter(t => t.status === 'queued').length, 'clock', '#fbbf24', `${T.filter(t => t.status === 'running').length} laufen`)}
    ${kpi('Heute erledigt', doneToday, 'check', '#34d399', `${S.server?.stats?.done ?? 0} insgesamt`)}
  </div>`;
  html += `<div class="grid grid-2 mt">
    <div class="panel">
      <div class="panel-head"><h3>${icon('bot', 'sm')} Orchester</h3><button class="btn btn-sm btn-ghost" data-action="nav" data-view="agents">Alle →</button></div>
      <div class="panel-body">${A.length ? `<div class="stage">${A.map(stageAgent).join('')}</div>` : '<div class="faint">Noch keine Agenten – melde den ersten an.</div>'}</div>
      <div class="panel-head" style="padding-top:4px"><h3>${icon('list', 'sm')} Aktive Aufträge</h3><button class="btn btn-sm btn-ghost" data-action="nav" data-view="tasks">Board →</button></div>
      <div class="panel-body">${active.length ? active.slice(0, 8).map(taskRow).join('') : '<div class="faint">Keine aktiven Aufträge. Alles ruhig.</div>'}</div>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>${icon('pulse', 'sm')} Live-Aktivität</h3></div>
      <div class="panel-body"><div class="feed">${[...S.events].reverse().slice(0, 14).map(feedItem).join('') || '<div class="faint">Noch nichts passiert.</div>'}</div></div>
    </div>
  </div>`;
  if (S.templates.length) {
    html += `<div class="section-title">Schnellstart-Vorlagen</div><div class="grid grid-cards">${S.templates.slice(0, 4).map(t => `
      <div class="panel tpl-card clickable" data-action="tpl-run" data-id="${t.id}">
        <div class="flex"><div class="tpl-icon">${esc(t.icon)}</div><div><div class="tpl-name">${esc(t.name)}</div><div class="faint" style="font-size:12px">→ ${esc(targetLabel(t.target))}</div></div>
        <span style="margin-left:auto" class="btn btn-sm btn-icon">${icon('play', 'sm')}</span></div>
      </div>`).join('')}</div>`;
  }
  return html;
}

function onboarding() {
  return `<div class="panel hero">
    <h2>Willkommen beim Dirigenten 🎼</h2>
    <p>Hier orchestrierst du deine KI-Agenten. Jede Claude-Code-Session kann sich mit einem Satz anmelden und wartet dann im Hintergrund – <b>ohne einen einzigen Token zu verbrauchen</b> –, bis du ihr einen Auftrag gibst.</p>
    <div class="code">${esc(joinPrompt())}<button class="btn btn-sm copy" data-action="copy" data-text="${esc(joinPrompt())}">${icon('copy', 'sm')} Kopieren</button></div>
    <div class="steps">
      <div class="step"><div class="n">1</div><b>Prompt kopieren</b><span>Füge den Satz oben in eine beliebige Claude-Code-Session ein.</span></div>
      <div class="step"><div class="n">2</div><b>Agent meldet sich an</b><span>Er registriert sich per curl und startet einen Warte-Befehl im Hintergrund.</span></div>
      <div class="step"><div class="n">3</div><b>Aufträge erteilen</b><span>Per Dashboard, Vorlage, Workflow, Manager-Agent oder curl von überall.</span></div>
    </div>
  </div>`;
}

function stageAgent(a) {
  const cur = a.runningTasks?.length ? S.tasks.find(t => t.id === a.runningTasks[0]) : null;
  const sub = a.status === 'working' && cur ? cur.title : (a.status === 'waiting' ? (a.runningTasks?.length ? `bereit · ${a.runningTasks.length} offen` : 'bereit für Aufträge') : STATUS[a.status]);
  return `<div class="stage-agent st-${a.status}" data-action="agent-send" data-id="${a.id}" title="Auftrag an ${esc(a.name)}">
    ${avatar(a, 'sm')}<div class="txt"><div class="nm">${esc(a.name)} ${a.role === 'manager' ? '👑' : ''}</div><div class="sub">${esc(sub)}</div></div><span class="dot ${a.status}"></span>
  </div>`;
}

function taskRow(t) {
  const a = agentById(t.assignedAgentId);
  return `<div class="task-row" data-action="task-open" data-id="${t.id}">
    ${taskPill(t.status)}<div class="title">${t.kind === 'notification' ? '↩︎ ' : ''}${esc(t.title)}</div>
    <div class="who">${a ? avatar(a, 'sm') + esc(a.name) : '→ ' + esc(targetLabel(t.target))}</div>
    <div class="faint nowrap" style="font-size:12px;width:78px;text-align:right">${ago(t.createdAt)}</div>
  </div>`;
}

const EV_ICON = { 'task.created': '📨', 'task.started': '⚡', 'task.completed': '✅', 'task.failed': '⚠️', 'task.progress': '📝', 'task.cancelled': '⛔', 'agent.registered': '👋', 'agent.waiting': '🟢', 'agent.offline': '💤', 'agent.removed': '🗑️', 'workflow.started': '🎼', 'workflow.completed': '🏁', 'workflow.failed': '💥', 'hub.started': '🚀' };
function feedItem(e) {
  const clickable = e.ref && e.ref.startsWith('t_');
  return `<div class="feed-item ${clickable ? 'clickable' : ''}" ${clickable ? `data-action="task-open" data-id="${e.ref}"` : ''}>
    <div class="feed-ico">${EV_ICON[e.type] || '•'}</div><div class="m">${esc(e.message)}</div><div class="t">${ago(e.time)}</div></div>`;
}

/* ───────── Ansicht: Agenten ───────── */
function vAgents() {
  if (!S.agents.length) return onboarding();
  const order = { working: 0, waiting: 1, idle: 2, offline: 3 };
  const list = [...S.agents].sort((a, b) => (a.role === 'manager' ? -1 : 0) - (b.role === 'manager' ? -1 : 0) || order[a.status] - order[b.status] || a.name.localeCompare(b.name));
  return `<div class="grid grid-cards">${list.map(agentCard).join('')}</div>`;
}

function agentCard(a) {
  const cur = (a.runningTasks || []).map(id => S.tasks.find(t => t.id === id)).filter(Boolean);
  return `<div class="panel agent-card st-${a.status}">
    <div class="agent-top">${avatar(a)}
      <div style="min-width:0;flex:1"><div class="agent-name">${esc(a.name)}</div><div class="flex gap-s" style="margin-top:3px">${statusPill(a.status)}${a.role === 'manager' ? '<span class="pill manager">Manager</span>' : ''}</div></div>
    </div>
    <div class="agent-desc">${esc(a.description) || '<span class="faint">Keine Beschreibung</span>'}</div>
    ${a.tags?.length ? `<div class="agent-meta">${a.tags.map(t => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
    ${a.cwd ? `<div class="agent-cwd" title="${esc(a.cwd)}">${icon('folder', 'sm')} ${esc(a.cwd.replace(/^\/Users\/[^/]+/, '~'))}</div>` : ''}
    ${cur.map(t => `<div class="agent-now" data-action="task-open" data-id="${t.id}">${icon('zap', 'sm')}<span>${esc(t.title)}</span></div>`).join('')}
    ${a.status === 'working' ? '<div class="working-bar"></div>' : ''}
    <div class="agent-stats"><span><b>${a.completed}</b> erledigt</span><span><b>${a.failed}</b> Fehler</span>${a.queuedForMe ? `<span><b>${a.queuedForMe}</b> in Warteschlange</span>` : ''}<span style="margin-left:auto">${ago(a.lastSeen)}</span></div>
    <div class="agent-actions">
      <button class="btn btn-sm" data-action="agent-send" data-id="${a.id}">${icon('send', 'sm')} Auftrag</button>
      <button class="btn btn-sm" data-action="agent-role" data-id="${a.id}">${icon('crown', 'sm')} ${a.role === 'manager' ? 'Zum Worker' : 'Zum Manager'}</button>
      <button class="btn btn-sm btn-icon" data-action="agent-edit" data-id="${a.id}" title="Bearbeiten">${icon('edit', 'sm')}</button>
      <button class="btn btn-sm btn-icon btn-danger" data-action="agent-del" data-id="${a.id}" title="Abmelden">${icon('trash', 'sm')}</button>
    </div>
  </div>`;
}

/* ───────── Ansicht: Aufträge ───────── */
function vTasks() {
  const q = ui.taskSearch.toLowerCase();
  let list = [...S.tasks].reverse();
  if (ui.taskFilter === 'mine') list = list.filter(t => t.createdBy === 'user');
  if (ui.taskFilter === 'agents') list = list.filter(t => t.createdBy?.startsWith('agent:'));
  if (ui.taskFilter === 'flows') list = list.filter(t => t.runId);
  if (q) list = list.filter(t => (t.title + ' ' + t.prompt + ' ' + (t.result || '')).toLowerCase().includes(q));
  const cols = [
    { id: 'queued', label: 'Warteschlange', dot: 'idle' },
    { id: 'running', label: 'In Arbeit', dot: 'working' },
    { id: 'done', label: 'Erledigt', dot: 'ok' },
    { id: 'failed', label: 'Fehler & Abbruch', dot: 'bad' },
  ];
  const chip = (id, l) => `<button class="chip ${ui.taskFilter === id ? 'active' : ''}" data-action="task-filter" data-f="${id}">${l}</button>`;
  return `<div class="filters">${chip('all', 'Alle')}${chip('mine', 'Von mir')}${chip('agents', 'Von Agenten')}${chip('flows', 'Workflows')}
    <input id="taskSearch" class="search" placeholder="Suchen…" value="${esc(ui.taskSearch)}" style="margin-left:auto"></div>
    <div class="kanban">${cols.map(c => {
      const items = list.filter(t => c.id === 'failed' ? (t.status === 'failed' || t.status === 'cancelled') : t.status === c.id);
      return `<div class="kcol"><div class="kcol-head"><span class="dot ${c.dot}"></span>${c.label}<span class="n">${items.length}</span></div>
        <div class="kcol-body">${items.slice(0, 80).map(kcard).join('') || '<div class="empty-col">–</div>'}</div></div>`;
    }).join('')}</div>`;
}

function kcard(t) {
  const a = agentById(t.assignedAgentId);
  return `<div class="kcard ${t.kind}" data-action="task-open" data-id="${t.id}">
    <div class="kt">${t.kind === 'notification' ? '↩︎ ' : ''}${esc(t.title)}</div>
    ${t.status === 'running' && t.progress?.length ? `<div class="kp">📝 ${esc(t.progress[t.progress.length - 1].text)}</div>` : ''}
    ${t.status === 'running' ? '<div class="working-bar"></div>' : ''}
    <div class="kf">${a ? avatar(a, 'sm') + esc(a.name) : '→ ' + esc(targetLabel(t.target))}${t.priority > 0 ? ` <span class="pill queued">P${t.priority}</span>` : ''}${t.status === 'cancelled' ? ' <span class="pill cancelled">abgebrochen</span>' : ''}<span class="time">${ago(t.finishedAt || t.startedAt || t.createdAt)}</span></div>
  </div>`;
}

/* ───────── Drawer: Auftragsdetails ───────── */
function openTask(id) { ui.drawerTask = id; renderDrawer(); $('#drawer').classList.add('open'); }
function closeDrawer() { ui.drawerTask = null; $('#drawer').classList.remove('open'); }
function renderDrawer() {
  const t = S.tasks.find(x => x.id === ui.drawerTask);
  if (!t) { closeDrawer(); return; }
  const a = agentById(t.assignedAgentId);
  const children = S.tasks.filter(x => x.parentId === t.id && x.id !== t.id);
  const parent = t.parentId ? S.tasks.find(x => x.id === t.parentId) : null;
  $('#drawer').innerHTML = `
    <div class="drawer-head"><div class="flex between">${taskPill(t.status)}<div class="flex gap-s">
      ${t.status === 'queued' || t.status === 'running' ? `<button class="btn btn-sm" data-action="task-cancel" data-id="${t.id}">${icon('stop', 'sm')} Abbrechen</button>` : `<button class="btn btn-sm" data-action="task-retry" data-id="${t.id}">${icon('refresh', 'sm')} Erneut</button>`}
      <button class="btn btn-sm btn-icon" data-action="task-dup" data-id="${t.id}" title="Als neuen Auftrag">${icon('copy', 'sm')}</button>
      <button class="btn btn-sm btn-icon btn-danger" data-action="task-del" data-id="${t.id}" title="Löschen">${icon('trash', 'sm')}</button>
      <button class="btn btn-sm btn-icon btn-ghost" data-action="drawer-close">${icon('x', 'sm')}</button></div></div>
      <h2 class="selectable">${esc(t.title)}</h2></div>
    <div class="drawer-body">
      <dl class="kv">
        <dt>Ziel</dt><dd>${esc(targetLabel(t.target))}</dd>
        <dt>Agent</dt><dd>${a ? `<span class="flex gap-s">${avatar(a, 'sm')}${esc(a.name)}</span>` : '<span class="faint">noch nicht zugewiesen</span>'}</dd>
        <dt>Von</dt><dd>${esc(creatorLabel(t.createdBy))}</dd>
        <dt>Erstellt</dt><dd>${ago(t.createdAt)}</dd>
        <dt>Dauer</dt><dd>${t.startedAt ? dur(t.startedAt, t.finishedAt) : '–'}</dd>
        <dt>ID</dt><dd class="mono selectable">${t.id}</dd>
        ${parent ? `<dt>Gehört zu</dt><dd class="clickable" data-action="task-open" data-id="${parent.id}"><a>${esc(parent.title)}</a></dd>` : ''}
      </dl>
      ${t.result ? `<div class="block-title flex between">Ergebnis <button class="btn btn-sm btn-ghost" data-action="copy" data-text="${esc(t.result)}">${icon('copy', 'sm')}</button></div><div class="result selectable">${esc(t.result)}</div>` : ''}
      ${t.error ? `<div class="block-title">Fehler</div><div class="result err selectable">${esc(t.error)}</div>` : ''}
      ${t.progress?.length ? `<div class="block-title">Verlauf</div><div class="timeline">${t.progress.map(p => `<div><small>${ago(p.time)}</small>${esc(p.text)}</div>`).join('')}</div>` : ''}
      ${children.length ? `<div class="block-title">Teilaufträge (${children.length})</div>${children.map(taskRow).join('')}` : ''}
      <div class="block-title flex between">Prompt <button class="btn btn-sm btn-ghost" data-action="copy" data-text="${esc(t.prompt)}">${icon('copy', 'sm')}</button></div>
      <div class="code selectable">${esc(t.prompt)}</div>
      <div class="block-title">Per curl</div>
      <div class="code">${esc(`curl -s ${BASE}/api/tasks/${t.id}`)}</div>
    </div>`;
}

/* ───────── Ansicht: Vorlagen ───────── */
function vTemplates() {
  if (!S.templates.length) return `<div class="panel empty"><div class="big">✨</div><h3>Noch keine Vorlagen</h3><p>Lege wiederverwendbare Aufträge mit {{variablen}} an.</p><button class="btn btn-primary" data-action="tpl-edit">Neue Vorlage</button></div>`;
  return `<div class="grid grid-cards">${S.templates.map(t => `
    <div class="panel tpl-card">
      <div class="flex"><div class="tpl-icon">${esc(t.icon)}</div><div style="min-width:0"><div class="tpl-name">${esc(t.name)}</div><div class="faint" style="font-size:12px">→ ${esc(targetLabel(t.target))}${t.scheduleMinutes ? ` · ⏱ alle ${t.scheduleMinutes} Min` : ''}</div></div></div>
      <div class="muted" style="font-size:13px">${esc(t.description) || ''}</div>
      <div class="tpl-prompt">${hlVars(t.prompt)}</div>
      <div class="flex gap-s" style="margin-top:auto">
        <button class="btn btn-sm btn-primary" data-action="tpl-run" data-id="${t.id}">${icon('play', 'sm')} Ausführen</button>
        <button class="btn btn-sm" data-action="tpl-edit" data-id="${t.id}">${icon('edit', 'sm')} Bearbeiten</button>
        <button class="btn btn-sm btn-icon" data-action="copy" data-text="${esc(`curl -s -X POST ${BASE}/api/templates/${t.id}/run -H 'Content-Type: application/json' -d '{"vars":{}}'`)}" title="curl kopieren">${icon('terminal', 'sm')}</button>
        <button class="btn btn-sm btn-icon btn-danger" data-action="tpl-del" data-id="${t.id}" style="margin-left:auto">${icon('trash', 'sm')}</button>
      </div>
    </div>`).join('')}</div>`;
}

/* ───────── Ansicht: Workflows ───────── */
function pipeline(steps, run) {
  return `<div class="pipeline">${steps.map((s, i) => {
    let cls = '';
    if (run) { if (i < run.currentStep) cls = 'done'; else if (i === run.currentStep && run.status === 'running') cls = 'active'; else if (i === run.currentStep && run.status === 'failed') cls = 'failed'; }
    return `${i ? '<div class="parrow"></div>' : ''}<div class="pstep ${cls}"><span class="num">${cls === 'done' ? '✓' : i + 1}</span>${esc(s.name)}<span class="faint" style="font-weight:500">· ${esc(targetLabel(s.target || (S.templates.find(t => t.id === s.templateId)?.target) || 'any'))}</span></div>`;
  }).join('')}</div>`;
}
function vWorkflows() {
  let html = '';
  if (!S.workflows.length) html += `<div class="panel empty"><div class="big">🎼</div><h3>Noch keine Workflows</h3><p>Verkette Schritte: Ergebnis von Schritt 1 fließt als {{prev}} in Schritt 2.</p><button class="btn btn-primary" data-action="wf-edit">Neuer Workflow</button></div>`;
  html += `<div class="grid" style="grid-template-columns:1fr">${S.workflows.map(w => `
    <div class="panel"><div class="panel-head"><h3>${esc(w.name)}</h3><div class="flex gap-s">
      <button class="btn btn-sm btn-primary" data-action="wf-run" data-id="${w.id}">${icon('play', 'sm')} Starten</button>
      <button class="btn btn-sm" data-action="wf-edit" data-id="${w.id}">${icon('edit', 'sm')}</button>
      <button class="btn btn-sm btn-icon btn-danger" data-action="wf-del" data-id="${w.id}">${icon('trash', 'sm')}</button></div></div>
      <div class="panel-body"><div class="muted mb" style="font-size:13px">${esc(w.description)}</div>${pipeline(w.steps)}</div></div>`).join('')}</div>`;
  const runs = [...S.runs].reverse();
  if (runs.length) {
    html += `<div class="section-title">Läufe</div><div class="panel"><div class="panel-body">${runs.slice(0, 30).map(r => {
      const wf = S.workflows.find(w => w.id === r.workflowId);
      const pct = Math.round((r.currentStep / Math.max(1, r.stepCount)) * 100);
      return `<div class="run-row"><div style="flex:1;min-width:0"><div class="flex gap-s"><b>${esc(r.workflowName)}</b>${taskPill(r.status === 'running' ? 'running' : r.status)}<span class="faint" style="font-size:12px">${ago(r.createdAt)}</span></div>
        <div class="faint" style="font-size:12px;margin:4px 0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.input || '(ohne Eingabe)')}</div>
        ${wf ? pipeline(wf.steps, r) : ''}</div>
        <div class="progress"><i style="width:${pct}%"></i></div><span class="faint" style="font-size:12px;width:40px">${r.currentStep}/${r.stepCount}</span>
        ${r.taskIds.length ? `<button class="btn btn-sm" data-action="task-open" data-id="${r.taskIds[r.taskIds.length - 1]}">Details</button>` : ''}
        ${r.status === 'running' ? `<button class="btn btn-sm btn-danger" data-action="run-cancel" data-id="${r.id}">${icon('stop', 'sm')}</button>` : ''}</div>`;
    }).join('')}</div></div>`;
  }
  return html;
}

/* ───────── Ansicht: Aktivität ───────── */
function vActivity() {
  return `<div class="panel"><div class="panel-body"><div class="feed">${[...S.events].reverse().map(feedItem).join('') || '<div class="faint">Noch keine Ereignisse.</div>'}</div></div></div>`;
}

/* ───────── Ansicht: Integration ───────── */
function codeBlock(s) { return `<div class="code">${esc(s)}<button class="btn btn-sm copy" data-action="copy" data-text="${esc(s)}">${icon('copy', 'sm')}</button></div>`; }
function vIntegrate() {
  const ex = [
    ['Auftrag an beliebigen Worker', `curl -s -X POST "${BASE}/api/tasks?target=any&title=Tests" --data-binary "Führe alle Tests aus und berichte."`],
    ['Auftrag an Agent nach Name (JSON)', `curl -s -X POST ${BASE}/api/tasks -H 'Content-Type: application/json' \\\n  -d '{"target":"agent:frontend","prompt":"Baue den Dark-Mode.","priority":5}'`],
    ['Ziel an den Manager', `curl -s -X POST "${BASE}/api/tasks?target=manager" --data-binary "Bringe die App in den App Store."`],
    ['Vorlage mit Variablen ausführen', `curl -s -X POST ${BASE}/api/templates/<id>/run -H 'Content-Type: application/json' \\\n  -d '{"vars":{"ziel":"Release 2.0"}}'`],
    ['Auf Ergebnis warten (blockierend)', `curl -s "${BASE}/api/tasks/<id>/wait?timeout=300"`],
    ['Live-Ereignisse abonnieren', `curl -N ${BASE}/api/events`],
    ['Text-Überblick (auch für Agenten)', `curl -s ${BASE}/api/overview`],
  ];
  return `
  <div class="grid grid-2">
    <div class="panel"><div class="panel-head"><h3>${icon('terminal', 'sm')} Agent anmelden (Claude Code)</h3></div><div class="panel-body">
      <p class="muted" style="margin-top:0">Einen dieser Sätze in eine Claude-Code-Session einfügen. Der Agent liest die Anleitung von <span class="mono">/join</span>, registriert sich und wartet dann tokenfrei im Hintergrund.</p>
      <div class="block-title">Als Worker</div>${codeBlock(joinPrompt())}
      <div class="block-title">Als Manager (orchestriert andere)</div>${codeBlock(joinPrompt('manager'))}
      <div class="block-title">Andere Agenten / Skripte</div>
      <p class="muted" style="margin:0 0 8px;font-size:13px">Jedes Programm, das HTTP spricht, kann Agent sein: registrieren, dann <span class="mono">/wait</span> long-pollen.</p>
      ${codeBlock(`curl -s -X POST ${BASE}/api/agents -d name=mein-bot -d tags=python\ncurl -s "${BASE}/api/agents/<id>/wait?format=json&timeout=60"`)}
    </div></div>
    <div class="panel"><div class="panel-head"><h3>${icon('hook', 'sm')} Webhooks</h3><button class="btn btn-sm" data-action="hook-add">${icon('plus', 'sm')} Hinzufügen</button></div><div class="panel-body">
      <p class="muted" style="margin-top:0;font-size:13px">Dirigent sendet Ereignisse als JSON-POST (z. B. an n8n, Zapier, Slack-Bridges, Home Assistant). Filter: <span class="mono">*</span>, <span class="mono">task.completed</span>, <span class="mono">agent.*</span> …</p>
      ${S.webhooks.length ? S.webhooks.map(h => `<div class="setting"><div class="txt"><b class="mono" style="font-size:12.5px;word-break:break-all">${esc(h.url)}</b><span>${esc(h.events.join(', '))} · ${esc(h.lastStatus || 'noch nicht ausgelöst')}</span></div>
        <label class="switch"><input type="checkbox" data-action="hook-toggle" data-id="${h.id}" ${h.active ? 'checked' : ''}><span></span></label>
        <button class="btn btn-sm" data-action="hook-test" data-id="${h.id}">Test</button>
        <button class="btn btn-sm btn-icon btn-danger" data-action="hook-del" data-id="${h.id}">${icon('trash', 'sm')}</button></div>`).join('') : '<div class="faint">Noch keine Webhooks.</div>'}
      <div class="block-title">Ereignistypen</div>
      <div class="agent-meta">${['task.created', 'task.started', 'task.progress', 'task.completed', 'task.failed', 'task.cancelled', 'agent.registered', 'agent.waiting', 'agent.offline', 'workflow.started', 'workflow.completed', 'workflow.failed'].map(e => `<span class="tag mono">${e}</span>`).join('')}</div>
    </div></div>
  </div>
  <div class="section-title">Beispiele</div>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(420px,1fr))">${ex.map(([t, c]) => `<div class="panel"><div class="panel-head"><h3>${esc(t)}</h3></div><div class="panel-body">${codeBlock(c)}</div></div>`).join('')}</div>
  <div class="section-title">Ziel-Syntax</div>
  <div class="panel"><div class="panel-body"><table class="table">
    <tr><td class="mono">any</td><td>Nächster freier Worker (Manager ausgenommen)</td></tr>
    <tr><td class="mono">manager</td><td>Ein Agent mit Manager-Rolle – er zerlegt und delegiert</td></tr>
    <tr><td class="mono">all</td><td>Ein Exemplar pro Worker (Broadcast)</td></tr>
    <tr><td class="mono">agent:&lt;name|id&gt;</td><td>Ein bestimmter Agent</td></tr>
    <tr><td class="mono">tag:&lt;tag&gt;</td><td>Freier Agent mit diesem Tag</td></tr>
  </table></div></div>
  <div class="section-title">API-Referenz</div>
  <div class="panel"><div class="panel-body"><table class="table"><tr><th style="width:80px">Methode</th><th style="width:280px">Pfad</th><th>Beschreibung</th></tr>
    ${docs.map(d => `<tr><td><span class="method m-${d.method}">${d.method}</span></td><td class="mono selectable" style="font-size:12.5px">${esc(d.path)}</td><td class="muted">${esc(d.desc)}</td></tr>`).join('')}
  </table></div></div>`;
}

/* ───────── Ansicht: Einstellungen ───────── */
function vSettings() {
  const st = S.settings || {}, sv = S.server || {};
  return `<div class="panel"><div class="panel-body">
    <div class="setting"><div class="txt"><b>Port</b><span>Auf diesem Port lauscht der Server. Agenten verbinden sich mit <span class="mono">http://127.0.0.1:${st.port}</span>.</span></div>
      <input class="input" id="setPort" style="width:110px" value="${esc(st.port)}"><button class="btn btn-sm" data-action="set-port">Übernehmen</button></div>
    <div class="setting"><div class="txt"><b>Zugriff aus dem Netzwerk</b><span>Erlaubt Agenten und Geräten im WLAN (z. B. iPad, andere Rechner) den Zugriff. Adressen: <span class="mono">${esc((sv.addresses || []).map(a => a + ':' + st.port).join(', ') || '–')}</span></span></div>
      <label class="switch"><input type="checkbox" data-action="set-lan" ${st.lanAccess ? 'checked' : ''}><span></span></label></div>
    <div class="setting"><div class="txt"><b>API-Key</b><span>Schützt Zugriffe aus dem Netzwerk (Header <span class="mono">X-API-Key</span>, <span class="mono">Authorization: Bearer</span> oder <span class="mono">?key=</span>). Lokale Zugriffe brauchen keinen Key.</span>
      ${st.apiKey ? `<div class="code mt" style="padding:8px 12px">${esc(st.apiKey)}<button class="btn btn-sm copy" data-action="copy" data-text="${esc(st.apiKey)}">${icon('copy', 'sm')}</button></div>` : ''}</div>
      <button class="btn btn-sm" data-action="set-key">${icon('key', 'sm')} ${st.apiKey ? 'Neu erzeugen' : 'Erzeugen'}</button>${st.apiKey ? `<button class="btn btn-sm btn-danger" data-action="clear-key">Entfernen</button>` : ''}</div>
    ${st.lanAccess && !st.apiKey ? '<div class="banner">Netzwerkzugriff ist aktiv, aber ohne API-Key – jeder im WLAN kann Aufträge erteilen.</div>' : ''}
    <div class="setting"><div class="txt"><b>Mitteilungen</b><span>macOS-Mitteilung, wenn ein Agent einen Auftrag abschließt.</span></div>
      <label class="switch"><input type="checkbox" data-action="set-notify" ${st.notifications ? 'checked' : ''}><span></span></label></div>
    <div class="setting"><div class="txt"><b>Erscheinungsbild</b><span>Hell, dunkel oder wie das System.</span></div>
      <select class="select" id="setTheme" style="width:150px"><option value="">System</option><option value="dark">Dunkel</option><option value="light">Hell</option></select></div>
    <div class="setting"><div class="txt"><b>Daten</b><span class="mono">${esc(sv.dataPath || '')}</span></div>
      ${window.DIRIGENT_NATIVE ? `<button class="btn btn-sm" data-action="reveal" data-path="${esc(sv.dataPath || '')}">${icon('folder', 'sm')} Im Finder zeigen</button>` : ''}</div>
    <div class="setting"><div class="txt"><b>Version</b><span>Dirigent ${esc(sv.version)} · läuft seit ${ago(sv.startedAt)}</span></div></div>
  </div></div>`;
}

/* ───────── Modals ───────── */
function modal(html, cls = '') {
  $('#modalRoot').innerHTML = `<div class="modal-back" data-action="modal-bg"><div class="modal ${cls}">${html}</div></div>`;
  const f = $('#modalRoot [autofocus]'); if (f) setTimeout(() => f.focus(), 30);
}
const closeModal = () => { $('#modalRoot').innerHTML = ''; };

function targetPicker(current = 'any', name = 'target') {
  const opts = [['any', '⚡ Beliebiger Worker'], ['manager', '👑 Manager'], ['all', '📣 Alle Worker'],
    ...S.agents.map(a => [`agent:${a.id}`, `${a.status === 'waiting' ? '🟢' : a.status === 'working' ? '🟣' : '⚪️'} ${a.name}`]),
    ...[...new Set(S.agents.flatMap(a => a.tags || []))].map(t => [`tag:${t}`, `#${t}`])];
  if (current && !opts.some(o => o[0] === current)) opts.push([current, targetLabel(current)]);
  return `<div class="target-grid" data-picker="${name}">${opts.map(([v, l]) => `<button type="button" class="target-opt ${v === current ? 'active' : ''}" data-action="pick" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div>
    <input type="hidden" id="${name}" value="${esc(current)}">`;
}

function composeModal(opts = {}) {
  modal(`<div class="modal-head"><h2>Neuer Auftrag</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    ${S.templates.length ? `<div class="field"><label>Aus Vorlage</label><div class="target-grid">${S.templates.map(t => `<button type="button" class="target-opt" data-action="compose-tpl" data-id="${t.id}">${esc(t.icon)} ${esc(t.name)}</button>`).join('')}</div></div>` : ''}
    <div class="field"><label>Prompt</label><textarea class="textarea" id="cPrompt" autofocus placeholder="Was soll der Agent tun?">${esc(opts.prompt || '')}</textarea></div>
    <div class="field"><label>An</label>${targetPicker(opts.target || 'any', 'cTarget')}</div>
    <div class="row"><div class="field"><label>Titel (optional)</label><input class="input" id="cTitle" value="${esc(opts.title || '')}" placeholder="Wird sonst aus dem Prompt erzeugt"></div>
      <div class="field" style="max-width:140px"><label>Priorität</label><input class="input" id="cPrio" type="number" value="${esc(opts.priority || 0)}"></div></div>
    ${!S.agents.length ? '<div class="banner info">Noch kein Agent angemeldet – der Auftrag wartet in der Warteschlange, bis sich einer meldet.</div>' : ''}
  </div>
  <div class="modal-foot"><span class="faint" style="margin-right:auto;font-size:12px"><kbd>⌘</kbd> <kbd>↵</kbd> zum Senden</span><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="compose-send">${icon('send', 'sm')} Senden</button></div>`);
}

async function composeSend() {
  const prompt = $('#cPrompt').value.trim();
  if (!prompt) { $('#cPrompt').focus(); return; }
  try {
    const r = await api('POST', '/api/tasks', { prompt, target: $('#cTarget').value, title: $('#cTitle').value, priority: +$('#cPrio').value || 0, createdBy: 'user' });
    closeModal(); toast('📨', `${r.tasks.length > 1 ? r.tasks.length + ' Aufträge' : 'Auftrag'} gesendet → ${targetLabel($('#cTarget')?.value || r.tasks[0].target)}`);
  } catch (e) { toast('⚠️', e.message); }
}

function joinModal() {
  modal(`<div class="modal-head"><h2>Agent anmelden</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    <p class="muted" style="margin-top:0">Füge einen dieser Sätze in Claude Code ein. Der Agent registriert sich, startet einen Warte-Befehl <b>im Hintergrund</b> und beendet seinen Zug – ab da verbraucht er <b>0 Tokens</b>, bis ein Auftrag kommt.</p>
    <div class="block-title">Worker</div>${codeBlock(joinPrompt())}
    <div class="block-title">Manager</div>${codeBlock(joinPrompt('manager'))}
    <div class="block-title">Mit Name & Tags</div>${codeBlock(`Melde dich bei Dirigent als Agent "frontend" mit den Tags web,react an und halte dich bereit. Anleitung: curl -s "${BASE}/join?name=frontend&tags=web,react"`)}
  </div><div class="modal-foot"><button class="btn btn-primary" data-action="modal-close">Fertig</button></div>`);
}

function tplModal(id) {
  const t = S.templates.find(x => x.id === id) || { name: '', description: '', prompt: '', target: 'any', icon: '✨', scheduleMinutes: 0 };
  modal(`<div class="modal-head"><h2>${id ? 'Vorlage bearbeiten' : 'Neue Vorlage'}</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    <div class="row"><div class="field" style="max-width:80px"><label>Icon</label><input class="input" id="tIcon" value="${esc(t.icon)}" style="text-align:center;font-size:18px"></div>
      <div class="field"><label>Name</label><input class="input" id="tName" value="${esc(t.name)}" autofocus placeholder="z. B. Security-Audit"></div></div>
    <div class="field"><label>Beschreibung</label><input class="input" id="tDesc" value="${esc(t.description)}"></div>
    <div class="field"><label>Prompt</label><textarea class="textarea" id="tPrompt" style="min-height:170px" placeholder="Nutze {{variablen}} für Werte, die beim Start abgefragt werden.">${esc(t.prompt)}</textarea>
      <span class="hint">Variablen in <span class="mono">{{doppelten_klammern}}</span> werden beim Ausführen abgefragt.</span></div>
    <div class="field"><label>Standard-Ziel</label>${targetPicker(t.target, 'tTarget')}</div>
    <div class="field" style="max-width:260px"><label>Zeitplan: alle … Minuten (0 = aus)</label><input class="input" id="tSched" type="number" min="0" value="${esc(t.scheduleMinutes)}"></div>
  </div>
  <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="tpl-save" data-id="${id || ''}">${icon('check', 'sm')} Speichern</button></div>`, 'wide');
}

function tplRunModal(id) {
  const t = S.templates.find(x => x.id === id); if (!t) return;
  const vars = varsOf(t.prompt);
  modal(`<div class="modal-head"><h2>${esc(t.icon)} ${esc(t.name)}</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    <div class="tpl-prompt mb" style="max-height:160px">${hlVars(t.prompt)}</div>
    ${vars.map((v, i) => `<div class="field"><label>{{${esc(v)}}}</label><textarea class="input" rows="2" data-var="${esc(v)}" ${i === 0 ? 'autofocus' : ''}></textarea></div>`).join('')}
    <div class="field"><label>An</label>${targetPicker(t.target, 'rTarget')}</div>
  </div>
  <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="tpl-go" data-id="${t.id}">${icon('play', 'sm')} Ausführen</button></div>`);
}

function wfModal(id) {
  const w = S.workflows.find(x => x.id === id) || { name: '', description: '', steps: [{ name: 'Schritt 1', prompt: '{{input}}', target: 'any', templateId: null }] };
  ui.wfDraft = JSON.parse(JSON.stringify(w.steps));
  const draw = () => {
    modal(`<div class="modal-head"><h2>${id ? 'Workflow bearbeiten' : 'Neuer Workflow'}</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
    <div class="modal-body">
      <div class="field"><label>Name</label><input class="input" id="wName" value="${esc(ui.wfName ?? w.name)}"></div>
      <div class="field"><label>Beschreibung</label><input class="input" id="wDesc" value="${esc(ui.wfDesc ?? w.description)}"></div>
      <div class="banner info">Variablen: <span class="mono">{{input}}</span> = Start-Eingabe, <span class="mono">{{prev}}</span> = Ergebnis des vorigen Schritts, <span class="mono">{{step1}}</span>, <span class="mono">{{step2}}</span> … = Ergebnisse einzelner Schritte.</div>
      ${ui.wfDraft.map((s, i) => `<div class="panel mb" style="padding:14px">
        <div class="flex between mb"><b>Schritt ${i + 1}</b><div class="flex gap-s">
          <button class="btn btn-sm btn-icon" data-action="wf-up" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn btn-sm btn-icon" data-action="wf-down" data-i="${i}" ${i === ui.wfDraft.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="btn btn-sm btn-icon btn-danger" data-action="wf-rm" data-i="${i}">${icon('trash', 'sm')}</button></div></div>
        <div class="row"><div class="field"><label>Name</label><input class="input" data-step="${i}" data-k="name" value="${esc(s.name)}"></div>
          <div class="field"><label>Vorlage (optional)</label><select class="select" data-step="${i}" data-k="templateId"><option value="">– eigener Prompt –</option>${S.templates.map(t => `<option value="${t.id}" ${t.id === s.templateId ? 'selected' : ''}>${esc(t.icon + ' ' + t.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Ziel</label><select class="select" data-step="${i}" data-k="target">${targetOptions(s.target)}</select></div></div>
        <div class="field" style="margin-bottom:0"><label>Prompt ${s.templateId ? '(leer = Prompt der Vorlage)' : ''}</label><textarea class="textarea" style="min-height:80px" data-step="${i}" data-k="prompt">${esc(s.prompt)}</textarea></div>
      </div>`).join('')}
      <button class="btn w-full" data-action="wf-add">${icon('plus', 'sm')} Schritt hinzufügen</button>
    </div>
    <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="wf-save" data-id="${id || ''}">${icon('check', 'sm')} Speichern</button></div>`, 'wide');
  };
  ui.wfName = undefined; ui.wfDesc = undefined;
  ui.wfRedraw = () => { ui.wfName = $('#wName').value; ui.wfDesc = $('#wDesc').value; draw(); };
  draw();
}
function targetOptions(cur) {
  const opts = [['', 'Standard (Vorlage / beliebig)'], ['any', 'Beliebiger Worker'], ['manager', 'Manager'], ['all', 'Alle Worker'],
    ...S.agents.map(a => [`agent:${a.name}`, a.name]), ...[...new Set(S.agents.flatMap(a => a.tags || []))].map(t => [`tag:${t}`, '#' + t])];
  if (cur && !opts.some(o => o[0] === cur)) opts.push([cur, targetLabel(cur)]);
  return opts.map(([v, l]) => `<option value="${esc(v)}" ${v === (cur || '') ? 'selected' : ''}>${esc(l)}</option>`).join('');
}

function wfRunModal(id) {
  const w = S.workflows.find(x => x.id === id); if (!w) return;
  modal(`<div class="modal-head"><h2>🎼 ${esc(w.name)} starten</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">${pipeline(w.steps)}<div class="field mt"><label>Eingabe ({{input}})</label><textarea class="textarea" id="wInput" autofocus placeholder="z. B. Beschreibung des Features"></textarea></div></div>
  <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="wf-go" data-id="${w.id}">${icon('play', 'sm')} Starten</button></div>`, 'wide');
}

function agentEditModal(id) {
  const a = agentById(id); if (!a) return;
  modal(`<div class="modal-head"><h2>${esc(a.name)} bearbeiten</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    <div class="field"><label>Name</label><input class="input" id="aName" value="${esc(a.name)}"></div>
    <div class="field"><label>Beschreibung</label><input class="input" id="aDesc" value="${esc(a.description)}"></div>
    <div class="field"><label>Tags (kommagetrennt)</label><input class="input" id="aTags" value="${esc((a.tags || []).join(', '))}"></div>
    <div class="field"><label>Rolle</label><select class="select" id="aRole"><option value="worker" ${a.role !== 'manager' ? 'selected' : ''}>Worker</option><option value="manager" ${a.role === 'manager' ? 'selected' : ''}>Manager (orchestriert)</option></select>
      <span class="hint">Die Rolle wirkt ab dem nächsten Auftrag: Manager erhalten die Orchestrierungs-Anleitung und die Agentenliste.</span></div>
    <div class="field"><label>Farbe</label><div class="target-grid">${['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EC4899', '#3B82F6', '#EF4444', '#14B8A6', '#A855F7', '#F97316'].map(c => `<button type="button" class="target-opt ${c === a.color ? 'active' : ''}" data-action="pick-color" data-c="${c}" style="width:30px;height:30px;padding:0;background:${c}"></button>`).join('')}</div><input type="hidden" id="aColor" value="${esc(a.color)}"></div>
  </div>
  <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="agent-save" data-id="${a.id}">Speichern</button></div>`);
}

function hookModal() {
  modal(`<div class="modal-head"><h2>Webhook hinzufügen</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body"><div class="field"><label>URL</label><input class="input" id="hUrl" autofocus placeholder="https://…"></div>
  <div class="field"><label>Ereignisse</label><input class="input" id="hEvents" value="*"><span class="hint">Kommagetrennt, z. B. <span class="mono">task.completed, task.failed, agent.*</span></span></div></div>
  <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="hook-save">Hinzufügen</button></div>`);
}

async function confirmAsk(msg) { return window.confirm(msg); }

/* ───────── Aktionen ───────── */
const actions = {
  nav: (el) => { ui.view = el.dataset.view; try { localStorage.setItem('dirigent.view', ui.view); } catch {} closeDrawer(); render(); $('#view').scrollTop = 0; },
  join: () => joinModal(),
  compose: () => composeModal(),
  copy: (el) => copy(el.dataset.text),
  'open-browser': () => openExternal(BASE),
  reveal: (el) => window.webkit?.messageHandlers?.dirigent?.postMessage({ action: 'reveal', path: el.dataset.path }),
  'modal-close': () => closeModal(),
  'modal-bg': (el, ev) => { if (ev.target === el) closeModal(); },
  pick: (el) => { const g = el.closest('[data-picker]'); g.querySelectorAll('.target-opt').forEach(b => b.classList.remove('active')); el.classList.add('active'); $('#' + g.dataset.picker).value = el.dataset.v; },
  'pick-color': (el) => { el.parentElement.querySelectorAll('.target-opt').forEach(b => b.classList.remove('active')); el.classList.add('active'); $('#aColor').value = el.dataset.c; },
  'compose-tpl': (el) => { const t = S.templates.find(x => x.id === el.dataset.id); if (!t) return; $('#cPrompt').value = t.prompt; $('#cTitle').value = t.name; const b = document.querySelector(`[data-picker="cTarget"] [data-v="${CSS.escape(t.target)}"]`); if (b) actions.pick(b); $('#cPrompt').focus(); },
  'compose-send': () => composeSend(),
  'task-open': (el) => openTask(el.dataset.id),
  'drawer-close': () => closeDrawer(),
  'task-filter': (el) => { ui.taskFilter = el.dataset.f; render(); },
  'task-cancel': async (el) => { await api('POST', `/api/tasks/${el.dataset.id}/cancel`).catch(e => toast('⚠️', e.message)); },
  'task-retry': async (el) => { await api('POST', `/api/tasks/${el.dataset.id}/retry`).catch(e => toast('⚠️', e.message)); },
  'task-del': async (el) => { if (!(await confirmAsk('Auftrag löschen?'))) return; await api('DELETE', `/api/tasks/${el.dataset.id}`); closeDrawer(); },
  'task-dup': (el) => { const t = S.tasks.find(x => x.id === el.dataset.id); closeDrawer(); composeModal({ prompt: t.prompt, target: t.target, title: t.title, priority: t.priority }); },
  'agent-send': (el) => composeModal({ target: `agent:${el.dataset.id}` }),
  'agent-role': async (el) => { const a = agentById(el.dataset.id); await api('PATCH', `/api/agents/${a.id}`, { role: a.role === 'manager' ? 'worker' : 'manager' }); toast('👑', a.role === 'manager' ? `${a.name} ist jetzt Worker` : `${a.name} ist jetzt Manager`); },
  'agent-edit': (el) => agentEditModal(el.dataset.id),
  'agent-save': async (el) => { await api('PATCH', `/api/agents/${el.dataset.id}`, { name: $('#aName').value, description: $('#aDesc').value, tags: $('#aTags').value.split(',').map(s => s.trim()).filter(Boolean), role: $('#aRole').value, color: $('#aColor').value }); closeModal(); },
  'agent-del': async (el) => { const a = agentById(el.dataset.id); if (!(await confirmAsk(`${a.name} abmelden? Laufende Aufträge gehen zurück in die Warteschlange.`))) return; await api('DELETE', `/api/agents/${a.id}`); },
  'tpl-edit': (el) => tplModal(el.dataset.id),
  'tpl-save': async (el) => {
    const body = { name: $('#tName').value || 'Vorlage', description: $('#tDesc').value, prompt: $('#tPrompt').value, target: $('#tTarget').value, icon: $('#tIcon').value || '✨', scheduleMinutes: +$('#tSched').value || 0 };
    if (!body.prompt.trim()) { $('#tPrompt').focus(); return; }
    try { el.dataset.id ? await api('PUT', `/api/templates/${el.dataset.id}`, body) : await api('POST', '/api/templates', body); closeModal(); toast('✨', 'Vorlage gespeichert'); } catch (e) { toast('⚠️', e.message); }
  },
  'tpl-del': async (el) => { if (!(await confirmAsk('Vorlage löschen?'))) return; await api('DELETE', `/api/templates/${el.dataset.id}`); },
  'tpl-run': (el) => tplRunModal(el.dataset.id),
  'tpl-go': async (el) => {
    const vars = {}; document.querySelectorAll('[data-var]').forEach(i => { vars[i.dataset.var] = i.value; });
    try { const r = await api('POST', `/api/templates/${el.dataset.id}/run`, { vars, target: $('#rTarget').value, createdBy: 'user' }); closeModal(); toast('▶️', `${r.tasks.length} Auftrag/Aufträge gestartet`); } catch (e) { toast('⚠️', e.message); }
  },
  'wf-edit': (el) => wfModal(el.dataset.id),
  'wf-add': () => { syncWf(); ui.wfDraft.push({ name: `Schritt ${ui.wfDraft.length + 1}`, prompt: '{{prev}}', target: '', templateId: null }); ui.wfRedraw(); },
  'wf-rm': (el) => { syncWf(); ui.wfDraft.splice(+el.dataset.i, 1); ui.wfRedraw(); },
  'wf-up': (el) => { syncWf(); const i = +el.dataset.i; [ui.wfDraft[i - 1], ui.wfDraft[i]] = [ui.wfDraft[i], ui.wfDraft[i - 1]]; ui.wfRedraw(); },
  'wf-down': (el) => { syncWf(); const i = +el.dataset.i; [ui.wfDraft[i + 1], ui.wfDraft[i]] = [ui.wfDraft[i], ui.wfDraft[i + 1]]; ui.wfRedraw(); },
  'wf-save': async (el) => {
    syncWf();
    const body = { name: $('#wName').value || 'Workflow', description: $('#wDesc').value, steps: ui.wfDraft };
    try { el.dataset.id ? await api('PUT', `/api/workflows/${el.dataset.id}`, body) : await api('POST', '/api/workflows', body); closeModal(); toast('🎼', 'Workflow gespeichert'); } catch (e) { toast('⚠️', e.message); }
  },
  'wf-del': async (el) => { if (!(await confirmAsk('Workflow löschen?'))) return; await api('DELETE', `/api/workflows/${el.dataset.id}`); },
  'wf-run': (el) => wfRunModal(el.dataset.id),
  'wf-go': async (el) => { try { await api('POST', `/api/workflows/${el.dataset.id}/run`, { input: $('#wInput').value, createdBy: 'user' }); closeModal(); toast('🎼', 'Workflow gestartet'); } catch (e) { toast('⚠️', e.message); } },
  'run-cancel': async (el) => { await api('POST', `/api/runs/${el.dataset.id}/cancel`); },
  'hook-add': () => hookModal(),
  'hook-save': async () => { try { await api('POST', '/api/webhooks', { url: $('#hUrl').value.trim(), events: $('#hEvents').value.split(',').map(s => s.trim()).filter(Boolean) }); closeModal(); } catch (e) { toast('⚠️', e.message); } },
  'hook-test': async (el) => { await api('POST', `/api/webhooks/${el.dataset.id}/test`); toast('🪝', 'Test gesendet'); setTimeout(refresh, 1500); },
  'hook-del': async (el) => { await api('DELETE', `/api/webhooks/${el.dataset.id}`); },
  'set-port': async () => {
    const port = +$('#setPort').value;
    if (!port || port < 1 || port > 65535) return toast('⚠️', 'Ungültiger Port');
    await api('PUT', '/api/settings', { port });
    toast('🔁', `Server startet auf Port ${port} neu…`);
    setTimeout(() => { location.href = `${location.protocol}//${location.hostname}:${port}/`; }, 900);
  },
  'set-key': async () => { await api('POST', '/api/settings/apikey', {}); toast('🔑', 'Neuer API-Key erzeugt'); },
  'clear-key': async () => { await api('POST', '/api/settings/apikey', { clear: true }); },
};
function syncWf() {
  document.querySelectorAll('[data-step]').forEach(el => {
    const s = ui.wfDraft[+el.dataset.step]; if (!s) return;
    s[el.dataset.k] = el.value || (el.dataset.k === 'templateId' ? null : '');
  });
}

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT') return;
  const fn = actions[el.dataset.action];
  if (fn) { ev.preventDefault(); fn(el, ev); }
});
document.addEventListener('change', async (ev) => {
  const el = ev.target;
  if (el.dataset.action === 'hook-toggle') await api('PATCH', `/api/webhooks/${el.dataset.id}`, { active: el.checked });
  if (el.dataset.action === 'set-lan') { await api('PUT', '/api/settings', { lanAccess: el.checked }); toast('🌐', el.checked ? 'Netzwerkzugriff aktiviert' : 'Nur noch lokal erreichbar'); setTimeout(refresh, 1200); }
  if (el.dataset.action === 'set-notify') await api('PUT', '/api/settings', { notifications: el.checked });
  if (el.id === 'setTheme') applyTheme(el.value, true);
});
document.addEventListener('input', (ev) => {
  if (ev.target.id === 'taskSearch') { ui.taskSearch = ev.target.value; clearTimeout(ui.st); ui.st = setTimeout(render, 150); }
});
document.addEventListener('keydown', (ev) => {
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 'k') { ev.preventDefault(); composeModal(); }
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter' && $('#cPrompt')) { ev.preventDefault(); composeSend(); }
  if (ev.key === 'Escape') { if ($('#modalRoot').innerHTML) closeModal(); else closeDrawer(); }
});

function applyTheme(v, save) {
  if (v) document.documentElement.dataset.theme = v; else delete document.documentElement.dataset.theme;
  if (save) { try { localStorage.setItem('dirigent.theme', v); } catch {} }
  const sel = $('#setTheme'); if (sel) sel.value = v || '';
}

/* ───────── Start ───────── */
(async function init() {
  hydrateIcons();
  try { applyTheme(localStorage.getItem('dirigent.theme') || ''); } catch {}
  try { docs = (await api('GET', '/api/docs')).endpoints; } catch {}
  await refresh();
  connectEvents();
  setInterval(() => { if (ui.view === 'overview' || ui.view === 'agents' || ui.view === 'tasks') refreshSoon(); }, 15000);
  new MutationObserver(() => { const sel = $('#setTheme'); if (sel && !sel.dataset.init) { sel.dataset.init = 1; try { sel.value = localStorage.getItem('dirigent.theme') || ''; } catch {} } }).observe($('#view'), { childList: true });
})();
