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
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  org: '<rect x="9" y="3" width="6" height="5" rx="1.5"/><rect x="3" y="16" width="6" height="5" rx="1.5"/><rect x="15" y="16" width="6" height="5" rx="1.5"/><path d="M12 8v4M6 16v-2h12v2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5" opacity=".55"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};
const icon = (n, cls = '') => `<span class="ico ${cls}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[n] || ''}</svg></span>`;
function hydrateIcons(root = document) { root.querySelectorAll('[data-ico]').forEach(el => { el.outerHTML = icon(el.dataset.ico); }); }

/* ───────── Zustand ───────── */
let S = { agents: [], tasks: [], templates: [], workflows: [], runs: [], webhooks: [], projects: [], messages: [], events: [], settings: {}, server: {} };
let docs = [];
const ui = {
  view: (() => { try { return localStorage.getItem('dirigent.view') || 'overview'; } catch { return 'overview'; } })(),
  taskFilter: 'all', taskSearch: '', drawerTask: null, connected: false,
  project: null, openParts: new Set(), ask: null,
  chatAgent: null, chatTab: 'chat', drawerTab: 'chat',
  agentsMode: (() => { try { return localStorage.getItem('dirigent.agentsMode') || 'cards'; } catch { return 'cards'; } })(),
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
    else if (ev.type === 'project.planned') toast('📋', ev.message);
    else if (ev.type === 'message.question' && ev.data?.to === 'user') toast('❓', ev.message);
    else if (ev.type === 'message.sent' && ev.data?.to === 'user' && ev.data?.from !== 'user') toast('💬', ev.message);
    else if (ev.type === 'project.part.rework') toast('🔁', ev.message);
    else if (ev.type === 'project.completed') toast('🏁', ev.message);
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
  if (t.startsWith('team:')) return 'Team ' + (agentById(t.slice(5))?.name || t.slice(5));
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
  if (c.startsWith('project:')) return `Projekt ${projById(c.slice(8))?.name || ''} (freigegeben)`;
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
  { id: 'projects', label: 'Projekte', icon: 'layers', sub: 'Manager plant · du teilst ein und gibst frei · Worker setzen um' },
  { id: 'chats', label: 'Chats', icon: 'chat', sub: 'Mit jedem Agenten schreiben, Rückfragen beantworten, live mitlesen, unterbrechen' },
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
    projects: (S.projects || []).filter(p => p.status !== 'done' && p.status !== 'cancelled').length,
  };
  const needsYou = (S.projects || []).some(p => projAttention(p).length);
  counts.chats = openQuestionsToUser().length;
  $('#nav').innerHTML = VIEWS.map(v => v.sep ? '<div class="nav-sep"></div>' : `
    <button class="nav-item ${ui.view === v.id ? 'active' : ''}" data-action="nav" data-view="${v.id}">
      ${icon(v.icon)}<span>${v.label}</span>
      ${counts[v.id] ? `<span class="count ${v.id === 'agents' || v.id === 'tasks' || v.id === 'workflows' || v.id === 'chats' || (v.id === 'projects' && needsYou) ? 'live' : ''}" ${v.id === 'projects' && needsYou ? 'title="Braucht deine Freigabe"' : ''}>${counts[v.id]}</span>` : ''}
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
    projects: `<button class="btn" data-action="join">${icon('terminal')} Agent anmelden</button><button class="btn btn-primary" data-action="proj-new">${icon('plus')} Neues Projekt</button>`,
    tasks: `<button class="btn btn-primary" data-action="compose">${icon('send')} Neuer Auftrag</button>`,
    templates: `<button class="btn btn-primary" data-action="tpl-edit">${icon('plus')} Neue Vorlage</button>`,
    workflows: `<button class="btn btn-primary" data-action="wf-edit">${icon('plus')} Neuer Workflow</button>`,
    integrate: `<button class="btn" data-action="open-browser">${icon('globe')} Im Browser öffnen</button>`,
  };
  $('#topActions').innerHTML = actions[ui.view] || '';
  // Chats: nur Liste, Kopf und Verlauf aktualisieren – das Eingabefeld bleibt unangetastet
  if (ui.view === 'chats' && $('#chatComposer') && $('#chatComposer').dataset.agent === ui.chatAgent && agentById(ui.chatAgent)) {
    updateChats(); if (ui.drawerTask) renderDrawer(); return;
  }
  const views = { overview: vOverview, projects: vProjects, chats: vChats, agents: vAgents, tasks: vTasks, templates: vTemplates, workflows: vWorkflows, activity: vActivity, integrate: vIntegrate, settings: vSettings };
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
  const qs = openQuestionsToUser();
  if (qs.length) html += `<div class="panel mb"><div class="panel-head"><h3>❓ Rückfragen an dich (${qs.length})</h3><button class="btn btn-sm btn-ghost" data-action="nav" data-view="chats">Chats →</button></div><div class="panel-body">
    ${qs.slice(-5).map(m => `<div class="q-row"><b>${esc(partyLabel(m.from))}</b><span class="selectable">${esc(m.text)}</span>${m.taskId ? `<button class="btn btn-sm btn-ghost" data-action="task-open" data-id="${m.taskId}">Chat</button>` : ''}<button class="btn btn-sm btn-primary" data-action="msg-answer" data-id="${m.id}">Antworten</button></div>`).join('')}</div></div>`;
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
  const openProjects = (S.projects || []).filter(p => p.status !== 'done' && p.status !== 'cancelled');
  if (openProjects.length) {
    html += `<div class="section-title">Projekte</div><div class="grid grid-cards">${openProjects.slice(-4).reverse().map(projCard).join('')}</div>`;
  }
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

const EV_ICON = { 'message.sent': '💬', 'message.question': '❓', 'message.answered': '✅', 'project.created': '🗂️', 'project.planned': '📋', 'project.status': '🔄', 'project.part.approved': '🟢', 'project.part.accepted': '🏅', 'project.part.rework': '🔁', 'project.completed': '🏁', 'project.cancelled': '⛔', 'project.deleted': '🗑️', 'task.created': '📨', 'task.started': '⚡', 'task.completed': '✅', 'task.failed': '⚠️', 'task.progress': '📝', 'task.cancelled': '⛔', 'agent.registered': '👋', 'agent.waiting': '🟢', 'agent.offline': '💤', 'agent.removed': '🗑️', 'workflow.started': '🎼', 'workflow.completed': '🏁', 'workflow.failed': '💥', 'hub.started': '🚀' };
function feedItem(e) {
  const clickable = e.ref && (e.ref.startsWith('t_') || (e.ref.startsWith('pj_') && projById(e.ref)));
  return `<div class="feed-item ${clickable ? 'clickable' : ''}" ${clickable ? `data-action="${e.ref.startsWith('pj_') ? 'proj-open' : 'task-open'}" data-id="${e.ref}"` : ''}>
    <div class="feed-ico">${EV_ICON[e.type] || '•'}</div><div class="m">${esc(e.message)}</div><div class="t">${ago(e.time)}</div></div>`;
}

/* ───────── Ansicht: Agenten ───────── */
function vAgents() {
  if (!S.agents.length) return onboarding();
  const chip = (m, l) => `<button class="chip ${ui.agentsMode === m ? 'active' : ''}" data-action="agents-mode" data-m="${m}">${l}</button>`;
  const head = `<div class="filters">${chip('cards', 'Karten')}${chip('org', 'Organigramm')}</div>`;
  if (ui.agentsMode === 'org') return head + orgChart();
  const order = { working: 0, waiting: 1, idle: 2, offline: 3 };
  const list = [...S.agents].sort((a, b) => (a.role === 'manager' ? -1 : 0) - (b.role === 'manager' ? -1 : 0) || order[a.status] - order[b.status] || a.name.localeCompare(b.name));
  return head + `<div class="grid grid-cards">${list.map(agentCard).join('')}</div>`;
}

function agentCard(a) {
  const cur = (a.runningTasks || []).map(id => S.tasks.find(t => t.id === id)).filter(Boolean);
  return `<div class="panel agent-card st-${a.status}">
    <div class="agent-top">${avatar(a)}
      <div style="min-width:0;flex:1"><div class="agent-name">${esc(a.name)}</div>${agentById(a.supervisorId) ? `<div class="faint" style="font-size:11.5px">untersteht ${esc(agentById(a.supervisorId).name)}</div>` : ''}<div class="flex gap-s" style="margin-top:3px">${statusPill(a.status)}${a.role === 'manager' ? '<span class="pill manager">Manager</span>' : ''}</div></div>
    </div>
    <div class="agent-desc">${esc(a.description) || '<span class="faint">Keine Beschreibung</span>'}</div>
    ${a.tags?.length ? `<div class="agent-meta">${a.tags.map(t => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
    ${a.cwd ? `<div class="agent-cwd" title="${esc(a.cwd)}">${icon('folder', 'sm')} ${esc(a.cwd.replace(/^\/Users\/[^/]+/, '~'))}</div>` : ''}
    ${cur.map(t => `<div class="agent-now" data-action="task-open" data-id="${t.id}">${icon('zap', 'sm')}<span>${esc(t.title)}</span></div>`).join('')}
    ${(S.projects || []).flatMap(p => p.status === 'cancelled' ? [] : p.parts.filter(x => x.agentId === a.id && ['draft', 'waiting', 'queued'].includes(x.status)).map(x => `<div class="agent-plan" data-action="proj-open" data-id="${p.id}">📌<span>${esc(p.name)} · ${esc(x.name)}</span><em>${x.status === 'draft' ? 'eingeteilt · wartet auf Freigabe' : 'freigegeben'}</em></div>`)).join('')}
    ${a.status === 'working' ? '<div class="working-bar"></div>' : ''}
    <div class="agent-stats"><span><b>${a.completed}</b> erledigt</span><span><b>${a.failed}</b> Fehler</span>${a.queuedForMe ? `<span><b>${a.queuedForMe}</b> in Warteschlange</span>` : ''}<span style="margin-left:auto">${ago(a.lastSeen)}</span></div>
    <div class="agent-actions">
      <button class="btn btn-sm" data-action="agent-send" data-id="${a.id}">${icon('send', 'sm')} Auftrag</button>
      <button class="btn btn-sm" data-action="chat-open" data-id="${a.id}">${icon('chat', 'sm')} Chat</button>
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

/* ───────── Drawer: Auftrag als Chat ───────── */
function openTask(id) {
  ui.drawerTask = id; ui.drawerTab = 'chat';
  $('#drawer').dataset.key = '';
  renderDrawer(true);
  $('#drawer').classList.add('open');
}
function closeDrawer() { ui.drawerTask = null; $('#drawer').classList.remove('open'); $('#drawer').dataset.key = ''; }
function drawerHeadHtml(t) {
  const nMsg = (S.messages || []).filter(m => m.taskId === t.id || m.viaTaskId === t.id).length + (t.progress || []).length;
  const tab = (id, label) => `<button class="tab ${ui.drawerTab === id ? 'active' : ''}" data-action="drawer-tab" data-tab="${id}">${label}</button>`;
  return `<div class="flex between">${taskPill(t.status)}<div class="flex gap-s">
      ${t.status === 'queued' || t.status === 'running' ? `<button class="btn btn-sm btn-danger" data-action="task-cancel" data-id="${t.id}">${icon('stop', 'sm')} Abbrechen</button>` : `<button class="btn btn-sm" data-action="task-retry" data-id="${t.id}">${icon('refresh', 'sm')} Erneut</button>`}
      <button class="btn btn-sm btn-icon" data-action="task-dup" data-id="${t.id}" title="Als neuen Auftrag">${icon('copy', 'sm')}</button>
      <button class="btn btn-sm btn-icon btn-danger" data-action="task-del" data-id="${t.id}" title="Löschen">${icon('trash', 'sm')}</button>
      <button class="btn btn-sm btn-icon btn-ghost" data-action="drawer-close">${icon('x', 'sm')}</button></div></div>
    <h2 class="selectable">${esc(t.title)}</h2>
    <div class="tabs" style="margin-top:12px">${tab('chat', `💬 Chat${nMsg ? ` <span class="faint">${nMsg}</span>` : ''}`)}${tab('live', '🖥️ Live')}${t.docPath || t.docFile ? tab('doc', '📄 Beschreibung') : ''}${tab('details', 'ℹ️ Details')}</div>`;
}
function taskDetailsHtml(t) {
  const a = agentById(t.assignedAgentId);
  const children = S.tasks.filter(x => x.parentId === t.id && x.id !== t.id);
  const parent = t.parentId ? S.tasks.find(x => x.id === t.parentId) : null;
  return `<dl class="kv">
      <dt>Ziel</dt><dd>${esc(targetLabel(t.target))}</dd>
      <dt>Agent</dt><dd>${a ? `<span class="flex gap-s clickable" data-action="chat-open" data-id="${a.id}">${avatar(a, 'sm')}${esc(a.name)}</span>` : '<span class="faint">noch nicht zugewiesen</span>'}</dd>
      <dt>Von</dt><dd>${esc(creatorLabel(t.createdBy))}</dd>
      <dt>Erstellt</dt><dd>${ago(t.createdAt)}</dd>
      <dt>Dauer</dt><dd>${t.startedAt ? dur(t.startedAt, t.finishedAt) : '–'}</dd>
      <dt>ID</dt><dd class="mono selectable">${t.id}</dd>
      ${t.docFile ? `<dt>Beschreibung</dt><dd class="mono selectable" style="font-size:12px;word-break:break-all">${esc(t.docFile)}</dd>` : ''}
      ${t.projectId && projById(t.projectId) ? `<dt>Projekt</dt><dd class="clickable" data-action="proj-open" data-id="${t.projectId}"><a>${esc(projById(t.projectId).name)}</a></dd>` : ''}
      ${parent ? `<dt>Gehört zu</dt><dd class="clickable" data-action="task-open" data-id="${parent.id}"><a>${esc(parent.title)}</a></dd>` : ''}
    </dl>
    ${t.result ? `<div class="block-title flex between">Ergebnis <button class="btn btn-sm btn-ghost" data-action="copy" data-text="${esc(t.result)}">${icon('copy', 'sm')}</button></div><div class="result selectable">${esc(t.result)}</div>` : ''}
    ${t.error ? `<div class="block-title">Fehler</div><div class="result err selectable">${esc(t.error)}</div>` : ''}
    ${children.length ? `<div class="block-title">Teilaufträge (${children.length})</div>${children.map(taskRow).join('')}` : ''}
    <div class="block-title flex between">Prompt <button class="btn btn-sm btn-ghost" data-action="copy" data-text="${esc(t.prompt)}">${icon('copy', 'sm')}</button></div>
    <div class="code selectable">${esc(t.prompt)}</div>
    <div class="block-title">Per curl</div>
    <div class="code">${esc(`curl -s ${BASE}/api/tasks/${t.id}`)}</div>`;
}
function taskComposerHtml(t) {
  const a = agentById(t.assignedAgentId);
  const mgr = agentById(taskManagerRef(t));
  const done = !['queued', 'running'].includes(t.status);
  return `<div class="composer" id="drawerComposer">
    <textarea class="textarea" id="chatText" placeholder="${done ? 'Nachfrage' : 'Nachricht'} an ${esc(a?.name || 'den Agenten')} … (⌘↵ senden)"></textarea>
    <div class="composer-row">
      <select class="select sm" id="chatTo" style="min-width:0"><option value="agent">An ${esc(a?.name || 'Agent des Auftrags')} (direkt)</option>${mgr ? `<option value="manager">An Manager ${esc(mgr.name)} (Ergänzung – er verteilt)</option>` : ''}</select>
      <label class="chk" title="Der Agent hält beim nächsten Kontakt sofort an und liest die Nachricht zuerst"><input type="checkbox" id="chatUrgent"> ⛔ Unterbrechen</label>
      <button class="btn btn-sm btn-primary" style="margin-left:auto" data-action="chat-send-task" data-id="${t.id}">${icon('send', 'sm')} Senden</button>
    </div></div>`;
}
function renderDrawer(force) {
  const t = S.tasks.find(x => x.id === ui.drawerTask);
  if (!t) { closeDrawer(); return; }
  const d = $('#drawer');
  const key = t.id + ':' + ui.drawerTab;
  const full = force || d.dataset.key !== key || !$('#drawerBody');
  if (full) {
    d.innerHTML = `<div class="drawer-head" id="drawerHead"></div><div class="drawer-body scroll-host" id="drawerBody"></div>${ui.drawerTab === 'chat' ? taskComposerHtml(t) : ''}`;
    d.dataset.key = key;
  }
  $('#drawerHead').innerHTML = drawerHeadHtml(t);
  const b = $('#drawerBody');
  const near = b.scrollHeight - b.scrollTop - b.clientHeight < 80, prev = b.scrollTop;
  if (ui.drawerTab === 'live') {
    if (full) {
      const a = agentById(t.assignedAgentId);
      b.innerHTML = a ? `<div class="banner info" style="font-size:12.5px">Live aus der Claude-Code-Sitzung von <b>${esc(a.name)}</b>${t.startedAt ? ' – ab Beginn dieses Auftrags' : ''}. Aktualisiert sich alle 3 s.</div><div id="liveBox">${liveHtml()}</div>`
        : '<div class="banner info">Noch kein Agent zugewiesen.</div>';
      if (a) startLive(a.id, t.startedAt ? t.startedAt - 5000 : null);
    }
    return;
  }
  if (ui.drawerTab === 'doc') b.innerHTML = docHtml(t);
  else if (ui.drawerTab === 'details') b.innerHTML = taskDetailsHtml(t);
  else b.innerHTML = `<div class="chat">${taskTimeline(t)}</div>`;
  b.scrollTop = ui.drawerTab === 'chat' && (full || near) ? b.scrollHeight : prev;
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
    ['Projekt anlegen (Manager plant, du gibst frei)', `curl -s -X POST ${BASE}/api/projects -H 'Content-Type: application/json' \\\n  -d '{"name":"Dark Mode","goal":"Dark Mode für die ganze App","cwd":"/pfad/zum/repo"}'`],
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
      <div class="agent-meta">${['task.created', 'task.started', 'task.progress', 'task.completed', 'task.failed', 'task.cancelled', 'agent.registered', 'agent.waiting', 'agent.offline', 'workflow.started', 'workflow.completed', 'workflow.failed', 'project.created', 'project.planned', 'project.status', 'project.part.approved', 'project.part.accepted', 'project.part.rework', 'project.completed'].map(e => `<span class="tag mono">${e}</span>`).join('')}</div>
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
    <div class="setting"><div class="txt"><b>Beschreibungsdateien</b><span>Agenten führen zu jedem Auftrag eine präzise Datei <span class="mono">.dirigent/…md</span> (wie eine README) – mit dem Auftrag wörtlich und allen Ergänzungen. Für Projekt-Teilbereiche immer an.</span></div>
      <label class="switch"><input type="checkbox" data-action="set-docs" ${st.docFiles === false ? '' : 'checked'}><span></span></label></div>
    <div class="setting"><div class="txt"><b>Erscheinungsbild</b><span>Hell, dunkel oder wie das System.</span></div>
      <select class="select" id="setTheme" style="width:150px"><option value="">System</option><option value="dark">Dunkel</option><option value="light">Hell</option></select></div>
    <div class="setting"><div class="txt"><b>Daten</b><span class="mono">${esc(sv.dataPath || '')}</span></div>
      ${window.DIRIGENT_NATIVE ? `<button class="btn btn-sm" data-action="reveal" data-path="${esc(sv.dataPath || '')}">${icon('folder', 'sm')} Im Finder zeigen</button>` : ''}</div>
    <div class="setting"><div class="txt"><b>Version</b><span>Dirigent ${esc(sv.version)} · läuft seit ${ago(sv.startedAt)}</span></div></div>
  </div></div>`;
}

/* ───────── Ansicht: Projekte ─────────
   Manager plant Teilbereiche + Standards → du prüfst, teilst ein, gibst frei → Worker setzen um → Manager nimmt ab. */
const PSTATUS = { planning: ['Planung', 'working'], review: ['Freigabe nötig', 'queued'], running: ['In Ausführung', 'running'], done: ['Abgeschlossen', 'done'], cancelled: ['Abgebrochen', 'cancelled'] };
const PART = {
  draft: ['Entwurf', 'queued'], waiting: ['Freigegeben · wartet', 'waiting'], queued: ['Freigegeben · Warteschlange', 'waiting'],
  running: ['In Arbeit', 'running'], delivered: ['Abgeliefert', 'idle'], accepted: ['Abgenommen', 'done'],
  failed: ['Fehler', 'failed'], cancelled: ['Abgebrochen', 'cancelled'],
};
const projPill = (s) => `<span class="pill ${PSTATUS[s]?.[1] || ''}">${PSTATUS[s]?.[0] || esc(s)}</span>`;
const partPill = (s) => `<span class="pill ${PART[s]?.[1] || ''}">${PART[s]?.[0] || esc(s)}</span>`;
const projById = (id) => (S.projects || []).find(p => p.id === id);
const planTaskOf = (p) => [...S.tasks].reverse().find(t => t.projectId === p.id && !t.partId && t.kind === 'task');
const planBusy = (p) => S.tasks.some(t => t.projectId === p.id && !t.partId && t.kind === 'task' && (t.status === 'queued' || t.status === 'running') && t.createdAt > (p.planSubmittedAt || 0));
function waveOf(p, id, d = 0) {
  const x = p.parts.find(q => q.id === id);
  if (!x || !x.dependsOn?.length || d > 50) return 0;
  return 1 + Math.max(...x.dependsOn.map(z => waveOf(p, z, d + 1)));
}

/** Was braucht gerade dich? */
function projAttention(p) {
  if (p.status === 'cancelled' || p.status === 'done') return [];
  const out = [];
  const drafts = p.parts.filter(x => x.status === 'draft');
  if (drafts.length && !planBusy(p)) out.push(`${drafts.length} zur Freigabe`);
  const unassigned = drafts.filter(x => !x.agentId).length;
  if (unassigned && !planBusy(p)) out.push(`${unassigned} nicht eingeteilt`);
  const delivered = p.parts.filter(x => x.status === 'delivered').length;
  if (delivered && !agentById(p.managerId)) out.push(`${delivered} zur Abnahme`);
  const failed = p.parts.filter(x => x.status === 'failed').length;
  if (failed) out.push(`${failed} fehlgeschlagen`);
  return out;
}

function projPhases(p) {
  const has = (...st) => p.parts.some(x => st.includes(x.status));
  const all = (...st) => p.parts.length > 0 && p.parts.every(x => st.includes(x.status));
  const busy = planBusy(p);
  const acc = p.parts.filter(x => x.status === 'accepted').length;
  const steps = [
    ['Planung', busy || !p.revision ? 'active' : 'done'],
    ['Prüfen & Einteilen', has('draft') && !busy ? 'active' : (p.revision && !has('draft') ? 'done' : '')],
    ['Ausführung', has('waiting', 'queued', 'running') ? 'active' : (all('delivered', 'accepted') ? 'done' : '')],
    [p.requireReview ? 'Abnahme' : 'Abnahme (auto)', has('delivered') ? 'active' : (all('accepted') ? 'done' : '')],
    [`Fertig · ${acc}/${p.parts.length}`, p.status === 'done' ? 'done' : ''],
  ];
  if (p.status === 'cancelled') steps.forEach(s => { if (s[1] === 'active') s[1] = 'failed'; });
  return `<div class="pipeline phases">${steps.map(([l, c], i) => `${i ? '<div class="parrow"></div>' : ''}<div class="pstep ${c}"><span class="num">${c === 'done' ? '✓' : i + 1}</span>${esc(l)}</div>`).join('')}</div>`;
}

function projCard(p) {
  const acc = p.parts.filter(x => x.status === 'accepted').length, total = p.parts.length;
  const mgr = agentById(p.managerId);
  const att = projAttention(p);
  const pct = total ? Math.round(acc / total * 100) : 0;
  return `<div class="panel proj-card clickable" data-action="proj-open" data-id="${p.id}">
    <div class="flex between"><div class="proj-name">${p.parentProjectId ? '<span class="tag">Unterprojekt</span> ' : ''}${esc(p.name)}</div>${projPill(p.status)}</div>
    <div class="muted proj-goal">${esc(p.goal)}</div>
    <div class="flex gap-s faint" style="font-size:12px">${mgr ? avatar(mgr, 'sm') + esc(mgr.name) : '👑 –'}<span>· ${p.standards.length} Standards · ${total} Teilbereiche</span></div>
    <div class="flex"><div class="progress" style="max-width:none"><i style="width:${pct}%"></i></div><span class="faint nowrap" style="font-size:12px">${acc}/${total}</span></div>
    ${att.length ? `<div class="attn">${icon('bell', 'sm')}<span>${esc(att.join(' · '))}</span></div>` : ''}
  </div>`;
}

function projIntro() {
  return `<div class="panel hero">
    <h2>Projekte: planen, freigeben, orchestrieren 🎼</h2>
    <p>Ein Manager-Agent zerlegt deine Aufgabe in Teilbereiche und legt sehr präzise Standards fest. Du prüfst den Plan, teilst die angemeldeten Agenten ein und gibst frei. <b>Erst nach deiner Freigabe</b> beginnt ein Worker mit seinem Teilbereich.</p>
    <button class="btn btn-primary" data-action="proj-new">${icon('plus', 'sm')} Neues Projekt</button>
    <div class="steps steps-4">
      <div class="step"><div class="n">1</div><b>Manager plant</b><span>Teilbereiche mit Pfaden, Abhängigkeiten und Abnahmekriterien, dazu 15–40 Standards.</span></div>
      <div class="step"><div class="n">2</div><b>Du prüfst & teilst ein</b><span>Prompts und Standards bearbeiten, Agenten zuweisen, Überarbeitung anfordern.</span></div>
      <div class="step"><div class="n">3</div><b>Freigabe → Worker startet</b><span>Jeder Worker bekommt genau den freigegebenen Prompt samt allen Standards.</span></div>
      <div class="step"><div class="n">4</div><b>Abnahme</b><span>Der Manager prüft jede Ablieferung. Nacharbeit geht zuerst wieder an dich zur Freigabe.</span></div>
    </div>
  </div>`;
}

function vProjects() {
  if (ui.project) { const p = projById(ui.project); if (p) return projDetail(p); ui.project = null; }
  const list = S.projects || [];
  if (!list.length) return projIntro();
  const active = list.filter(p => p.status !== 'done' && p.status !== 'cancelled').reverse();
  const past = list.filter(p => p.status === 'done' || p.status === 'cancelled').reverse();
  let html = active.length ? `<div class="grid grid-cards">${active.map(projCard).join('')}</div>` : '<div class="panel empty"><div class="big">🗂️</div><h3>Keine aktiven Projekte</h3><button class="btn btn-primary" data-action="proj-new">Neues Projekt</button></div>';
  if (past.length) html += `<div class="section-title">Abgeschlossen & abgebrochen</div><div class="grid grid-cards">${past.map(projCard).join('')}</div>`;
  return html;
}

function projDetail(p) {
  const mgr = agentById(p.managerId);
  const busy = planBusy(p);
  const planTask = planTaskOf(p);
  const drafts = p.parts.filter(x => x.status === 'draft');
  const acc = p.parts.filter(x => x.status === 'accepted').length;
  const managers = S.agents.filter(a => a.role === 'manager');
  const live = p.status !== 'cancelled' && p.status !== 'done';
  let banners = '';
  if (busy) {
    const who = agentById(planTask?.assignedAgentId);
    const txt = planTask?.status === 'running' ? `<b>${esc(who?.name || 'Der Manager')}</b> plant gerade${p.revision ? ' die Überarbeitung' : ''} …`
      : (managers.length || mgr ? 'Der Planungsauftrag wartet darauf, dass der Manager bereit ist …' : '<b>Kein Manager angemeldet.</b> Der Planungsauftrag wartet, bis sich einer meldet:');
    banners += `<div class="banner info flex">${icon('clock', 'sm')}<span>${txt}</span>${planTask ? `<button class="btn btn-sm" style="margin-left:auto" data-action="task-open" data-id="${planTask.id}">Auftrag ansehen</button>` : ''}</div>`;
    if (!managers.length && !mgr) banners += codeBlock(joinPrompt('manager'));
  } else if (live && !p.parts.length) {
    banners += `<div class="banner flex"><span>Noch kein Plan${planTask?.status === 'failed' ? ' – die Planung ist fehlgeschlagen' : ''}.</span><button class="btn btn-sm" style="margin-left:auto" data-action="proj-replan" data-id="${p.id}">Planung anfordern</button></div>`;
  }
  if (live && drafts.length && !busy) {
    banners += `<div class="banner info flex">${icon('bell', 'sm')}<span><b>Du bist dran:</b> Prüfe ${drafts.length === 1 ? 'den Teilbereich' : `die ${drafts.length} Teilbereiche`} und die Standards, teile Agenten ein und gib frei. Worker starten erst nach deiner Freigabe.</span>
      <button class="btn btn-sm btn-primary" style="margin-left:auto" data-action="proj-approve-all" data-id="${p.id}">${icon('check', 'sm')} ${drafts.length === 1 ? 'Freigeben' : `Alle ${drafts.length} freigeben`}</button></div>`;
  }
  const waves = {};
  p.parts.forEach(x => { const w = waveOf(p, x.id); (waves[w] = waves[w] || []).push(x); });
  const waveKeys = Object.keys(waves).map(Number).sort((a, b) => a - b);
  const partsHtml = p.parts.length ? waveKeys.map(w => `<div class="wave"><div class="wave-head">Welle ${w + 1}${w === 0 ? ' · startet sofort nach Freigabe' : ' · nach Abnahme der Abhängigkeiten'}</div>
      <div class="parts-grid">${waves[w].map(x => partCard(p, x)).join('')}</div></div>`).join('')
    : `<div class="panel empty"><div class="big">🧩</div><h3>Noch keine Teilbereiche</h3><p>Sie erscheinen hier, sobald der Manager seinen Plan einreicht.</p></div>`;
  const tail = [...p.log].reverse().slice(0, 60);
  return `
  <div class="panel proj-head">
    <div class="flex between" style="flex-wrap:wrap;gap:8px">
      <button class="btn btn-sm btn-ghost" data-action="proj-back">← Alle Projekte</button>
      <div class="flex gap-s" style="flex-wrap:wrap">
        ${live ? `<button class="btn btn-sm" data-action="proj-replan" data-id="${p.id}">${icon('refresh', 'sm')} Überarbeitung anfordern</button>` : ''}
        <button class="btn btn-sm" data-action="proj-edit" data-id="${p.id}">${icon('edit', 'sm')} Bearbeiten</button>
        <button class="btn btn-sm btn-icon" data-action="copy" data-text="${esc(`curl -s "${BASE}/api/projects/${p.id}?format=text"`)}" title="Text-Überblick (curl) kopieren">${icon('terminal', 'sm')}</button>
        ${live ? `<button class="btn btn-sm btn-danger" data-action="proj-cancel" data-id="${p.id}">${icon('stop', 'sm')} Abbrechen</button>` : ''}
        <button class="btn btn-sm btn-icon btn-danger" data-action="proj-del" data-id="${p.id}" title="Löschen">${icon('trash', 'sm')}</button>
      </div>
    </div>
    ${p.parentProjectId && projById(p.parentProjectId) ? `<div class="faint" style="font-size:12.5px">↑ Unterprojekt von <a class="clickable" data-action="proj-open" data-id="${p.parentProjectId}">${esc(projById(p.parentProjectId).name)}</a></div>` : ''}
    <h2 class="proj-title selectable">${esc(p.name)} ${projPill(p.status)}</h2>
    <div class="proj-goal-full selectable">${esc(p.goal)}</div>
    <div class="proj-meta">
      <span class="flex gap-s">👑 ${mgr ? `${avatar(mgr, 'sm')}<b>${esc(mgr.name)}</b> ${statusPill(mgr.status)}` : '<b>beliebiger Manager</b>'}</span>
      ${p.cwd ? `<span class="mono" title="${esc(p.cwd)}">${icon('folder', 'sm')} ${esc(p.cwd.replace(/^\/Users\/[^/]+/, '~'))}</span>` : ''}
      <span>Revision <b>${p.revision}</b></span>
      <span>Abnahme: <b>${p.requireReview ? 'durch den Manager' : 'automatisch'}</b></span>
      <span>seit ${ago(p.createdAt)}</span>
    </div>
    ${projPhases(p)}
    <div class="flex"><div class="progress" style="max-width:none"><i style="width:${p.parts.length ? Math.round(acc / p.parts.length * 100) : 0}%"></i></div><span class="faint nowrap" style="font-size:12px">${acc}/${p.parts.length} abgenommen</span></div>
  </div>
  ${banners}
  <div class="grid grid-2">
    <div>
      <div class="flex between" style="margin:4px 0 12px"><div class="section-title" style="margin:0">Teilbereiche (${p.parts.length})</div>
        ${live ? `<button class="btn btn-sm" data-action="part-new" data-p="${p.id}">${icon('plus', 'sm')} Teilbereich</button>` : ''}</div>
      ${partsHtml}
    </div>
    <div class="flex" style="flex-direction:column;align-items:stretch;gap:16px">
      ${live && agentById(p.managerId) ? `<div class="panel"><div class="panel-head"><h3>${icon('chat', 'sm')} Ergänzung an den Manager</h3></div><div class="panel-body">
        <textarea class="textarea" id="pjSupp" style="min-height:80px" placeholder="Was soll noch rein oder anders werden? ${esc(agentById(p.managerId).name)} zerlegt es und ordnet es den Agenten zu (⌘↵)."></textarea>
        <div class="composer-row" style="margin-top:8px"><label class="chk"><input type="checkbox" id="pjSuppUrgent"> ⛔ dringend</label>
        <button class="btn btn-sm btn-primary" style="margin-left:auto" data-action="proj-supplement" data-id="${p.id}">${icon('send', 'sm')} An Manager</button></div>
        ${projMessages(p)}</div></div>` : ''}
      ${standardsPanel(p)}
      ${p.summary ? `<div class="panel"><div class="panel-head"><h3>${icon('flow', 'sm')} Architektur & Plan</h3></div><div class="panel-body selectable" style="white-space:pre-wrap;font-size:13px;color:var(--text-2)">${esc(p.summary)}</div></div>` : ''}
      <div class="panel"><div class="panel-head"><h3>${icon('pulse', 'sm')} Verlauf</h3></div><div class="panel-body" style="max-height:420px;overflow:auto">
        ${tail.length ? `<div class="timeline">${tail.map(e => `<div><small>${ago(e.time)}</small>${esc(e.text)}</div>`).join('')}</div>` : '<div class="faint">Noch nichts passiert.</div>'}</div></div>
    </div>
  </div>`;
}

function projMessages(p) {
  const list = (S.messages || []).filter(m => m.projectId === p.id).slice(-8);
  if (!list.length) return '';
  return `<div class="block-title">Kommunikation</div><div class="chat compact">${list.map(m => msgBubble(m, p.managerId)).join('')}</div>`;
}

function assignOptions(x) {
  const load = (id) => (S.projects || []).reduce((n, p) => n + p.parts.filter(q => q.agentId === id && q.id !== x.id && !['accepted', 'cancelled'].includes(q.status)).length, 0);
  const opts = [['', '⚡ Beliebiger Worker'], ...S.agents.map(a => {
    const n = load(a.id);
    return [a.id, `${a.status === 'waiting' ? '🟢' : a.status === 'working' ? '🟣' : '⚪️'} ${a.name}${a.role === 'manager' ? ' 👑' : ''}${n ? ` · ${n} weitere` : ''}`];
  })];
  if (x.agentId && !S.agents.some(a => a.id === x.agentId)) opts.push([x.agentId, '⚠️ abgemeldeter Agent']);
  return opts.map(([v, l]) => `<option value="${esc(v)}" ${v === (x.agentId || '') ? 'selected' : ''}>${esc(l)}</option>`).join('');
}

function partCard(p, x) {
  const ag = agentById(x.agentId);
  const task = S.tasks.find(t => t.id === x.taskIds?.[x.taskIds.length - 1]);
  const open = ui.openParts.has(x.id);
  const deps = (x.dependsOn || []).map(d => p.parts.find(q => q.id === d)).filter(Boolean);
  const live = p.status !== 'cancelled';
  const canAssign = live && ['draft', 'waiting', 'queued', 'failed', 'cancelled'].includes(x.status);
  const b = (act, label, cls = '', ico = '') => `<button class="btn btn-sm ${cls}" data-action="${act}" data-p="${p.id}" data-x="${x.id}">${ico ? icon(ico, 'sm') : ''}${label}</button>`;
  const del = `<button class="btn btn-sm btn-icon btn-danger" data-action="part-del" data-p="${p.id}" data-x="${x.id}" title="Löschen">${icon('trash', 'sm')}</button>`;
  const btns = [];
  if (live) {
    if (x.status === 'draft') btns.push(b('part-approve', 'Freigeben', 'btn-primary', 'check'), b('part-edit', 'Bearbeiten', '', 'edit'), b('part-preview', 'Worker-Prompt', '', 'terminal'), del);
    if (x.status === 'waiting' || x.status === 'queued') btns.push(b('part-unapprove', 'Freigabe zurückziehen', '', 'stop'));
    if (x.status === 'delivered') btns.push(b('part-accept', 'Abnehmen', 'btn-primary', 'check'), b('part-rework', 'Nacharbeit', '', 'refresh'));
    if (x.status === 'failed' || x.status === 'cancelled') btns.push(b('part-rework', 'Nacharbeit', '', 'refresh'), b('part-accept', 'Trotzdem abnehmen'), del);
    if (x.status === 'accepted') btns.push(b('part-rework', 'Nacharbeit', 'btn-ghost', 'refresh'));
  }
  if (x.childProjectId && projById(x.childProjectId)) btns.push(`<button class="btn btn-sm" data-action="proj-open" data-id="${x.childProjectId}">${icon('layers', 'sm')} Unterprojekt →</button>`);
  if (task) btns.push(`<button class="btn btn-sm btn-ghost" data-action="task-open" data-id="${task.id}">${icon('chat', 'sm')} Chat</button>`);
  const blockers = x.status === 'waiting' ? deps.filter(d => d.status !== 'accepted') : [];
  const lastProg = task?.status === 'running' && task.progress?.length ? task.progress[task.progress.length - 1].text : '';
  return `<div class="part-card ps-${x.status}">
    <div class="part-top"><span class="part-key mono">${esc(x.key)}</span><div class="part-name">${esc(x.name)}${x.round > 1 ? ` <span class="pill idle">Runde ${x.round}</span>` : ''}</div>${partPill(x.status)}</div>
    ${x.goal ? `<div class="part-goal">${esc(x.goal)}</div>` : ''}
    ${x.status === 'running' ? '<div class="working-bar"></div>' : ''}
    ${lastProg ? `<div class="faint" style="font-size:12px">📝 ${esc(lastProg)}</div>` : ''}
    <div class="part-assign"><span class="faint">Agent</span>
      ${canAssign ? `<select class="select sm" data-assign="${x.id}" data-p="${p.id}">${assignOptions(x)}</select>` : (ag ? `<span class="flex gap-s">${avatar(ag, 'sm')}${esc(ag.name)}</span>` : `<span class="faint">${task?.assignedAgentId ? esc(agentById(task.assignedAgentId)?.name || '–') : 'beliebiger Worker'}</span>`)}
      ${x.suggestedAgent && x.status === 'draft' && (!ag || ag.name.toLowerCase() !== x.suggestedAgent.toLowerCase()) ? `<span class="faint" style="font-size:11.5px">Vorschlag des Managers: ${esc(x.suggestedAgent)}</span>` : ''}
    </div>
    <div class="agent-meta">
      ${x.paths.map(s => `<span class="tag mono">${esc(s)}</span>`).join('')}
      ${deps.length ? `<span class="tag">⤷ nach ${deps.map(d => esc(d.key)).join(', ')}</span>` : ''}
      <span class="tag">✓ ${x.acceptance.length} Kriterien</span>
    </div>
    ${blockers.length ? `<div class="faint" style="font-size:12px">⏳ Startet, sobald ${blockers.map(d => `„${esc(d.name)}“`).join(', ')} abgenommen ${blockers.length > 1 ? 'sind' : 'ist'}.</div>` : ''}
    ${x.note && x.status === 'draft' && x.round > 1 ? `<div class="part-note">🔁 <b>Nacharbeit:</b> ${esc(x.note)}</div>` : ''}
    ${open ? partDetails(x) : ''}
    <div class="part-actions">${btns.join('')}<button class="btn btn-sm btn-ghost" style="margin-left:auto" data-action="part-toggle" data-x="${x.id}">${open ? 'Weniger ▴' : 'Details ▾'}</button></div>
  </div>`;
}

function partDetails(x) {
  return `<div class="part-details">
    <div class="block-title">Prompt des Managers</div><div class="tpl-prompt selectable" style="max-height:none">${esc(x.prompt)}</div>
    ${x.acceptance.length ? `<div class="block-title">Abnahmekriterien</div><ol class="crit selectable">${x.acceptance.map(a => `<li>${esc(a)}</li>`).join('')}</ol>` : ''}
    ${x.tags.length ? `<div class="block-title">Tags</div><div class="agent-meta">${x.tags.map(t => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
    ${x.note ? `<div class="block-title">Notiz</div><div class="muted selectable" style="font-size:13px;white-space:pre-wrap">${esc(x.note)}</div>` : ''}
    ${x.result ? `<div class="block-title">${x.status === 'failed' ? 'Fehler' : 'Ergebnis'}</div><div class="result ${x.status === 'failed' ? 'err' : ''} selectable">${esc(x.result)}</div>` : ''}
  </div>`;
}

function standardsPanel(p) {
  const cats = [...new Set(p.standards.map(s => s.category))];
  const must = p.standards.filter(s => s.mandatory).length;
  const live = p.status !== 'cancelled' && p.status !== 'done';
  return `<div class="panel"><div class="panel-head"><h3>${icon('shield', 'sm')} Standards <span class="faint" style="font-weight:500">${p.standards.length} · ${must} MUSS</span></h3>
    ${live ? `<button class="btn btn-sm" data-action="std-edit" data-p="${p.id}">${icon('plus', 'sm')} Standard</button>` : ''}</div>
    <div class="panel-body std-body">${p.standards.length ? cats.map(c => `<div class="std-cat">${esc(c)}</div>${p.standards.filter(s => s.category === c).map(s => `
      <div class="std" ${live ? `data-action="std-edit" data-p="${p.id}" data-s="${s.id}"` : ''}><span class="std-lvl ${s.mandatory ? 'must' : 'should'}">${s.mandatory ? 'MUSS' : 'SOLL'}</span>
        <div style="min-width:0"><b>${esc(s.id)} · ${esc(s.title)}</b>${s.rule !== s.title ? `<div class="muted selectable">${esc(s.rule)}</div>` : ''}</div></div>`).join('')}`).join('')
      : '<div class="faint">Noch keine Standards – der Manager legt sie beim Planen fest. Du kannst selbst welche ergänzen.</div>'}
    <div class="faint" style="font-size:11.5px;margin-top:12px">Jeder Worker erhält bei der Freigabe alle Standards. Änderungen gelten für alle noch nicht freigegebenen Teilbereiche.</div></div></div>`;
}

/* Projekt-Modals */
function projModal(id) {
  const p = projById(id) || { name: '', goal: '', cwd: '', managerId: '', requireReview: true };
  const mgrs = S.agents.filter(a => a.role === 'manager'), rest = S.agents.filter(a => a.role !== 'manager');
  const cur = p.managerId || (mgrs.length === 1 ? mgrs[0].id : '');
  const opts = [['', '👑 Beliebiger Manager'], ...mgrs.map(a => [a.id, `👑 ${a.name}`]), ...rest.map(a => [a.id, `${a.name} (Worker)`])];
  const cwds = [...new Set(S.agents.map(a => a.cwd).filter(Boolean))];
  modal(`<div class="modal-head"><h2>${id ? 'Projekt bearbeiten' : 'Neues Projekt'}</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    ${id ? '' : `<div class="banner info"><b>1</b> Manager plant Teilbereiche & Standards → <b>2</b> du prüfst, teilst ein, gibst frei → <b>3</b> erst dann starten die Worker → <b>4</b> Manager nimmt jede Ablieferung ab.</div>`}
    <div class="field"><label>Name</label><input class="input" id="pjName" value="${esc(p.name)}" placeholder="z. B. Dark Mode für die iPad-App" autofocus></div>
    <div class="field"><label>Aufgabe / Ziel für den Manager</label><textarea class="textarea" id="pjGoal" style="min-height:150px" placeholder="Was soll am Ende stehen? Rahmenbedingungen, Wünsche, No-Gos …">${esc(p.goal)}</textarea></div>
    <div class="field"><label>Arbeitsverzeichnis (Repository)</label><input class="input mono" id="pjCwd" list="pjCwds" value="${esc(p.cwd)}" placeholder="/Users/…/Developer/MeinProjekt">
      <datalist id="pjCwds">${cwds.map(c => `<option value="${esc(c)}">`).join('')}</datalist><span class="hint">Wird dem Manager und allen Workern mitgegeben.</span></div>
    <div class="field"><label>Manager (plant und nimmt ab)</label><div class="target-grid" data-picker="pjMgr">${opts.map(([v, l]) => `<button type="button" class="target-opt ${v === cur ? 'active' : ''}" data-action="pick" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div>
      <input type="hidden" id="pjMgr" value="${esc(cur)}">
      ${!mgrs.length ? `<span class="hint">Noch kein Manager angemeldet – so meldest du einen an (Prompt in eine Claude-Code-Session einfügen):</span>${codeBlock(joinPrompt('manager'))}` : ''}</div>
    <div class="setting"><div class="txt"><b>Abnahme durch den Manager</b><span>Jede Ablieferung wird vom Manager gegen Kriterien und Standards geprüft, bevor abhängige Teilbereiche starten. Aus: Ablieferung gilt sofort als abgenommen.</span></div>
      <label class="switch"><input type="checkbox" id="pjReview" ${p.requireReview ? 'checked' : ''}><span></span></label></div>
  </div>
  <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="proj-save" data-id="${id || ''}">${icon(id ? 'check' : 'send', 'sm')} ${id ? 'Speichern' : 'Anlegen & Planung anfordern'}</button></div>`, 'wide');
}

function partModal(pid, xid) {
  const p = projById(pid); if (!p) return;
  const x = p.parts.find(q => q.id === xid) || { name: '', goal: '', prompt: '', acceptance: [], paths: [], tags: [], dependsOn: [], agentId: '' };
  const others = p.parts.filter(q => q.id !== xid);
  modal(`<div class="modal-head"><h2>${xid ? `Teilbereich bearbeiten` : 'Neuer Teilbereich'}</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    <div class="row"><div class="field"><label>Name</label><input class="input" id="xName" value="${esc(x.name)}" autofocus></div>
      <div class="field"><label>Agent</label><select class="select" id="xAgent">${assignOptions(x)}</select></div></div>
    <div class="field"><label>Ziel (ein Satz)</label><input class="input" id="xGoal" value="${esc(x.goal)}"></div>
    <div class="field"><label>Prompt für den Worker</label><textarea class="textarea" id="xPrompt" style="min-height:190px">${esc(x.prompt)}</textarea>
      <span class="hint">Projektziel, alle Standards, Abnahmekriterien und Ergebnisse der Abhängigkeiten fügt Dirigent bei der Freigabe automatisch hinzu.</span></div>
    <div class="row"><div class="field"><label>Abnahmekriterien (eins pro Zeile)</label><textarea class="textarea" id="xAcc" style="min-height:110px">${esc(x.acceptance.join('\n'))}</textarea></div>
      <div class="field"><label>Pfade / Zuständigkeit (eins pro Zeile)</label><textarea class="textarea mono" id="xPaths" style="min-height:110px">${esc(x.paths.join('\n'))}</textarea></div></div>
    <div class="row"><div class="field"><label>Tags (kommagetrennt)</label><input class="input" id="xTags" value="${esc(x.tags.join(', '))}"></div>
      <div class="field"><label>Startet nach (Abhängigkeiten)</label>${others.length ? `<div class="dep-list">${others.map(o => `<label><input type="checkbox" data-dep="${o.id}" ${x.dependsOn.includes(o.id) ? 'checked' : ''}> <span class="mono">${esc(o.key)}</span> ${esc(o.name)}</label>`).join('')}</div>` : '<span class="faint">keine anderen Teilbereiche</span>'}</div></div>
  </div>
  <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="part-save" data-p="${pid}" data-x="${xid || ''}">${icon('check', 'sm')} Speichern</button></div>`, 'wide');
}

function stdModal(pid, sid) {
  const p = projById(pid); if (!p) return;
  const s = p.standards.find(q => q.id === sid) || { category: '', title: '', rule: '', mandatory: true };
  const cats = [...new Set(p.standards.map(q => q.category).concat(['Architektur', 'Schnittstellen', 'Code-Stil', 'Fehlerbehandlung', 'Tests', 'Sicherheit', 'Performance', 'UI/UX', 'Dokumentation', 'Git & Commits']))];
  modal(`<div class="modal-head"><h2>${sid ? `Standard ${esc(sid)}` : 'Neuer Standard'}</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    <div class="row"><div class="field"><label>Kategorie</label><input class="input" id="sCat" list="sCats" value="${esc(s.category)}" placeholder="z. B. Tests"><datalist id="sCats">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist></div>
      <div class="field" style="max-width:150px"><label>Verbindlichkeit</label><select class="select" id="sLvl"><option value="1" ${s.mandatory ? 'selected' : ''}>MUSS</option><option value="0" ${!s.mandatory ? 'selected' : ''}>SOLL</option></select></div></div>
    <div class="field"><label>Titel</label><input class="input" id="sTitle" value="${esc(s.title)}" autofocus></div>
    <div class="field"><label>Regel (konkret und prüfbar)</label><textarea class="textarea" id="sRule" style="min-height:120px">${esc(s.rule)}</textarea></div>
  </div>
  <div class="modal-foot">${sid ? `<button class="btn btn-danger" style="margin-right:auto" data-action="std-del" data-p="${pid}" data-s="${sid}">${icon('trash', 'sm')} Löschen</button>` : ''}<button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="std-save" data-p="${pid}" data-s="${sid || ''}">${icon('check', 'sm')} Speichern</button></div>`);
}

/** Einfaches Eingabe-Modal (Rückmeldung, Nacharbeit, Abnahme-Notiz). */
function askModal({ title, label, placeholder = '', hint = '', ok = 'OK', required = false, onOk }) {
  ui.ask = { onOk, required };
  modal(`<div class="modal-head"><h2>${esc(title)}</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body"><div class="field"><label>${esc(label)}</label><textarea class="textarea" id="askText" autofocus style="min-height:140px" placeholder="${esc(placeholder)}"></textarea>${hint ? `<span class="hint">${hint}</span>` : ''}</div></div>
  <div class="modal-foot"><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="ask-ok">${esc(ok)}</button></div>`);
}

const projActions = {
  'proj-new': () => projModal(),
  'proj-open': (el) => { closeDrawer(); closeModal(); ui.view = 'projects'; ui.project = el.dataset.id; try { localStorage.setItem('dirigent.view', 'projects'); } catch {} render(); $('#view').scrollTop = 0; },
  'proj-back': () => { ui.project = null; render(); $('#view').scrollTop = 0; },
  'proj-edit': (el) => projModal(el.dataset.id),
  'proj-save': async (el) => {
    const body = { name: $('#pjName').value.trim(), goal: $('#pjGoal').value.trim(), cwd: $('#pjCwd').value.trim(), manager: $('#pjMgr').value, requireReview: $('#pjReview').checked, createdBy: 'user' };
    if (!body.goal) { $('#pjGoal').focus(); return; }
    try {
      if (el.dataset.id) { await api('PATCH', `/api/projects/${el.dataset.id}`, body); closeModal(); toast('🗂️', 'Projekt gespeichert'); }
      else { const p = await api('POST', '/api/projects', body); closeModal(); ui.view = 'projects'; ui.project = p.id; toast('📨', 'Projekt angelegt – Planung beim Manager angefordert'); refreshSoon(); }
    } catch (e) { toast('⚠️', e.message); }
  },
  'proj-replan': (el) => askModal({
    title: 'Überarbeitung anfordern', label: 'Rückmeldung an den Manager', ok: 'An Manager senden',
    placeholder: 'Was soll anders werden? z. B. „Teilbereich UI aufteilen“, „Standards für Barrierefreiheit ergänzen“ …',
    hint: 'Der Manager erhält den aktuellen Plan samt deiner Rückmeldung. Bereits freigegebene Teilbereiche bleiben unverändert.',
    onOk: async (v) => { await api('POST', `/api/projects/${el.dataset.id}/replan?format=json`, { feedback: v, createdBy: 'user' }); toast('📨', 'Überarbeitung angefordert'); },
  }),
  'proj-approve-all': async (el) => {
    try { const r = await api('POST', `/api/projects/${el.dataset.id}/approve?format=json`, {}); toast('✅', `${r.approved} Teilbereich(e) freigegeben`); (r.errors || []).forEach(e => toast('⚠️', e)); } catch (e) { toast('⚠️', e.message); }
  },
  'proj-cancel': async (el) => { if (!(await confirmAsk('Projekt abbrechen? Laufende Aufträge werden abgebrochen.'))) return; await api('POST', `/api/projects/${el.dataset.id}/cancel?format=json`).catch(e => toast('⚠️', e.message)); },
  'proj-del': async (el) => { if (!(await confirmAsk('Projekt endgültig löschen? Laufende Aufträge werden abgebrochen.'))) return; await api('DELETE', `/api/projects/${el.dataset.id}`); ui.project = null; render(); },
  'part-toggle': (el) => { const id = el.dataset.x; ui.openParts.has(id) ? ui.openParts.delete(id) : ui.openParts.add(id); render(); },
  'part-approve': async (el) => { try { await api('POST', `/api/projects/${el.dataset.p}/parts/${el.dataset.x}/approve?format=json`, {}); toast('✅', 'Freigegeben – der Worker erhält jetzt seinen Auftrag'); } catch (e) { toast('⚠️', e.message); } },
  'part-unapprove': async (el) => { try { await api('POST', `/api/projects/${el.dataset.p}/parts/${el.dataset.x}/unapprove?format=json`, {}); toast('↩︎', 'Freigabe zurückgezogen'); } catch (e) { toast('⚠️', e.message); } },
  'part-accept': (el) => askModal({
    title: 'Teilbereich abnehmen', label: 'Notiz (optional)', ok: 'Abnehmen',
    hint: 'Abhängige, bereits freigegebene Teilbereiche starten danach automatisch.',
    onOk: async (v) => { await api('POST', `/api/projects/${el.dataset.p}/parts/${el.dataset.x}/accept?format=json`, { note: v, createdBy: 'user' }); toast('🏅', 'Abgenommen'); },
  }),
  'part-rework': (el) => askModal({
    title: 'Nacharbeit anfordern', label: 'Was genau muss nachgebessert werden?', ok: 'Nacharbeit anlegen', required: true,
    placeholder: 'Konkrete, prüfbare Punkte …',
    hint: 'Der Teilbereich geht zurück in den Entwurf. Nach deiner erneuten Freigabe erhält der Worker den Prompt plus diese Notiz und sein vorheriges Ergebnis.',
    onOk: async (v) => { await api('POST', `/api/projects/${el.dataset.p}/parts/${el.dataset.x}/rework?format=json`, { note: v }); toast('🔁', 'Nacharbeit angelegt – bitte freigeben, wenn sie passt'); },
  }),
  'part-new': (el) => partModal(el.dataset.p),
  'part-edit': (el) => partModal(el.dataset.p, el.dataset.x),
  'part-save': async (el) => {
    const lines = (s) => s.split('\n').map(v => v.trim()).filter(Boolean);
    const body = {
      name: $('#xName').value.trim(), goal: $('#xGoal').value.trim(), prompt: $('#xPrompt').value.trim(), agentId: $('#xAgent').value,
      acceptance: lines($('#xAcc').value), paths: lines($('#xPaths').value), tags: $('#xTags').value.split(',').map(s => s.trim()).filter(Boolean),
      dependsOn: [...document.querySelectorAll('[data-dep]')].filter(c => c.checked).map(c => c.dataset.dep),
    };
    if (!body.name) { $('#xName').focus(); return; }
    try {
      if (el.dataset.x) await api('PATCH', `/api/projects/${el.dataset.p}/parts/${el.dataset.x}?format=json`, body);
      else await api('POST', `/api/projects/${el.dataset.p}/parts?format=json`, body);
      closeModal(); toast('🧩', 'Teilbereich gespeichert');
    } catch (e) { toast('⚠️', e.message); }
  },
  'part-del': async (el) => { if (!(await confirmAsk('Teilbereich löschen?'))) return; await api('DELETE', `/api/projects/${el.dataset.p}/parts/${el.dataset.x}`).catch(e => toast('⚠️', e.message)); },
  'part-preview': async (el) => {
    try {
      const txt = await api('GET', `/api/projects/${el.dataset.p}/parts/${el.dataset.x}?format=text`);
      modal(`<div class="modal-head"><h2>Worker-Prompt (Vorschau)</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
        <div class="modal-body"><p class="muted" style="margin-top:0">Genau diesen Auftrag erhält der Worker nach deiner Freigabe – inklusive aller Standards, Kriterien und der Ergebnisse seiner Abhängigkeiten.</p>
        <div class="code selectable" style="white-space:pre-wrap;max-height:60vh;overflow:auto">${esc(txt)}<button class="btn btn-sm copy" data-action="copy" data-text="${esc(txt)}">${icon('copy', 'sm')}</button></div></div>
        <div class="modal-foot"><button class="btn" data-action="modal-close">Schließen</button><button class="btn btn-primary" data-action="part-approve" data-p="${el.dataset.p}" data-x="${el.dataset.x}">${icon('check', 'sm')} Freigeben</button></div>`, 'wide');
    } catch (e) { toast('⚠️', e.message); }
  },
  'std-edit': (el) => stdModal(el.dataset.p, el.dataset.s),
  'std-save': async (el) => {
    const body = { category: $('#sCat').value.trim() || 'Allgemein', title: $('#sTitle').value.trim(), rule: $('#sRule').value.trim(), mandatory: $('#sLvl').value === '1' };
    if (!body.rule && !body.title) { $('#sRule').focus(); return; }
    if (!body.rule) body.rule = body.title;
    try {
      if (el.dataset.s) await api('PATCH', `/api/projects/${el.dataset.p}/standards/${el.dataset.s}`, body);
      else await api('POST', `/api/projects/${el.dataset.p}/standards`, body);
      closeModal(); toast('🛡️', 'Standard gespeichert');
    } catch (e) { toast('⚠️', e.message); }
  },
  'std-del': async (el) => { await api('DELETE', `/api/projects/${el.dataset.p}/standards/${el.dataset.s}`).catch(e => toast('⚠️', e.message)); closeModal(); },
  'ask-ok': async () => {
    const v = $('#askText').value.trim();
    if (ui.ask?.required && !v) { $('#askText').focus(); return; }
    try { await ui.ask.onOk(v); closeModal(); } catch (e) { toast('⚠️', e.message); }
  },
};

/* ───────── Chats, Live-Protokoll, Beschreibungsdatei ─────────
   Jeder Auftrag und jeder Agent hat einen Chat: Auftrag, Zwischenstände, Rückfragen, Antworten, Nachrichten, Ergebnis.
   „Live“ liest die Claude-Code-Sitzung des Agenten mit (Texte, Befehle, Ausgaben). */
const KIND_LABEL = { question: '❓ Rückfrage', answer: '💬 Antwort', supplement: '➕ Ergänzung', system: '⚙️ Hinweis', message: '💬 Nachricht' };
const openQuestionsToUser = () => (S.messages || []).filter(m => m.kind === 'question' && m.to === 'user' && m.status !== 'answered');
function partyLabel(ref) {
  if (!ref || ref === 'user') return 'Du';
  if (ref === 'system') return 'Dirigent';
  if (ref === 'task') return 'Agent des Auftrags';
  if (ref.startsWith('agent:')) return agentById(ref.slice(6))?.name || ref.slice(6);
  return ref;
}
function bubble({ side, who, agent, time, badge = '', text, extra = '', cls = '' }) {
  if (side === 'center') return `<div class="msg center ${cls}"><span>${esc(text)}</span><em>${ago(time)}</em></div>`;
  const av = agent ? avatar(agent, 'sm') : `<div class="avatar sm" style="--ac:${who === 'Du' ? '#6366f1' : '#64748b'}">${esc(initials(who))}</div>`;
  return `<div class="msg ${side} ${cls}"><div class="msg-av">${av}</div><div class="msg-b">
    <div class="msg-h"><b>${esc(who)}</b>${badge ? `<span class="msg-badge">${badge}</span>` : ''}<span class="msg-time">${ago(time)}</span></div>
    <div class="msg-t selectable">${esc(text)}</div>${extra}</div></div>`;
}
function msgBubble(m, selfAgentId) {
  const fromAgent = m.from.startsWith('agent:') ? agentById(m.from.slice(6)) : null;
  const side = m.from === 'system' ? 'center' : (fromAgent && fromAgent.id === selfAgentId ? 'left' : 'right');
  if (side === 'center') return bubble({ side, time: m.time, text: `⚙️ ${m.text}`, cls: m.urgent ? 'urgent' : '' });
  let badge = `${m.urgent ? '⛔ ' : ''}${KIND_LABEL[m.kind] || '💬'} → ${esc(partyLabel(m.to))}`;
  let extra = '';
  if (m.status === 'pending') extra += `<div class="msg-foot">⏳ wird beim nächsten Kontakt zugestellt (Zwischenstand, Rückfrage oder neuer Auftrag)</div>`;
  if (m.kind === 'question') {
    if (m.status === 'answered') extra += `<div class="msg-ans"><b>Antwort:</b> ${esc(m.answer)}</div>`;
    else extra += `<div class="msg-foot">${m.to === 'user' ? '<b>Wartet auf deine Antwort.</b>' : `Wartet auf ${esc(partyLabel(m.to))}.`}
      <button class="btn btn-sm ${m.to === 'user' ? 'btn-primary' : ''}" data-action="msg-answer" data-id="${m.id}">Antworten</button>
      ${m.to !== 'user' ? '' : `<button class="btn btn-sm btn-ghost" data-action="msg-escalate" data-id="${m.id}" title="An Vorgesetzten weiterleiten">↗︎</button>`}</div>`;
  }
  return bubble({ side, who: partyLabel(m.from), agent: fromAgent, time: m.time, badge, text: m.text, extra, cls: m.urgent ? 'urgent' : '' });
}
const sysLine = (text, time) => ({ time: time || 0, html: bubble({ side: 'center', time, text }) });

function taskManagerRef(t) {
  const self = t.assignedAgentId;
  const ok = (id) => id && id !== self && agentById(id);
  if (ok(t.notifyAgentId)) return t.notifyAgentId;
  const p = t.projectId && projById(t.projectId);
  if (p && ok(p.managerId)) return p.managerId;
  if (t.createdBy?.startsWith('agent:') && ok(t.createdBy.slice(6))) return t.createdBy.slice(6);
  const sup = agentById(self)?.supervisorId;
  return ok(sup) ? sup : null;
}

function taskTimeline(t) {
  const ag = agentById(t.assignedAgentId);
  const items = [{ time: t.createdAt, html: bubble({ side: 'right', who: creatorLabel(t.createdBy), agent: t.createdBy?.startsWith('agent:') ? agentById(t.createdBy.slice(6)) : null, time: t.createdAt, badge: t.kind === 'task' ? '📨 Auftrag' : '📨 ' + (t.kind === 'message' ? 'Nachrichten' : 'Rückmeldung'), text: t.prompt, cls: 'prompt' }) }];
  if (t.startedAt) items.push(sysLine(`▶︎ ${ag?.name || 'Agent'} hat übernommen`, t.startedAt));
  (t.progress || []).filter(p => !/^(❓ Rückfrage an|💬 Antwort von)/.test(p.text))
    .forEach(p => items.push({ time: p.time, html: bubble({ side: 'left', who: ag?.name || 'Agent', agent: ag, time: p.time, badge: '📝 Zwischenstand', text: p.text }) }));
  (S.messages || []).filter(m => m.taskId === t.id || m.viaTaskId === t.id).forEach(m => items.push({ time: m.time, html: msgBubble(m, t.assignedAgentId) }));
  if (t.finishedAt && (t.result || t.error)) items.push({ time: t.finishedAt, html: bubble({ side: 'left', who: ag?.name || 'Agent', agent: ag, time: t.finishedAt, badge: t.error ? '⚠️ Fehler' : '✅ Ergebnis', text: t.result || t.error, cls: t.error ? 'err' : 'done' }) });
  if (t.status === 'cancelled') items.push(sysLine('⛔ Auftrag abgebrochen', t.finishedAt || Date.now()));
  if (t.status === 'running') items.push({ time: Date.now() + 1, html: `<div class="msg center typing"><span><i></i><i></i><i></i> ${esc(ag?.name || 'Agent')} arbeitet …</span></div>` });
  return items.sort((a, b) => a.time - b.time).map(i => i.html).join('');
}

function agentTimeline(a) {
  const ref = 'agent:' + a.id;
  const items = [];
  (S.messages || []).filter(m => m.from === ref || m.to === ref).forEach(m => items.push({ time: m.time, html: msgBubble(m, a.id) }));
  S.tasks.filter(t => t.assignedAgentId === a.id && t.kind !== 'message').slice(-25).forEach(t => {
    items.push({ time: t.startedAt || t.createdAt, html: bubble({ side: 'right', who: creatorLabel(t.createdBy), time: t.startedAt || t.createdAt, badge: `📨 ${esc(t.title)}`, text: t.prompt.length > 900 ? t.prompt.slice(0, 900) + ' …' : t.prompt, cls: 'prompt', extra: `<div class="msg-foot"><button class="btn btn-sm btn-ghost" data-action="task-open" data-id="${t.id}">Auftrags-Chat →</button></div>` }) });
    if (t.status === 'running') (t.progress || []).slice(-5).forEach(p => items.push({ time: p.time, html: bubble({ side: 'left', who: a.name, agent: a, time: p.time, badge: '📝 Zwischenstand', text: p.text }) }));
    if (t.finishedAt && (t.result || t.error)) items.push({ time: t.finishedAt, html: bubble({ side: 'left', who: a.name, agent: a, time: t.finishedAt, badge: t.error ? '⚠️ Fehler' : '✅ Ergebnis', text: t.result || t.error, cls: t.error ? 'err' : 'done' }) });
  });
  if (a.status === 'working') items.push({ time: Date.now() + 1, html: `<div class="msg center typing"><span><i></i><i></i><i></i> ${esc(a.name)} arbeitet …</span></div>` });
  return items.sort((x, y) => x.time - y.time).slice(-200).map(i => i.html).join('') || '<div class="faint" style="text-align:center;padding:30px">Noch keine Unterhaltung.</div>';
}

/* Live-Protokoll */
const LIVE = { key: null, agentId: null, since: null, entries: [], found: null, hint: '', timer: null, loading: false };
function liveHtml() {
  if (LIVE.found === null) return '<div class="faint" style="padding:20px">Lade Protokoll …</div>';
  if (!LIVE.found) return `<div class="banner info">${esc(LIVE.hint || 'Keine Sitzung gefunden.')}</div>`;
  if (!LIVE.entries.length) return '<div class="faint" style="padding:20px">Noch keine Einträge in diesem Zeitraum.</div>';
  return LIVE.entries.map(e => {
    if (e.kind === 'text') return `<div class="lv lv-text"><div class="lv-h">🤖 Claude <span>${ago(e.time)}</span></div><div class="selectable">${esc(e.text)}</div></div>`;
    if (e.kind === 'tool') return `<div class="lv lv-tool"><div class="lv-h">⚙︎ ${esc(e.name)}${e.desc ? ` · <span class="muted">${esc(e.desc)}</span>` : ''} <span>${ago(e.time)}</span></div><pre class="selectable">${esc(e.text)}</pre></div>`;
    if (e.kind === 'result') return `<div class="lv lv-result ${e.error ? 'err' : ''}"><pre class="selectable">${esc(e.text || '(keine Ausgabe)')}</pre></div>`;
    return `<div class="lv lv-prompt"><div class="lv-h">👤 Eingabe <span>${ago(e.time)}</span></div><pre class="selectable">${esc(e.text)}</pre></div>`;
  }).join('');
}
function startLive(agentId, since) {
  const key = agentId + ':' + (since || 0);
  if (LIVE.key !== key) { Object.assign(LIVE, { key, agentId, since, entries: [], found: null, hint: '' }); }
  clearInterval(LIVE.timer);
  const tick = async () => {
    const box = $('#liveBox');
    if (!box) { clearInterval(LIVE.timer); LIVE.timer = null; return; }
    if (LIVE.loading) return;
    LIVE.loading = true;
    try {
      const r = await api('GET', `/api/agents/${agentId}/transcript?limit=400${since ? `&since=${Math.floor(since)}` : ''}`);
      if (LIVE.key !== key) return;
      LIVE.found = !!r.found; LIVE.hint = r.hint || r.error || ''; LIVE.entries = r.entries || [];
      const b = $('#liveBox'); if (!b) return;
      const sc = b.closest('.scroll-host') || b.parentElement;
      const nearBottom = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 80;
      b.innerHTML = liveHtml();
      if (nearBottom) sc.scrollTop = sc.scrollHeight;
    } catch (e) { LIVE.found = false; LIVE.hint = e.message; const b = $('#liveBox'); if (b) b.innerHTML = liveHtml(); }
    finally { LIVE.loading = false; }
  };
  tick();
  LIVE.timer = setInterval(tick, 3000);
}

/* Beschreibungsdatei */
const DOCS = {};
async function loadDoc(taskId) {
  try { const r = await api('GET', `/api/tasks/${taskId}/doc?format=json`); DOCS[taskId] = { path: r.path, content: r.content }; }
  catch (e) { DOCS[taskId] = { error: e.message }; }
  if (ui.drawerTask === taskId && ui.drawerTab === 'doc') renderDrawer();
}
function docHtml(t) {
  if (!t.docPath && !t.docFile) return `<div class="banner info">Für diesen Auftrag wird keine Beschreibungsdatei geführt.</div>`;
  const d = DOCS[t.id];
  if (!d) { loadDoc(t.id); return '<div class="faint">Lade Beschreibungsdatei …</div>'; }
  if (d.error) return `<div class="banner info">${esc(d.error)}</div><button class="btn btn-sm" data-action="doc-reload" data-id="${t.id}">${icon('refresh', 'sm')} Neu laden</button>`;
  return `<div class="flex between mb"><span class="mono faint" style="font-size:12px;word-break:break-all">${esc(d.path)}</span><div class="flex gap-s">
      <button class="btn btn-sm" data-action="doc-reload" data-id="${t.id}">${icon('refresh', 'sm')}</button>
      <button class="btn btn-sm" data-action="copy" data-text="${esc(d.path)}">${icon('copy', 'sm')} Pfad</button>
      ${window.DIRIGENT_NATIVE ? `<button class="btn btn-sm" data-action="reveal" data-path="${esc(d.path)}">${icon('folder', 'sm')} Finder</button>` : ''}</div></div>
    <div class="md selectable">${mdLite(d.content)}</div>`;
}
/** Minimaler Markdown-Renderer (Überschriften, Listen, Code, Zitate, fett/kursiv, Inline-Code). */
function mdLite(src) {
  const lines = String(src || '').split('\n');
  let out = '', inCode = false, fence = '', list = false;
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>').replace(/_\(([^)]+)\)_/g, '<i class="faint">($1)</i>');
  for (const l of lines) {
    const f = l.match(/^(```+|~~~+)/);
    if (f) { if (!inCode) { inCode = true; fence = f[1]; out += '<pre>'; } else if (l.startsWith(fence)) { inCode = false; out += '</pre>'; } else out += esc(l) + '\n'; continue; }
    if (inCode) { out += esc(l) + '\n'; continue; }
    const li = l.match(/^\s*[-*•] (.*)/) || l.match(/^\s*\d+\. (.*)/);
    if (li) { if (!list) { out += '<ul>'; list = true; } out += `<li>${inline(li[1])}</li>`; continue; }
    if (list) { out += '</ul>'; list = false; }
    const h = l.match(/^(#{1,4}) (.*)/);
    if (h) out += `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
    else if (l.startsWith('> ')) out += `<blockquote>${inline(l.slice(2))}</blockquote>`;
    else if (/^---+$/.test(l.trim())) out += '<hr>';
    else if (l.trim()) out += `<p>${inline(l)}</p>`;
  }
  if (inCode) out += '</pre>'; if (list) out += '</ul>';
  return out;
}

/* Ansicht: Chats */
function chatAgentRow(a) {
  const ref = 'agent:' + a.id;
  const open = openQuestionsToUser().filter(m => m.from === ref).length;
  const last = (S.messages || []).filter(m => m.from === ref || m.to === ref).slice(-1)[0];
  const cur = a.runningTasks?.length ? S.tasks.find(t => t.id === a.runningTasks[0]) : null;
  const sub = open ? `❓ ${open} Rückfrage${open > 1 ? 'n' : ''} an dich` : (cur ? '⚡ ' + cur.title : (last ? last.text : STATUS[a.status]));
  const depth = (() => { let d = 0, c = a; while (c?.supervisorId && d < 6) { c = agentById(c.supervisorId); if (!c) break; d++; } return d; })();
  return `<div class="chat-row ${ui.chatAgent === a.id ? 'active' : ''} st-${a.status}" data-action="chat-open" data-id="${a.id}" style="padding-left:${10 + depth * 14}px">
    ${avatar(a, 'sm')}<div class="txt"><div class="nm">${esc(a.name)} ${a.role === 'manager' ? '👑' : ''}</div><div class="sub">${esc(sub)}</div></div>
    ${open ? `<span class="count live">${open}</span>` : `<span class="dot ${a.status}"></span>`}</div>`;
}
function orderedAgents() {
  const out = [], seen = new Set();
  const walk = (a) => { if (seen.has(a.id)) return; seen.add(a.id); out.push(a); S.agents.filter(x => x.supervisorId === a.id).sort((x, y) => (x.role === 'manager' ? -1 : 1) - (y.role === 'manager' ? -1 : 1) || x.name.localeCompare(y.name)).forEach(walk); };
  S.agents.filter(a => !a.supervisorId || !agentById(a.supervisorId)).sort((x, y) => (x.role === 'manager' ? -1 : 1) - (y.role === 'manager' ? -1 : 1) || x.name.localeCompare(y.name)).forEach(walk);
  S.agents.forEach(walk);
  return out;
}
function chatListHtml() {
  const qs = openQuestionsToUser();
  return (qs.length ? `<div class="chat-sec">❓ Offene Rückfragen an dich</div>${qs.map(m => `<div class="chat-q" data-action="msg-answer" data-id="${m.id}"><b>${esc(partyLabel(m.from))}</b><span>${esc(m.text)}</span></div>`).join('')}` : '')
    + `<div class="chat-sec">Agenten</div>${orderedAgents().map(chatAgentRow).join('') || '<div class="faint" style="padding:10px">Noch keine Agenten.</div>'}`;
}
function chatHeadHtml(a) {
  const cur = a.runningTasks?.length ? S.tasks.find(t => t.id === a.runningTasks[0]) : null;
  const sup = agentById(a.supervisorId);
  return `<div class="flex" style="min-width:0">${avatar(a)}<div style="min-width:0"><div class="agent-name">${esc(a.name)} ${a.role === 'manager' ? '👑' : ''}</div>
      <div class="flex gap-s" style="font-size:12px">${statusPill(a.status)}${sup ? `<span class="faint">untersteht ${esc(sup.name)}</span>` : ''}${cur ? `<a class="clickable faint nowrap" data-action="task-open" data-id="${cur.id}" style="overflow:hidden;text-overflow:ellipsis">⚡ ${esc(cur.title)}</a>` : ''}</div></div></div>
    <div class="tabs"><button class="tab ${ui.chatTab !== 'live' ? 'active' : ''}" data-action="chat-tab" data-tab="chat">💬 Chat</button><button class="tab ${ui.chatTab === 'live' ? 'active' : ''}" data-action="chat-tab" data-tab="live">🖥️ Live</button></div>`;
}
function vChats() {
  if (!S.agents.length) return onboarding();
  if (!ui.chatAgent || !agentById(ui.chatAgent)) ui.chatAgent = orderedAgents()[0]?.id;
  const a = agentById(ui.chatAgent);
  const cur = a.runningTasks?.length ? S.tasks.find(t => t.id === a.runningTasks[0]) : null;
  setTimeout(() => { const b = $('#chatBody'); if (b) b.scrollTop = b.scrollHeight; if (ui.chatTab === 'live') startLive(a.id, null); }, 0);
  return `<div class="chat-wrap">
    <div class="panel chat-list" id="chatList">${chatListHtml()}</div>
    <div class="panel chat-main">
      <div class="chat-head" id="chatHead">${chatHeadHtml(a)}</div>
      <div class="chat-body scroll-host" id="chatBody">${ui.chatTab === 'live' ? `<div id="liveBox">${liveHtml()}</div>` : `<div class="chat">${agentTimeline(a)}</div>`}</div>
      <div class="composer" id="chatComposer" data-agent="${a.id}">
        <textarea class="textarea" id="chatText" placeholder="Nachricht an ${esc(a.name)} … (⌘↵ senden)"></textarea>
        <div class="composer-row">
          ${cur ? `<label class="chk"><input type="checkbox" id="chatLink" checked> zu „${esc(cur.title.slice(0, 40))}“</label>` : ''}
          <label class="chk" title="Der Agent hält beim nächsten Kontakt sofort an und liest die Nachricht zuerst"><input type="checkbox" id="chatUrgent"> ⛔ Unterbrechen</label>
          <span class="faint" style="font-size:11.5px;margin-left:auto">${a.status === 'waiting' ? 'wird sofort zugestellt' : a.status === 'working' ? 'Zustellung beim nächsten Zwischenstand' : 'wird zugestellt, sobald der Agent bereit ist'}</span>
          <button class="btn btn-sm btn-primary" data-action="chat-send-agent" data-id="${a.id}" data-task="${cur?.id || ''}">${icon('send', 'sm')} Senden</button>
        </div>
      </div>
    </div></div>`;
}
function updateChats() {
  const a = agentById(ui.chatAgent); if (!a) return false;
  $('#chatList').innerHTML = chatListHtml();
  $('#chatHead').innerHTML = chatHeadHtml(a);
  if (ui.chatTab !== 'live') {
    const b = $('#chatBody'); const near = b.scrollHeight - b.scrollTop - b.clientHeight < 80;
    b.innerHTML = `<div class="chat">${agentTimeline(a)}</div>`;
    if (near) b.scrollTop = b.scrollHeight;
  }
  return true;
}

/* Organigramm */
function orgNode(a, depth = 0) {
  const kids = S.agents.filter(x => x.supervisorId === a.id);
  const cur = a.runningTasks?.length ? S.tasks.find(t => t.id === a.runningTasks[0]) : null;
  return `<div class="org-node"><div class="org-card st-${a.status}" data-action="chat-open" data-id="${a.id}" title="Chat mit ${esc(a.name)}">
      ${avatar(a, 'sm')}<div class="txt"><div class="nm">${esc(a.name)} ${a.role === 'manager' ? '👑' : ''}</div><div class="sub">${esc(cur ? '⚡ ' + cur.title : STATUS[a.status])}</div></div>
      ${a.role === 'manager' && kids.length ? `<span class="tag">${kids.length} im Team</span>` : ''}<span class="dot ${a.status}"></span></div>
    ${kids.length && depth < 8 ? `<div class="org-kids">${kids.map(k => orgNode(k, depth + 1)).join('')}</div>` : ''}</div>`;
}
function orgChart() {
  const roots = S.agents.filter(a => !a.supervisorId || !agentById(a.supervisorId)).sort((x, y) => (x.role === 'manager' ? -1 : 1) - (y.role === 'manager' ? -1 : 1));
  return `<div class="panel"><div class="panel-body">
    <p class="muted" style="margin-top:0;font-size:13px">Baukasten: Jeder Agent kann einem Manager unterstehen – auch Manager einem Manager (Orchestrator über Orchestratoren). Rückfragen laufen die Kette hinauf, Aufträge an <span class="mono">team:&lt;manager&gt;</span> gehen an einen freien Agenten seines Teams. Zuordnen per ${icon('edit', 'sm')} auf der Agentenkarte.</p>
    <div class="org">${roots.map(r => orgNode(r)).join('')}</div></div></div>`;
}

const chatActions = {
  'chat-open': (el) => { closeDrawer(); ui.view = 'chats'; ui.chatAgent = el.dataset.id; ui.chatTab = 'chat'; try { localStorage.setItem('dirigent.view', 'chats'); } catch {} render(); },
  'chat-tab': (el) => { ui.chatTab = el.dataset.tab; $('#chatComposer')?.removeAttribute('data-agent'); render(); },
  'chat-send-agent': async (el) => {
    const text = $('#chatText').value.trim(); if (!text) { $('#chatText').focus(); return; }
    const body = { text, urgent: $('#chatUrgent').checked };
    if (el.dataset.task && $('#chatLink')?.checked) body.task = el.dataset.task;
    try { await api('POST', `/api/agents/${el.dataset.id}/messages?format=json`, body); $('#chatText').value = ''; toast('✉️', body.urgent ? 'Unterbrechung gesendet' : 'Nachricht gesendet'); refreshSoon(); } catch (e) { toast('⚠️', e.message); }
  },
  'chat-send-task': async (el) => {
    const text = $('#chatText').value.trim(); if (!text) { $('#chatText').focus(); return; }
    const to = $('#chatTo')?.value || 'agent';
    try { await api('POST', `/api/tasks/${el.dataset.id}/message?format=json`, { text, urgent: $('#chatUrgent').checked, to }); $('#chatText').value = ''; toast('✉️', to === 'manager' ? 'Ergänzung an den Manager gesendet' : 'Nachricht gesendet'); refreshSoon(); } catch (e) { toast('⚠️', e.message); }
  },
  'msg-answer': (el) => {
    const m = (S.messages || []).find(x => x.id === el.dataset.id); if (!m) return;
    askModal({ title: `Rückfrage von ${partyLabel(m.from)}`, label: m.text.length > 300 ? m.text.slice(0, 300) + ' …' : m.text, ok: 'Antwort senden', required: true,
      placeholder: 'Deine Antwort …', hint: 'Der Agent wird mit deiner Antwort geweckt bzw. erhält sie beim nächsten Kontakt.',
      onOk: async (v) => { await api('POST', `/api/messages/${m.id}/answer`, { text: v }); toast('💬', 'Antwort gesendet'); } });
  },
  'msg-escalate': async (el) => { try { await api('POST', `/api/messages/${el.dataset.id}/escalate`, { note: '' }); toast('↗︎', 'Weitergeleitet'); } catch (e) { toast('⚠️', e.message); } },
  'drawer-tab': (el) => { ui.drawerTab = el.dataset.tab; renderDrawer(true); },
  'doc-reload': (el) => { delete DOCS[el.dataset.id]; renderDrawer(); },
  'agents-mode': (el) => { ui.agentsMode = el.dataset.m; try { localStorage.setItem('dirigent.agentsMode', ui.agentsMode); } catch {} render(); },
  'proj-supplement': async (el) => {
    const text = $('#pjSupp').value.trim(); if (!text) { $('#pjSupp').focus(); return; }
    try { await api('POST', `/api/projects/${el.dataset.id}/message?format=json`, { text, urgent: $('#pjSuppUrgent').checked, createdBy: 'user' }); $('#pjSupp').value = ''; $('#pjSupp').blur(); toast('➕', 'Ergänzung an den Manager gesendet – er verteilt sie'); } catch (e) { toast('⚠️', e.message); }
  },
};

/* ───────── Modals ───────── */
function modal(html, cls = '') {
  $('#modalRoot').innerHTML = `<div class="modal-back" data-action="modal-bg"><div class="modal ${cls}">${html}</div></div>`;
  const f = $('#modalRoot [autofocus]'); if (f) setTimeout(() => f.focus(), 30);
}
const closeModal = () => { $('#modalRoot').innerHTML = ''; };

function targetPicker(current = 'any', name = 'target') {
  const opts = [['any', '⚡ Beliebiger Worker'], ['manager', '👑 Manager'], ['all', '📣 Alle Worker'],
    ...S.agents.map(a => [`agent:${a.id}`, `${a.status === 'waiting' ? '🟢' : a.status === 'working' ? '🟣' : '⚪️'} ${a.name}`]),
    ...S.agents.filter(a => S.agents.some(x => x.supervisorId === a.id)).map(a => [`team:${a.id}`, `👥 Team ${a.name}`]),
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
    <label class="chk" style="margin-bottom:12px"><input type="checkbox" id="cDoc" ${S.settings?.docFiles === false ? '' : 'checked'}> 📄 Beschreibungsdatei verlangen <span class="faint">(.dirigent/…md im Arbeitsordner – Auftrag wörtlich + ausführliche Doku des Agenten)</span></label>
    ${!S.agents.length ? '<div class="banner info">Noch kein Agent angemeldet – der Auftrag wartet in der Warteschlange, bis sich einer meldet.</div>' : ''}
  </div>
  <div class="modal-foot"><span class="faint" style="margin-right:auto;font-size:12px"><kbd>⌘</kbd> <kbd>↵</kbd> zum Senden</span><button class="btn" data-action="modal-close">Abbrechen</button><button class="btn btn-primary" data-action="compose-send">${icon('send', 'sm')} Senden</button></div>`);
}

async function composeSend() {
  const prompt = $('#cPrompt').value.trim();
  if (!prompt) { $('#cPrompt').focus(); return; }
  try {
    const r = await api('POST', '/api/tasks', { prompt, target: $('#cTarget').value, title: $('#cTitle').value, priority: +$('#cPrio').value || 0, createdBy: 'user', doc: $('#cDoc').checked });
    closeModal(); toast('📨', `${r.tasks.length > 1 ? r.tasks.length + ' Aufträge' : 'Auftrag'} gesendet → ${targetLabel($('#cTarget')?.value || r.tasks[0].target)}`);
  } catch (e) { toast('⚠️', e.message); }
}

function joinModal() {
  modal(`<div class="modal-head"><h2>Agent anmelden</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    <p class="muted" style="margin-top:0">Füge einen dieser Sätze in Claude Code ein. Der Agent registriert sich, startet einen Warte-Befehl <b>im Hintergrund</b> und beendet seinen Zug – ab da verbraucht er <b>0 Tokens</b>, bis ein Auftrag kommt.</p>
    <div class="block-title">Worker</div>${codeBlock(joinPrompt())}
    <div class="block-title">Manager</div>${codeBlock(joinPrompt('manager'))}
    <div class="block-title">Unter-Manager / Team-Mitglied (Baukasten)</div>${codeBlock(`Melde dich bei Dirigent als Agent "ios-dev" an, dein Vorgesetzter ist der Manager "app-lead". Anleitung: curl -s "${BASE}/join?name=ios-dev&supervisor=app-lead"`)}
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

/** Liegt `id` (direkt oder indirekt) unterhalb von `lead`? */
function isBelow(id, lead) { let c = agentById(id), n = 0; while (c?.supervisorId && n++ < 50) { if (c.supervisorId === lead) return true; c = agentById(c.supervisorId); } return false; }
function agentEditModal(id) {
  const a = agentById(id); if (!a) return;
  modal(`<div class="modal-head"><h2>${esc(a.name)} bearbeiten</h2><button class="btn btn-icon btn-ghost" data-action="modal-close">${icon('x')}</button></div>
  <div class="modal-body">
    <div class="field"><label>Name</label><input class="input" id="aName" value="${esc(a.name)}"></div>
    <div class="field"><label>Beschreibung</label><input class="input" id="aDesc" value="${esc(a.description)}"></div>
    <div class="field"><label>Tags (kommagetrennt)</label><input class="input" id="aTags" value="${esc((a.tags || []).join(', '))}"></div>
    <div class="field"><label>Untersteht (Vorgesetzter)</label><select class="select" id="aSup"><option value="">– niemandem (oberste Ebene) –</option>${S.agents.filter(x => x.id !== a.id && !isBelow(x.id, a.id)).sort((x, y) => (x.role === 'manager' ? -1 : 1) - (y.role === 'manager' ? -1 : 1)).map(x => `<option value="${x.id}" ${x.id === a.supervisorId ? 'selected' : ''}>${x.role === 'manager' ? '👑 ' : ''}${esc(x.name)}</option>`).join('')}</select>
      <span class="hint">Baukasten: Manager können anderen Managern unterstehen. Rückfragen laufen die Kette hinauf.</span></div>
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
  nav: (el) => { ui.view = el.dataset.view; ui.project = null; try { localStorage.setItem('dirigent.view', ui.view); } catch {} closeDrawer(); render(); $('#view').scrollTop = 0; },
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
  'agent-save': async (el) => { await api('PATCH', `/api/agents/${el.dataset.id}`, { name: $('#aName').value, description: $('#aDesc').value, tags: $('#aTags').value.split(',').map(s => s.trim()).filter(Boolean), role: $('#aRole').value, color: $('#aColor').value, supervisor: $('#aSup').value }); closeModal(); },
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
  ...projActions,
  ...chatActions,
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
  if (el.dataset.action === 'set-docs') await api('PUT', '/api/settings', { docFiles: el.checked });
  if (el.dataset.assign) {
    el.blur();
    try { await api('PATCH', `/api/projects/${el.dataset.p}/parts/${el.dataset.assign}?format=json`, { agentId: el.value }); toast('📌', `Eingeteilt: ${el.value ? agentById(el.value)?.name : 'beliebiger Worker'}`); }
    catch (e) { toast('⚠️', e.message); refresh(); }
  }
  if (el.id === 'setTheme') applyTheme(el.value, true);
});
document.addEventListener('input', (ev) => {
  if (ev.target.id === 'taskSearch') { ui.taskSearch = ev.target.value; clearTimeout(ui.st); ui.st = setTimeout(render, 150); }
});
document.addEventListener('keydown', (ev) => {
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 'k') { ev.preventDefault(); composeModal(); }
  if (ev.key === 'Escape' && document.activeElement?.id === 'chatText' && !$('#modalRoot').innerHTML) { document.activeElement.blur(); }
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter' && $('#cPrompt')) { ev.preventDefault(); composeSend(); }
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter' && $('#askText')) { ev.preventDefault(); actions['ask-ok'](); }
  else if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter' && document.activeElement?.id === 'chatText') {
    ev.preventDefault(); const b = document.querySelector('[data-action="chat-send-task"], [data-action="chat-send-agent"]');
    const inDrawer = $('#drawer').contains(document.activeElement);
    const btn = inDrawer ? $('#drawer [data-action="chat-send-task"]') : $('#view [data-action="chat-send-agent"]');
    if (btn || b) actions[(btn || b).dataset.action](btn || b);
  }
  else if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter' && document.activeElement?.id === 'pjSupp') { ev.preventDefault(); const b = $('[data-action="proj-supplement"]'); if (b) actions['proj-supplement'](b); }
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
  setInterval(() => { if (['overview', 'agents', 'tasks', 'projects', 'chats'].includes(ui.view) || ui.drawerTask) refreshSoon(); }, 15000);
  new MutationObserver(() => { const sel = $('#setTheme'); if (sel && !sel.dataset.init) { sel.dataset.init = 1; try { sel.value = localStorage.getItem('dirigent.theme') || ''; } catch {} } }).observe($('#view'), { childList: true });
})();
