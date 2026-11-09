/* eslint-disable */
// Improvement — daily tasks, NoFap tracking, journal and urge log.
// Plain JS rendered into #app. Persistence: the Android shell exposes
// `StationsStore` (SharedPreferences); in a desktop browser we fall back to
// localStorage. The storage key and document shape are kept from Stations
// 1.x — new data lives in new keys next to the old ones.
(function () {
  'use strict';

  var STORE_KEY = 'stations.state.v1';
  var MAX_CATCH_UP = 400;
  var PAGE = 30;
  var NOFAP_LISTS = [
    { key: 'immediate', title: 'Immediate action list', hint: 'What to do the moment an urge hits.', add: 'Add action' },
    { key: 'offensive', title: 'Offensive tactics', hint: 'Habits that build you up and keep you busy.', add: 'Add tactic' },
    { key: 'defensive', title: 'Defensive tactics', hint: 'Barriers that keep triggers away.', add: 'Add tactic' }
  ];
  var TRIGGERS = ['Boredom', 'Stress', 'Loneliness', 'Tired', 'Phone / social media', 'Late night', 'Alone at home'];
  var MOODS = ['Anxious', 'Sad', 'Bored', 'Angry', 'Restless', 'Low energy'];
  // Initial lock code, stored only as salted SHA-256. Change it in Settings → Security.
  var DEFAULT_SECURITY = { salt: '12fc89437d92ec05355c882c54ae1a76', hash: 'edbf324b94313614520589ef9a1d9adef83edf346841fdcb29176897d834b541' };

  // ---------------------------------------------------------------- sha256
  function sha256(ascii) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var maxWord = Math.pow(2, 32), i, j, result = '', words = [], bitLen = ascii.length * 8;
    var hash = [], k = [], n = 0, composite = {};
    for (var c = 2; n < 64; c++) {
      if (!composite[c]) {
        for (i = 0; i < 313; i += c) composite[i] = c;
        hash[n] = (Math.pow(c, 0.5) * maxWord) | 0;
        k[n++] = (Math.pow(c, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (bitLen / maxWord) | 0;
    words[words.length] = bitLen;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), old = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
          (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; result += (b < 16 ? '0' : '') + b.toString(16); }
    return result;
  }
  function randomHex(bytes) {
    var a = new Uint8Array(bytes), s = '';
    try { window.crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < bytes; i++) a[i] = Math.floor(Math.random() * 256); }
    for (var j = 0; j < a.length; j++) s += (a[j] < 16 ? '0' : '') + a[j].toString(16);
    return s;
  }

  // ---------------------------------------------------------------- dates
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function localToday() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function nowTime() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function addDays(iso, n) { var p = iso.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10); }
  function daysBetween(a, b) {
    var pa = a.split('-').map(Number), pb = b.split('-').map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }
  var W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function parts(iso) {
    var p = iso.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return { wd: W[d.getUTCDay()], wdl: WL[d.getUTCDay()], day: d.getUTCDate(), mon: M[d.getUTCMonth()], year: p[0] };
  }
  function fmt(iso) { var x = parts(iso); return x.wd + ' ' + x.day + ' ' + x.mon; }
  function fmtLong(iso) { var x = parts(iso); return x.wdl + ' ' + x.day + ' ' + x.mon + ' ' + x.year; }

  // ---------------------------------------------------------------- state
  function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function defaultActions() {
    return [
      { id: 'a1', name: 'Cold shower', tags: ['Restless', 'Stress', 'Boredom', 'Late night'] },
      { id: 'a2', name: '20 push-ups', tags: ['Restless', 'Angry', 'Boredom', 'Bored'] },
      { id: 'a3', name: 'Walk outside for 15 min', tags: ['Alone at home', 'Anxious', 'Sad', 'Boredom', 'Bored'] },
      { id: 'a4', name: 'Call or text a friend', tags: ['Loneliness', 'Sad', 'Alone at home'] },
      { id: 'a5', name: 'Put the phone in another room', tags: ['Phone / social media', 'Late night'] },
      { id: 'a6', name: 'Go to sleep now', tags: ['Tired', 'Late night', 'Low energy'] },
      { id: 'a7', name: 'Write it out in the journal', tags: ['Anxious', 'Sad', 'Angry', 'Stress'] },
      { id: 'a8', name: '5 minutes of slow breathing', tags: ['Anxious', 'Stress', 'Angry', 'Restless'] }
    ];
  }

  function defaultState() {
    return {
      version: 2,
      goals: [
        { id: 'g1', name: 'Wake up by 6:30', points: 3, nonNegotiable: false },
        { id: 'g2', name: 'Workout 30 min', points: 5, nonNegotiable: true },
        { id: 'g3', name: 'Deep work 2 hours', points: 5, nonNegotiable: false },
        { id: 'g4', name: 'Read 20 pages', points: 3, nonNegotiable: false },
        { id: 'g5', name: 'No sugar', points: 4, nonNegotiable: true },
        { id: 'g6', name: '10k steps', points: 3, nonNegotiable: false },
        { id: 'g7', name: 'Sleep by 23:00', points: 2, nonNegotiable: false }
      ],
      rewards: [
        { id: 'r1', name: 'Cinema night', daysRequired: 7 },
        { id: 'r2', name: 'New running shoes', daysRequired: 15 },
        { id: 'r3', name: 'Weekend trip', daysRequired: 30 },
        { id: 'r4', name: 'Concert tickets', daysRequired: 60 },
        { id: 'r5', name: 'A new watch', daysRequired: 100 }
      ],
      settings: { minScore: 20 },
      counter: 0,
      today: localToday(),
      doneToday: {},
      history: [],
      nofap: { immediate: [], offensive: [], defensive: [] },
      historyResetV2: true,
      journal: [],
      urges: [],
      actions: defaultActions(),
      nofapSince: localToday(),
      security: { salt: DEFAULT_SECURITY.salt, hash: DEFAULT_SECURITY.hash }
    };
  }

  // Brings any saved document up to date. Old keys are kept as they are.
  function migrate(s) {
    s.goals = s.goals || [];
    s.rewards = s.rewards || [];
    s.settings = s.settings || { minScore: 1 };
    s.doneToday = s.doneToday || {};
    s.counter = s.counter || 0;
    s.today = s.today || localToday();
    s.history = Array.isArray(s.history) ? s.history : [];
    s.nofap = s.nofap || {};
    NOFAP_LISTS.forEach(function (l) { if (!Array.isArray(s.nofap[l.key])) s.nofap[l.key] = []; });
    // One-time reset of the day history for Improvement 2.0 (never runs again).
    if (!s.historyResetV2) {
      s.history = [];
      s.counter = 0;
      s.historyResetV2 = true;
    }
    if (!Array.isArray(s.journal)) s.journal = [];
    if (!Array.isArray(s.urges)) s.urges = [];
    if (!Array.isArray(s.actions)) s.actions = defaultActions();
    if (!s.nofapSince) s.nofapSince = localToday();
    if (!s.security || !s.security.hash) s.security = { salt: DEFAULT_SECURITY.salt, hash: DEFAULT_SECURITY.hash };
    s.version = 2;
    return s;
  }

  function load() {
    var raw = null;
    try { raw = window.StationsStore ? window.StationsStore.load() : window.localStorage.getItem(STORE_KEY); } catch (e) { raw = null; }
    if (!raw) return defaultState();
    try {
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.goals)) return defaultState();
      return migrate(s);
    } catch (e) { return defaultState(); }
  }

  function save() {
    var raw = JSON.stringify(S);
    try {
      if (window.StationsStore) window.StationsStore.save(raw);
      else window.localStorage.setItem(STORE_KEY, raw);
    } catch (e) { /* storage unavailable: keep running in memory */ }
  }

  var S = load();
  // Everything in `ui` lives in memory only — including the unlock flag, so a
  // fresh start of the app is always locked.
  var ui = {
    locked: true, pin: '', pinErr: false, pinMode: 'unlock', pinFirst: '',
    screen: 'today', drawer: false, modal: null,
    graphYears: 1, graphScroll: null, histLimit: PAGE, histOpen: null, edit: null,
    journalDraft: '', jView: 'list', jId: null, jText: '', jConfirmDelete: false,
    ud: freshUrge(), urgeOpen: null, urgeConfirmDelete: null, actionOpen: null,
    q: { goals: '', rewards: '' }, nfNew: null
  };

  function freshUrge() { return { step: 1, intensity: 0, triggers: [], moods: [], note: '', suggested: [], did: [], outcome: '' }; }

  // ---------------------------------------------------------------- rules
  function totalPoints(goals) { return goals.reduce(function (t, g) { return t + g.points; }, 0); }

  function evaluate(goals, done, min) {
    var score = 0, total = 0, missing = [];
    goals.forEach(function (g) {
      total += g.points;
      if (done[g.id]) score += g.points;
      else if (g.nonNegotiable) missing.push(g.name);
    });
    return { score: score, total: total, missing: missing, result: missing.length ? 'reset' : score >= min ? 'count' : 'hold' };
  }

  function dayOutcome(items, min) {
    var score = 0, total = 0, missing = false;
    items.forEach(function (it) {
      total += it.points;
      if (it.done) score += it.points;
      else if (it.nonNegotiable) missing = true;
    });
    return { score: score, total: total, result: missing ? 'reset' : score >= min ? 'count' : 'hold' };
  }

  function sortedRewards() { return S.rewards.slice().sort(function (a, b) { return a.daysRequired - b.daysRequired; }); }

  function closeOpenDay() {
    var ev = evaluate(S.goals, S.doneToday, S.settings.minScore);
    var counter = ev.result === 'count' ? S.counter + 1 : ev.result === 'reset' ? 0 : S.counter;
    S.history.push({
      date: S.today,
      items: S.goals.map(function (g) { return { goalName: g.name, points: g.points, nonNegotiable: g.nonNegotiable, done: !!S.doneToday[g.id] }; }),
      score: ev.score, minScore: S.settings.minScore, total: ev.total, result: ev.result, counterAfter: counter, relapseReason: ''
    });
    S.counter = counter;
    S.today = addDays(S.today, 1);
    S.doneToday = {};
    return ev;
  }

  // Re-derives every closed day's result and the counter chain from the stored
  // snapshots; each day keeps its own minimum.
  function replayHistory() {
    var c = 0;
    S.history.forEach(function (h, i) {
      if (i === S.counterResetAt) c = 0; // manual "Reset counters" point
      var o = dayOutcome(h.items, h.minScore);
      h.score = o.score; h.total = o.total; h.result = o.result;
      c = h.result === 'count' ? c + 1 : h.result === 'reset' ? 0 : c;
      h.counterAfter = c;
    });
    S.counter = S.history.length === S.counterResetAt ? 0 : c;
  }

  // Starts a new run: the successful-days counter goes to 0 from the open day
  // on, and NoFap "clean since" becomes today. Closed days, journal and urges
  // are kept; the reset point makes later edits of old days leave it at 0.
  function resetCounters() {
    S.counterResetAt = S.history.length;
    S.counterResetOn = localToday();
    S.counter = 0;
    S.nofapSince = localToday();
  }

  // Index of the first closed day of the current run.
  function runStartIndex() {
    var start = S.counterResetAt || 0;
    S.history.forEach(function (h, i) { if (h.result === 'reset' && i + 1 > start) start = i + 1; });
    return start;
  }

  // A day stays open until the end of the following day. Anything older is
  // closed automatically with whatever was ticked.
  function catchUp() {
    var yesterday = addDays(localToday(), -1), closed = [], guard = 0;
    while (S.today < yesterday && guard++ < MAX_CATCH_UP) { closeOpenDay(); closed.push(S.history[S.history.length - 1]); }
    if (guard >= MAX_CATCH_UP && S.today < yesterday) S.today = yesterday;
    if (closed.length) {
      save();
      var resets = closed.filter(function (h) { return h.result === 'reset'; }).length;
      var body = closed.length === 1
        ? fmt(closed[0].date) + ' was left open, so it was closed with the tasks you had ticked (' + closed[0].score + '/' + closed[0].minScore + ').'
        : 'Days from ' + fmt(closed[0].date) + ' to ' + fmt(closed[closed.length - 1].date) + ' were left open and closed with what was ticked.';
      if (resets) body += ' A missed non-negotiable counted as a relapse — tap the orange day in the calendar to write why.';
      body += ' You are now at ' + plural(S.counter, 'day', 'days') + '.';
      ui.modal = { type: 'info', kicker: 'While you were away', color: '#3F433C', title: closed.length === 1 ? '1 day closed' : closed.length + ' days closed', body: body, ok: 'Got it' };
    }
    return closed.length;
  }

  function clampMin() {
    var t = totalPoints(S.goals);
    if (S.settings.minScore > t) S.settings.minScore = Math.max(1, t);
    if (S.settings.minScore < 1) S.settings.minScore = 1;
  }

  function suggest(tags, intensity) {
    return S.actions.map(function (a, i) { return { a: a, i: i, n: a.tags.filter(function (t) { return tags.indexOf(t) >= 0; }).length }; })
      .sort(function (x, y) { return (y.n - x.n) || (x.i - y.i); })
      .slice(0, intensity >= 7 ? 4 : 3).map(function (r) { return r.a.id; });
  }

  function nofapDays() { return Math.max(0, daysBetween(S.nofapSince, localToday())); }

  // ---------------------------------------------------------------- helpers
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function toggleIn(list, v) { return list.indexOf(v) >= 0 ? list.filter(function (x) { return x !== v; }) : list.concat([v]); }
  function attr(id) { return esc(id); }

  function svg(w, sw, body, extra) {
    return '<svg width="' + w + '" height="' + w + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + body + '</svg>';
  }
  var I = {
    plus: svg(16, 2.8, '<path d="M12 6v12M6 12h12"/>'),
    minus: svg(16, 2.6, '<path d="M6 12h12"/>'),
    check: svg(16, 3.2, '<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    checkSm: svg(12, 3.4, '<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    xSm: svg(12, 3.4, '<path d="M7 7l10 10M17 7L7 17"/>'),
    trash: svg(18, 2, '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5a2 2 0 0 0 2 1.5h6a2 2 0 0 0 2-1.5L18 7M9 7V4.5h6V7"/>'),
    trashSm: svg(16, 2, '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5a2 2 0 0 0 2 1.5h6a2 2 0 0 0 2-1.5L18 7M9 7V4.5h6V7"/>'),
    lock: svg(22, 2, '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    lockBig: svg(28, 2.2, '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    menu: svg(24, 2.2, '<path d="M4 7h16M4 12h16M4 17h10"/>'),
    left: svg(18, 2.4, '<path d="M15 6l-6 6 6 6"/>'),
    right: svg(18, 2.4, '<path d="M9 6l6 6-6 6"/>'),
    chev: svg(18, 2.4, '<path d="M6 9l6 6 6-6"/>', ' class="chev"'),
    flame: svg(22, 2.2, '<path d="M12 3c.8 3.2 4.5 5.2 4.5 9.5a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2.2-4.4.1 1.8.9 3 2 3.4C11.4 9 11 6 12 3z"/>'),
    back: svg(26, 2, '<path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>'),
    pencil: svg(16, 2.2, '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>'),
    search: svg(18, 2.2, '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
    nToday: svg(22, 2, '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.8"/>'),
    nJournal: svg(22, 2, '<path d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/><path d="M6 18a2 2 0 0 1 2-2h11M10 8h5M10 11h5"/>'),
    nUrges: svg(22, 2, '<path d="M12 3c.8 3.2 4.5 5.2 4.5 9.5a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2.2-4.4.1 1.8.9 3 2 3.4C11.4 9 11 6 12 3z"/>'),
    nDays: svg(22, 2, '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    nJourney: svg(22, 2, '<circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M8.2 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.8"/>'),
    nSettings: svg(22, 2, '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>')
  };

  function itemRows(items) {
    return items.map(function (it) {
      return '<li class="' + (it.done ? 'done' : 'missed') + (it.nonNegotiable ? ' must' : '') + '"><span class="ic">' + (it.done ? I.checkSm : I.xSm) + '</span>' +
        '<span class="nm">' + esc(it.goalName) + '</span>' + (it.nonNegotiable ? '<span class="mustlbl">Must</span>' : '') +
        '<span class="pt">' + (it.done ? '+' + it.points : '0') + '</span></li>';
    }).join('');
  }
  function pillOf(h) {
    return h.result === 'count' ? { t: '+1 → ' + h.counterAfter, c: 'count' } : h.result === 'reset' ? { t: 'Relapsed', c: 'reset' } : { t: 'No change', c: 'hold' };
  }
  function nextInfo() {
    var rewards = sortedRewards();
    var next = rewards.find(function (r) { return r.daysRequired > S.counter; });
    var prevDays = rewards.filter(function (r) { return r.daysRequired <= S.counter; }).reduce(function (m, r) { return Math.max(m, r.daysRequired); }, 0);
    return { rewards: rewards, next: next, prevDays: prevDays };
  }
  function chip(on, accent) { return 'chip' + (on ? (accent ? ' on accent' : ' on') : ''); }
  function sortedByWhen(list) { return list.slice().sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); }); }
  function preview(t) { return t.length > 140 ? t.slice(0, 140).trim() + '…' : t; }

  // ---------------------------------------------------------------- lock
  function renderLock() {
    var title = ui.pinMode === 'unlock' ? 'Enter your code to open' : ui.pinMode === 'new' ? 'Choose a new 6-digit code' : 'Enter the new code again';
    var dots = '';
    for (var i = 0; i < 6; i++) dots += '<span class="dot' + (i < ui.pin.length ? ' on' : '') + '"></span>';
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map(function (k) {
      if (k === '') return ui.pinMode === 'unlock' ? '<span class="key blank"></span>' : '<button type="button" class="key text" data-a="pinCancel">Cancel</button>';
      if (k === 'back') return '<button type="button" class="key ghost" aria-label="Delete last digit" data-a="pinKey" data-k="back">' + I.back + '</button>';
      return '<button type="button" class="key" data-a="pinKey" data-k="' + k + '">' + k + '</button>';
    }).join('');
    var msg = ui.pinErr ? (ui.pinMode === 'confirm' || ui.pinMode === 'new' ? 'Codes did not match. Start again.' : 'Wrong code. Try again.') : '';
    return '<div class="lock"><div class="lock-top"><span class="lock-ic">' + I.lockBig + '</span><h1>Improvement</h1><span class="lock-sub">' + title + '</span></div>' +
      '<div class="dots" aria-label="Code entered">' + dots + '</div><span class="lock-msg" role="status">' + msg + '</span>' +
      '<div class="keys">' + keys + '</div></div>';
  }

  function pinKey(k) {
    if (k === 'back') { ui.pin = ui.pin.slice(0, -1); ui.pinErr = false; return render(); }
    if (ui.pin.length >= 6) return;
    ui.pin += k; ui.pinErr = false;
    if (ui.pin.length < 6) return render();
    var v = ui.pin;
    ui.pin = '';
    if (ui.pinMode === 'unlock') {
      if (sha256(S.security.salt + v) === S.security.hash) { ui.locked = false; setBars(); }
      else ui.pinErr = true;
    } else if (ui.pinMode === 'new') {
      ui.pinFirst = v; ui.pinMode = 'confirm';
    } else {
      if (v === ui.pinFirst) {
        var salt = randomHex(16);
        S.security = { salt: salt, hash: sha256(salt + v) };
        save();
        ui.pinMode = 'unlock'; ui.pinFirst = ''; ui.locked = false;
        ui.modal = { type: 'info', kicker: 'Security', title: 'Code changed', body: 'Use your new code from the next time the app opens.', ok: 'Done', color: '#1E6A50' };
        setBars();
      } else { ui.pinMode = 'new'; ui.pinFirst = ''; ui.pinErr = true; }
    }
    render();
  }

  function lockNow() { ui.locked = true; ui.pin = ''; ui.pinErr = false; ui.pinMode = 'unlock'; ui.drawer = false; ui.modal = null; setBars(); render(); }

  function setBars() {
    try { if (window.StationsStore && window.StationsStore.setDarkBars) window.StationsStore.setDarkBars(ui.locked); } catch (e) { }
  }

  // ---------------------------------------------------------------- today
  function statusFor(ev) {
    var min = S.settings.minScore;
    if (!S.goals.length) return { cls: 'hold', t: 'No tasks yet', b: 'Add daily tasks in Settings to start scoring your days.', ct: 'No tasks', cb: 'Counter stays at ' + S.counter + '.' };
    if (ev.missing.length) return { cls: 'reset', t: 'Non-negotiable still open', b: ev.missing.join(', ') + ' — if you close the day without it, it counts as a relapse.', ct: 'This will be a relapse', cb: 'Missing: ' + ev.missing.join(', ') + '. Counter goes back to 0.' };
    if (ev.result === 'count') return { cls: 'count', t: 'This day counts', b: 'Close it and your counter moves to ' + (S.counter + 1) + '.', ct: 'Day counts', cb: 'Counter goes from ' + S.counter + ' to ' + (S.counter + 1) + '.' };
    return { cls: 'hold', t: plural(min - ev.score, 'point', 'points') + ' to the minimum', b: 'Below it nothing happens — the counter stays at ' + S.counter + '.', ct: 'No change', cb: 'Below the minimum. Counter stays at ' + S.counter + '.' };
  }

  // GitHub-style grid: one column per week (Mon → Sun), at least a year,
  // scrollable sideways, every past day tappable.
  var CELL_WORDS = { count: 'counted', hold: 'no change', reset: 'relapsed' };
  function countLevel(h) {
    var r = h.score / Math.max(1, h.total);
    return r >= 1 ? 4 : r >= 0.85 ? 3 : r >= 0.7 ? 2 : 1;
  }
  function graphRange() {
    var real = localToday();
    var from = addDays(real, -364 * ui.graphYears);
    if (S.history.length && S.history[0].date < from) from = S.history[0].date;
    var p = from.split('-').map(Number), dow = (new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() + 6) % 7;
    return { from: addDays(from, -dow), to: real };
  }
  function renderGraph() {
    var real = localToday(), range = graphRange(), byDate = {};
    S.history.forEach(function (h, i) { byDate[h.date] = i; });
    var cells = '', months = '', weeks = 0, n = { count: 0, hold: 0, reset: 0 }, yearAgo = addDays(real, -364);
    for (var d = range.from, dow = 0; d <= real; d = addDays(d, 1), dow = (dow + 1) % 7) {
      var p = parts(d);
      if (dow === 0) {
        weeks++;
        // Month label above the first week that contains the 1st of a month.
        if (p.day <= 7) months += '<span style="grid-column:' + weeks + '">' + p.mon + (p.mon === 'Jan' ? ' ' + p.year : '') + '</span>';
      }
      var idx = byDate[d], label = fmtLong(d), cls, act = '';
      if (idx != null) {
        var h = S.history[idx];
        if (d >= yearAgo) n[h.result]++;
        cls = h.result === 'count' ? 'g-count l' + countLevel(h) : 'g-' + h.result;
        label += ': ' + h.score + '/' + h.minScore + ', ' + CELL_WORDS[h.result];
        act = ' data-a="gDay" data-date="' + d + '"';
      } else if (d >= S.today) { cls = 'g-open'; label += ': open — tap to tick your tasks on Today'; act = ' data-a="gOpen"'; }
      else { cls = 'g-none'; label += ': no record — tap to add'; act = ' data-a="gDay" data-date="' + d + '"'; }
      if (d === real) cls += ' g-today';
      cells += '<button type="button" class="g ' + cls + '"' + act + ' aria-label="' + label + '"></button>';
    }
    return '<section class="card graph-card" aria-labelledby="graph-h"><div class="row-between" style="align-items:baseline">' +
      '<h2 id="graph-h" class="h3">' + plural(n.count, 'successful day', 'successful days') + ' in the last year</h2></div>' +
      '<div class="graph"><div class="g-days"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>' +
      '<div class="graph-scroll" data-graph-scroll>' +
      '<button type="button" class="g-older" data-a="gOlder">' + I.left + 'Older</button>' +
      '<div class="graph-body"><div class="g-months" style="grid-template-columns:repeat(' + weeks + ',var(--gc))">' + months + '</div>' +
      '<div class="g-grid" style="grid-template-columns:repeat(' + weeks + ',var(--gc))">' + cells + '</div></div></div></div>' +
      '<div class="g-legend"><span class="g-key">Less<i class="g g-count l1"></i><i class="g g-count l2"></i><i class="g g-count l3"></i><i class="g g-count l4"></i>More</span>' +
      '<span class="g-key"><i class="g g-hold"></i>No change · ' + n.hold + '<i class="g g-reset"></i>Relapsed · ' + n.reset + '<i class="g g-none"></i>No record</span></div>' +
      '<p class="muted small">Tap any day to see it and update it. Empty days can be added.</p></section>';
  }

  function renderToday() {
    var ev = evaluate(S.goals, S.doneToday, S.settings.minScore);
    var min = S.settings.minScore, ni = nextInfo(), next = ni.next, real = localToday();
    var nextPct = next ? Math.round((S.counter - ni.prevDays) / Math.max(1, next.daysRequired - ni.prevDays) * 100) : 100;
    var away = next ? next.daysRequired - S.counter : 0;
    var nextAway = next ? plural(away, 'day away', 'days away') : (S.rewards.length ? 'All reached' : 'Add rewards in Settings');
    var C = 238.76, pct = Math.min(1, ev.score / Math.max(1, min));
    var st = statusFor(ev);
    var doneCount = S.goals.filter(function (g) { return S.doneToday[g.id]; }).length;
    var future = S.today > real;
    var goals = S.goals.map(function (g) {
      var d = !!S.doneToday[g.id];
      return '<button type="button" class="goal' + (d ? ' done' : '') + '" data-a="toggle" data-id="' + attr(g.id) + '" aria-pressed="' + d + '">' +
        '<span class="box">' + (d ? I.check : '') + '</span><span class="txt"><span class="name">' + esc(g.name) + '</span>' +
        (g.nonNegotiable ? '<span class="tag">Non-negotiable</span>' : '') + '</span><span class="pts">+' + g.points + '</span></button>';
    }).join('');
    var todays = sortedByWhen(S.journal).filter(function (e) { return e.date === real; }).map(function (e) {
      return '<button type="button" class="jmini" data-a="openEntry" data-id="' + attr(e.id) + '"><span class="jmini-t">Saved at ' + esc(e.time) + '</span><span class="jmini-p">' + esc(preview(e.text)) + '</span></button>';
    }).join('');
    var dayLbl = S.today === real ? '' : S.today < real ? '<p class="hint">This is yesterday — it is still open. Close it to start today.</p>' : '';

    return '<div class="screen">' +
      '<section class="hero" aria-label="Progress"><div class="hero-top"><div class="col" style="gap:4px"><span class="hero-label">Successful days</span><span class="hero-count">' + S.counter + '</span></div>' +
      '<div class="hero-next"><span class="hero-label">Next reward</span><span class="hero-next-name">' + esc(next ? next.name : 'All reached') + '</span><span class="hero-next-away">' + esc(nextAway) + '</span></div></div>' +
      '<div class="bar"><div style="width:' + nextPct + '%"></div></div></section>' +
      '<section class="score ' + st.cls + '" aria-label="Today\'s score"><div class="ring"><svg width="84" height="84" viewBox="0 0 92 92" aria-hidden="true">' +
      '<circle cx="46" cy="46" r="38" fill="none" stroke="#FFFDF8" stroke-width="9"/>' +
      (pct > 0 ? '<circle class="prog" cx="46" cy="46" r="38" fill="none" stroke="' + (ev.score >= min ? '#1E6A50' : '#1D211C') + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (pct * C).toFixed(2) + ' ' + C + '" transform="rotate(-90 46 46)"/>' : '') +
      '</svg><div class="ring-txt"><span class="ring-num' + ((ev.score + '/' + min).length > 5 ? ' small' : '') + '">' + ev.score + '/' + min + '</span></div></div>' +
      '<div class="status"><b>' + esc(st.t) + '</b><span>' + esc(st.b) + '</span></div></section>' +
      dayLbl +
      '<div class="row-between" style="align-items:baseline;padding-top:4px"><h2 class="h2">Daily tasks</h2><span class="sub">' + doneCount + ' of ' + S.goals.length + ' done</span></div>' +
      '<div class="stack">' + (goals || '<div class="empty">No tasks yet. Add them in Settings.</div>') + '</div>' +
      '<button type="button" class="big-btn" data-a="askClose"' + (future || !S.goals.length ? ' disabled' : '') + '>Close ' + fmt(S.today) + '…</button>' +
      (future ? '<p class="hint">You can tick tasks ahead, but ' + fmt(S.today) + ' can only be closed once it begins.</p>' : '') +
      '<section class="card" aria-labelledby="diary-h"><div class="row-between"><h2 id="diary-h" class="h2">Journal</h2><button type="button" class="link" data-a="go" data-to="journal">All entries</button></div>' +
      '<label for="diary-today" class="lbl">Write about today</label>' +
      '<textarea id="diary-today" class="area" rows="5" placeholder="How did today go? What did you learn?" data-a="journalDraft">' + esc(ui.journalDraft) + '</textarea>' +
      '<button type="button" class="btn ok" data-a="saveDraft"' + (ui.journalDraft.trim() ? '' : ' disabled') + '>Save entry</button>' + todays + '</section>' +
      '</div>';
  }

  // ---------------------------------------------------------------- journal
  function renderJournal() {
    var cur = S.journal.find(function (e) { return e.id === ui.jId; });
    if (ui.jView === 'read' && cur) {
      return '<div class="screen"><button type="button" class="back-link" data-a="jBack">' + I.left + 'All entries</button>' +
        '<span class="kicker">' + esc(fmtLong(cur.date)) + ' · ' + esc(cur.time) + '</span>' +
        '<p class="jtext">' + esc(cur.text) + '</p>' +
        '<div class="two"><button type="button" class="btn outline" data-a="jEdit">Edit</button>' +
        '<button type="button" class="btn outline danger" data-a="jDelete">' + (ui.jConfirmDelete ? 'Tap again to delete' : 'Delete') + '</button></div></div>';
    }
    if (ui.jView === 'edit') {
      return '<div class="screen"><label for="j-edit" class="kicker">' + (cur ? 'Edit entry' : 'New entry · ' + fmt(localToday())) + '</label>' +
        '<textarea id="j-edit" class="area big" rows="14" placeholder="Write freely…" data-a="jText">' + esc(ui.jText) + '</textarea>' +
        '<div class="two"><button type="button" class="btn outline" data-a="jCancel">Cancel</button><button type="button" class="btn ok" data-a="jSave">Save</button></div></div>';
    }
    var list = sortedByWhen(S.journal).map(function (e) {
      return '<button type="button" class="jcard" data-a="openEntry" data-id="' + attr(e.id) + '"><span class="jcard-h"><span>' + esc(fmt(e.date)) + '</span><span>' + esc(e.time) + '</span></span>' +
        '<span class="jcard-p">' + esc(preview(e.text)) + '</span></button>';
    }).join('');
    return '<div class="screen"><button type="button" class="btn dark" data-a="jNew">' + I.plus + 'New entry</button>' +
      (list || '<p class="muted">No entries yet. Write your first one here or on the Today page.</p>') + '</div>';
  }

  // ---------------------------------------------------------------- urge
  function renderUrge() {
    var ud = ui.ud;
    if (ud.step === 2) {
      var tags = ud.triggers.concat(ud.moods);
      var byId = {}; S.actions.forEach(function (a) { byId[a.id] = a; });
      var sugg = ud.suggested.filter(function (id) { return byId[id]; }).map(function (id) {
        var a = byId[id], on = ud.did.indexOf(id) >= 0;
        var m = a.tags.filter(function (t) { return tags.indexOf(t) >= 0; });
        return '<button type="button" class="goal' + (on ? ' done' : '') + '" data-a="udDid" data-id="' + attr(id) + '" aria-pressed="' + on + '"><span class="box">' + (on ? I.check : '') + '</span>' +
          '<span class="txt"><span class="name">' + esc(a.name) + '</span><span class="why">' + esc(m.length ? 'Fits: ' + m.join(', ') : 'Works for most urges') + '</span></span></button>';
      }).join('');
      return '<div class="screen">' +
        '<div class="urge-hero"><span class="urge-k">Urge ' + ud.intensity + '/10 · ' + esc(tags.length ? tags.slice(0, 3).join(', ') : 'no trigger picked') + '</span>' +
        '<span class="urge-t">Do one of these now. The urge passes in 15–20 minutes.</span></div>' +
        '<div class="stack">' + (sugg || '<div class="empty">No actions in your library yet. Add some in Settings → NoFap.</div>') + '</div>' +
        '<section class="stack"><h2 class="q">How did it end?</h2><div class="two">' +
        '<button type="button" class="out pass' + (ud.outcome === 'passed' ? ' on' : '') + '" data-a="udOut" data-v="passed" aria-pressed="' + (ud.outcome === 'passed') + '">Urge passed</button>' +
        '<button type="button" class="out rel' + (ud.outcome === 'relapsed' ? ' on' : '') + '" data-a="udOut" data-v="relapsed" aria-pressed="' + (ud.outcome === 'relapsed') + '">I relapsed</button></div>' +
        '<span class="muted small">You can save now and update this later from the Urges log.</span></section>' +
        '<div class="two"><button type="button" class="btn outline" data-a="udBack">Back</button><button type="button" class="btn dark" data-a="udSave">Save</button></div></div>';
    }
    var nums = '';
    for (var i = 1; i <= 10; i++) nums += '<button type="button" class="num ' + chip(ud.intensity === i, true) + '" data-a="udInt" data-v="' + i + '" aria-pressed="' + (ud.intensity === i) + '">' + i + '</button>';
    function chips(list, key) {
      return list.map(function (t) { var on = ud[key].indexOf(t) >= 0; return '<button type="button" class="' + chip(on) + '" data-a="udTag" data-key="' + key + '" data-v="' + esc(t) + '" aria-pressed="' + on + '">' + esc(t) + '</button>'; }).join('');
    }
    return '<div class="screen urge">' +
      '<p class="lede">Stop for one minute. Answer three quick questions and you will get actions that fit this moment.</p>' +
      '<section class="stack"><h2 class="q">1. How strong is the urge?</h2><div class="nums">' + nums + '</div>' +
      '<div class="row-between muted small"><span>Light</span><span>Very strong</span></div></section>' +
      '<section class="stack"><h2 class="q">2. What triggered it?</h2><div class="chips">' + chips(TRIGGERS, 'triggers') + '</div></section>' +
      '<section class="stack"><h2 class="q">3. How do you feel right now?</h2><div class="chips">' + chips(MOODS, 'moods') + '</div></section>' +
      '<section class="stack"><label for="u-note" class="q">Anything to add? <span class="muted" style="font-weight:500">(optional)</span></label>' +
      '<textarea id="u-note" class="area" rows="3" placeholder="Where are you, what were you doing…" data-a="udNote">' + esc(ud.note) + '</textarea></section>' +
      '<button type="button" class="btn urge-btn" data-a="udSuggest"' + (ud.intensity ? '' : ' disabled') + '>Show me what to do</button></div>';
  }

  // ---------------------------------------------------------------- urges log
  function renderUrges() {
    var byId = {}; S.actions.forEach(function (a) { byId[a.id] = a; });
    var passed = S.urges.filter(function (u) { return u.outcome === 'passed'; }).length;
    var relapsed = S.urges.filter(function (u) { return u.outcome === 'relapsed'; }).length;
    var list = sortedByWhen(S.urges).map(function (u) {
      var open = ui.urgeOpen === u.id;
      var pill = u.outcome === 'passed' ? ['Passed', 'count'] : u.outcome === 'relapsed' ? ['Relapsed', 'reset'] : ['Open', 'hold'];
      var body = '';
      if (open) {
        var sugg = (u.suggestedActionIds || []).map(function (id) {
          var a = byId[id], on = (u.didActionIds || []).indexOf(id) >= 0;
          return '<button type="button" class="act' + (on ? ' on' : '') + '" data-a="uDid" data-id="' + attr(u.id) + '" data-act="' + attr(id) + '" aria-pressed="' + on + '">' +
            '<span class="box sm">' + (on ? I.checkSm : '') + '</span><span class="grow">' + esc(a ? a.name : 'Removed action') + '</span><span class="state">' + (on ? 'Did it' : 'Not done') + '</span></button>';
        }).join('');
        body = '<div class="u-body"><div class="u-ans"><span><strong>Triggers:</strong> ' + esc(u.triggers.join(', ') || '—') + '</span><span><strong>Feeling:</strong> ' + esc(u.moods.join(', ') || '—') + '</span></div>' +
          '<div class="stack" style="gap:6px"><span class="kicker sm">Recommended · tap what you did</span>' + (sugg || '<span class="muted small">No suggestions were saved.</span>') + '</div>' +
          '<div class="two"><button type="button" class="out pass sm' + (u.outcome === 'passed' ? ' on' : '') + '" data-a="uOut" data-id="' + attr(u.id) + '" data-v="passed">Urge passed</button>' +
          '<button type="button" class="out rel sm' + (u.outcome === 'relapsed' ? ' on' : '') + '" data-a="uOut" data-id="' + attr(u.id) + '" data-v="relapsed">Relapsed</button></div>' +
          '<label class="kicker sm stack" style="gap:6px">Note<textarea class="area note" rows="2" data-a="uNote" data-id="' + attr(u.id) + '">' + esc(u.note) + '</textarea></label>' +
          '<button type="button" class="del-link" data-a="uDelete" data-id="' + attr(u.id) + '">' + I.trashSm + (ui.urgeConfirmDelete === u.id ? 'Tap again to delete' : 'Delete') + '</button></div>';
      }
      return '<div class="fold' + (open ? ' open' : '') + '"><button type="button" class="u-head" data-a="uToggle" data-id="' + attr(u.id) + '" aria-expanded="' + open + '">' +
        '<span class="u-int"><b>' + u.intensity + '</b><small>/10</small></span><span class="u-mid"><span class="u-when">' + esc(fmt(u.date)) + ' · ' + esc(u.time) + '</span>' +
        '<span class="u-sum">' + esc(u.triggers.concat(u.moods).join(', ') || 'No trigger picked') + '</span></span><span class="res ' + pill[1] + '">' + pill[0] + '</span></button>' + body + '</div>';
    }).join('');
    return '<div class="screen"><div class="stats three"><div class="stat"><b>' + S.urges.length + '</b><span>urges logged</span></div>' +
      '<div class="stat count"><b>' + passed + '</b><span>passed</span></div><div class="stat reset"><b>' + relapsed + '</b><span>relapsed</span></div></div>' +
      (list || '<p class="muted">Nothing logged yet. When an urge hits, tap the orange “Urge hit” button.</p>') + '</div>';
  }

  // ---------------------------------------------------------------- days
  function renderDays() {
    var H = S.history, n = H.length;
    var cnt = function (r) { return H.filter(function (h) { return h.result === r; }).length; };
    var rows = '';
    var shown = Math.min(n, ui.histLimit);
    for (var k = 0; k < shown; k++) {
      var idx = n - 1 - k, h = H[idx], p = parts(h.date), open = ui.histOpen === idx, editing = open && ui.edit && ui.edit.idx === idx;
      var pill = pillOf(h), doneN = h.items.filter(function (it) { return it.done; }).length;
      var body = '';
      if (editing) {
        var items = h.items.map(function (it, i) { return Object.assign({}, it, { done: ui.edit.done[i] }); });
        var o = dayOutcome(items, ui.edit.min), rl = o.result === 'count' ? 'Counts' : o.result === 'reset' ? 'Relapse' : 'No change';
        body = '<div class="d-body"><ul class="items">' + items.map(function (it, i) {
          return '<li class="' + (it.done ? 'done' : 'missed') + (it.nonNegotiable ? ' must' : '') + ' editable" role="button" tabindex="0" aria-pressed="' + it.done + '" data-a="editItem" data-i="' + i + '">' +
            '<span class="ic">' + (it.done ? I.checkSm : I.xSm) + '</span><span class="nm">' + esc(it.goalName) + '</span>' + (it.nonNegotiable ? '<span class="mustlbl">Must</span>' : '') +
            '<span class="pt">' + (it.done ? '+' + it.points : '0') + '</span></li>';
        }).join('') + '</ul>' +
          '<div class="row-between"><div class="col"><span class="edit-lbl">Minimum for this day</span><span class="day-sub">Other days keep their own</span></div>' +
          '<div class="stepper"><button type="button" class="sq light" aria-label="Lower this day\'s minimum" data-a="editMinDec"' + (ui.edit.min <= 1 ? ' disabled' : '') + '>' + I.minus + '</button>' +
          '<span class="pts-val">' + ui.edit.min + '</span><button type="button" class="sq light" aria-label="Raise this day\'s minimum" data-a="editMinInc"' + (ui.edit.min >= Math.max(1, o.total) ? ' disabled' : '') + '>' + I.plus + '</button></div></div>' +
          '<div class="row-between edit-preview"><span class="day-score">' + o.score + '/' + ui.edit.min + '</span><span class="res ' + o.result + '">' + rl + '</span></div>' +
          '<div class="two"><button type="button" class="btn ghost" data-a="cancelEdit">Cancel</button><button type="button" class="btn dark" data-a="saveEdit">Save day</button></div></div>';
      } else if (open) {
        body = '<div class="d-body">' + (h.result === 'reset' ? '<div class="reason"><span class="kicker sm deep">Relapse reason</span><span class="reason-t">' + esc(h.relapseReason || 'No reason written yet.') + '</span>' +
          '<button type="button" class="btn-sm" data-a="relOpen" data-idx="' + idx + '">Read / edit</button></div>' : '') +
          '<ul class="items">' + itemRows(h.items) + '</ul>' +
          '<button type="button" class="pill-btn" data-a="editDay" data-idx="' + idx + '">' + I.pencil + 'Edit this day</button></div>';
      }
      rows += '<div class="fold' + (open ? ' open' : '') + '"><button type="button" class="day-head" data-a="dayToggle" data-idx="' + idx + '" aria-expanded="' + open + '">' +
        '<span class="day-date"><small>' + p.wd + '</small><b>' + p.day + '</b></span><span class="day-mid"><span class="day-score">' + h.score + '/' + h.minScore + '</span>' +
        '<span class="day-sub">' + p.mon + (p.year !== parts(localToday()).year ? ' ' + p.year : '') + ' · ' + doneN + ' of ' + h.items.length + ' tasks' + (h.edited ? '<span class="edited-tag">Edited</span>' : '') + '</span></span>' +
        '<span class="res ' + pill.c + '">' + pill.t + '</span>' + I.chev + '</button>' + body + '</div>';
    }
    return '<div class="screen">' + renderGraph() + '<div class="stats four"><div class="stat"><b>' + n + '</b><span>days</span></div><div class="stat count"><b>' + cnt('count') + '</b><span>counted</span></div>' +
      '<div class="stat hold"><b>' + cnt('hold') + '</b><span>no change</span></div><div class="stat reset"><b>' + cnt('reset') + '</b><span>relapsed</span></div></div>' +
      (rows || '<p class="muted">No days closed yet. Close your first day on the Today page.</p>') +
      (n > shown ? '<button type="button" class="dashed" data-a="histMore">Show 30 more days · ' + (n - shown) + ' left</button>' : '') + '</div>';
  }

  // ---------------------------------------------------------------- journey
  function renderJourney() {
    var rewards = sortedRewards(), first = runStartIndex();
    var runStart = first < S.history.length ? S.history[first].date
      : first > 0 && S.history[first - 1].result === 'reset' ? addDays(S.history[first - 1].date, 1)
      : first > 0 && S.counterResetOn ? S.counterResetOn : S.today;
    function reachedOn(days) {
      for (var i = first; i < S.history.length; i++) { var h = S.history[i]; if (h.result === 'count' && h.counterAfter === days) return h.date; }
      return null;
    }
    var list = [{ name: 'Start', daysRequired: 0, start: true }].concat(rewards), nextIdx = -1;
    for (var k = 0; k < list.length; k++) if (list[k].daysRequired > S.counter) { nextIdx = k; break; }
    var items = list.map(function (r, i) {
      var reached = r.daysRequired <= S.counter, isNext = i === nextIdx, after = list[i + 1], fill = 0;
      if (after) fill = Math.max(0, Math.min(100, (S.counter - r.daysRequired) / Math.max(1, after.daysRequired - r.daysRequired) * 100));
      var here = !!after && S.counter > r.daysRequired && S.counter < after.daysRequired, meta;
      if (r.start) meta = 'Run started ' + fmt(runStart);
      else if (reached) { var d = reachedOn(r.daysRequired); meta = d ? 'Unlocked ' + fmt(d) : 'Unlocked'; }
      else { var away = r.daysRequired - S.counter; meta = plural(away, 'day', 'days') + ' away · earliest ' + fmt(addDays(S.today, away - 1)); }
      var cls = reached ? 'reached' : isNext ? 'next' : '';
      return '<li><div class="rail"><span class="node ' + cls + '">' + (reached ? I.check : isNext ? '<span class="ndot"></span>' : '') + '</span>' +
        (after ? '<div class="seg"><div class="fill" style="height:' + fill.toFixed(1) + '%"></div>' + (here ? '<span class="here" aria-label="You are here" style="top:' + fill.toFixed(1) + '%"></span>' : '') + '</div>' : '') +
        '</div><div class="st-body"><div class="st-card ' + cls + '"><div class="row-between" style="align-items:baseline;gap:8px"><span class="st-name">' + esc(r.name) + '</span><span class="st-day">Day ' + r.daysRequired + '</span></div>' +
        '<span class="st-meta">' + esc(meta) + '</span></div></div></li>';
    }).join('');
    return '<div class="screen"><p class="lede">Current run: day ' + S.counter + '. Every day at or above the minimum moves you one stop. A relapse sends you back to the start.</p>' +
      '<ol class="route">' + items + '</ol>' + (rewards.length ? '' : '<div class="empty">No rewards yet. Add them in Settings.</div>') + '</div>';
  }

  // ---------------------------------------------------------------- settings
  function searchBox(key, label) {
    return '<div class="search"><span class="search-ic">' + I.search + '</span><input type="search" enterkeyhint="search" autocomplete="off" aria-label="' + label + '" placeholder="' + label + '" data-search="' + key + '" value="' + esc(ui.q[key]) + '">' +
      '<button type="button" class="search-x" aria-label="Clear search" data-a="clearSearch" data-key="' + key + '"' + (ui.q[key] ? '' : ' hidden') + '>' + I.xSm + '</button></div>';
  }
  function noMatch(key) { return '<div class="empty nomatch" data-nomatch="' + key + '" hidden>No match for “<span></span>”.</div>'; }
  function nfCountText(l) { var n = S.nofap[l.key].length; return (n ? plural(n, 'item', 'items') + ' · ' : '') + l.hint; }

  function renderSettings() {
    var total = totalPoints(S.goals), min = S.settings.minScore, allTags = TRIGGERS.concat(MOODS);
    var goals = S.goals.map(function (g) {
      return '<div class="edit-card" data-name="' + esc(g.name.toLowerCase()) + '"><div class="edit-row">' +
        '<input class="field" type="text" aria-label="Task name" maxlength="60" value="' + esc(g.name) + '" data-a="renameGoal" data-id="' + attr(g.id) + '">' +
        '<button type="button" class="icon-btn" aria-label="Remove task" data-a="removeGoal" data-id="' + attr(g.id) + '">' + I.trash + '</button></div>' +
        '<div class="row-between" style="gap:8px"><div class="stepper">' +
        '<button type="button" class="sq light" aria-label="Fewer points" data-a="ptsDec" data-id="' + attr(g.id) + '"' + (g.points <= 1 ? ' disabled' : '') + '>' + I.minus + '</button>' +
        '<span class="pts-val">' + g.points + ' pts</span><button type="button" class="sq light" aria-label="More points" data-a="ptsInc" data-id="' + attr(g.id) + '"' + (g.points >= 50 ? ' disabled' : '') + '>' + I.plus + '</button></div>' +
        '<button type="button" class="switch-btn" aria-pressed="' + g.nonNegotiable + '" data-a="toggleMust" data-id="' + attr(g.id) + '">Non-negotiable<span class="switch"><i></i></span></button></div></div>';
    }).join('');
    var rewards = S.rewards.map(function (r) {
      return '<div class="edit-card row" data-name="' + esc(r.name.toLowerCase()) + '">' +
        '<input class="field" type="text" aria-label="Reward name" maxlength="60" value="' + esc(r.name) + '" data-a="renameReward" data-id="' + attr(r.id) + '">' +
        '<label class="days-lbl"><input class="field num" type="number" inputmode="numeric" min="1" max="9999" aria-label="Days required" value="' + r.daysRequired + '" data-a="setDays" data-id="' + attr(r.id) + '">days</label>' +
        '<button type="button" class="icon-btn" aria-label="Remove reward" data-a="removeReward" data-id="' + attr(r.id) + '">' + I.trash + '</button></div>';
    }).join('');
    var actions = S.actions.map(function (a) {
      var open = ui.actionOpen === a.id;
      return '<div class="edit-card"><div class="edit-row">' +
        '<input class="field" type="text" aria-label="Action name" maxlength="80" value="' + esc(a.name) + '" data-a="renameAction" data-id="' + attr(a.id) + '">' +
        '<button type="button" class="tags-btn" data-a="actionTags" data-id="' + attr(a.id) + '" aria-expanded="' + open + '">Tags (' + a.tags.length + ')</button>' +
        '<button type="button" class="icon-btn" aria-label="Remove action" data-a="removeAction" data-id="' + attr(a.id) + '">' + I.trash + '</button></div>' +
        (open ? '<div class="chips sm">' + allTags.map(function (t) {
          var on = a.tags.indexOf(t) >= 0;
          return '<button type="button" class="' + chip(on) + '" data-a="actionTag" data-id="' + attr(a.id) + '" data-v="' + esc(t) + '" aria-pressed="' + on + '">' + esc(t) + '</button>';
        }).join('') + '</div>' : '<span class="muted small">' + esc(a.tags.length ? a.tags.join(' · ') : 'No tags — suggested only as a backup') + '</span>') + '</div>';
    }).join('');
    var lists = NOFAP_LISTS.map(function (l) {
      var rows = S.nofap[l.key].map(function (it, i) {
        return '<div class="nf-item"><span class="nf-num nf-' + l.key + '">' + (i + 1) + '</span>' +
          '<textarea class="field nf-text" rows="1" maxlength="500" aria-label="' + esc(l.title) + ' item ' + (i + 1) + '" placeholder="Write it here…" data-a="nfEdit" data-list="' + l.key + '" data-id="' + attr(it.id) + '">' + esc(it.text) + '</textarea>' +
          '<button type="button" class="icon-btn" aria-label="Delete item" data-a="nfRemove" data-list="' + l.key + '" data-id="' + attr(it.id) + '">' + I.trash + '</button></div>';
      }).join('');
      return '<div class="stack nf-sec" style="gap:8px"><div class="col"><span class="h4">' + l.title + '</span><span class="sub" data-nfcount="' + l.key + '">' + nfCountText(l) + '</span></div>' + rows +
        '<button type="button" class="dashed sm" data-a="nfAdd" data-list="' + l.key + '">' + I.plus + l.add + '</button></div>';
    }).join('');
    var nd = nofapDays();

    return '<div class="screen wide">' +
      '<section class="rules" aria-label="Daily minimum"><div class="row-between"><div class="col" style="gap:3px"><span class="rules-t">Minimum score</span><span class="rules-s">out of ' + total + ' possible points</span></div>' +
      '<div class="stepper"><button type="button" class="sq" aria-label="Lower minimum" data-a="minDec"' + (min <= 1 ? ' disabled' : '') + '>' + I.minus + '</button><span class="min-val">' + min + '</span>' +
      '<button type="button" class="sq" aria-label="Raise minimum" data-a="minInc"' + (min >= total ? ' disabled' : '') + '>' + I.plus + '</button></div></div>' +
      '<p class="min-note">Applies from ' + fmt(S.today) + ' on. Closed days keep the minimum they had — edit a single day from Days.</p>' +
      '<ul><li>Reach the minimum → +1 successful day.</li><li>Below the minimum → nothing changes.</li><li>Miss a non-negotiable → relapse, counter back to 0.</li></ul></section>' +

      '<section class="stack" style="gap:10px" aria-labelledby="set-goals"><div class="row-between"><div class="col"><h2 id="set-goals" class="h2">Daily tasks</h2><span class="sub">' + plural(S.goals.length, 'task', 'tasks') + ' · ' + total + ' pts</span></div>' +
      '<button type="button" class="pill-btn solid" data-a="addGoal">' + I.plus + 'Add task</button></div>' +
      (S.goals.length > 3 ? searchBox('goals', 'Search tasks') : '') + '<div class="stack" style="gap:10px" data-list="goals">' + goals + '</div>' + noMatch('goals') + '</section>' +

      '<section class="stack" style="gap:10px" aria-labelledby="set-rewards"><div class="row-between"><div class="col"><h2 id="set-rewards" class="h2">Rewards</h2><span class="sub">stations on your journey</span></div>' +
      '<button type="button" class="pill-btn solid" data-a="addReward">' + I.plus + 'Add reward</button></div>' +
      (S.rewards.length > 3 ? searchBox('rewards', 'Search rewards') : '') + '<div class="stack" style="gap:10px" data-list="rewards">' + rewards + '</div>' + noMatch('rewards') + '</section>' +

      '<section class="stack" style="gap:10px" aria-labelledby="set-nofap"><div class="col"><h2 id="set-nofap" class="h2">NoFap</h2><span class="sub">Clean for ' + plural(nd, 'day', 'days') + ' · resets when you log a relapse</span></div>' +
      '<label class="edit-card row since">Clean since<input class="field date" type="date" max="' + localToday() + '" value="' + S.nofapSince + '" data-a="nofapSince"></label>' +
      '<div class="row-between" style="padding-top:6px"><div class="col"><span class="h4">Actions for urges</span><span class="sub">Tags decide when each one is suggested</span></div>' +
      '<button type="button" class="pill-btn solid" data-a="addAction">' + I.plus + 'Add</button></div>' + actions + lists + '</section>' +

      '<section class="stack" style="gap:10px" aria-labelledby="set-sec"><h2 id="set-sec" class="h2">Security</h2>' +
      '<p class="lede">The app asks for your 6-digit code every time it starts. Once open, it stays open until you close the app or lock it.</p>' +
      '<button type="button" class="btn outline icon" data-a="lockNow">' + I.lock + 'Lock now</button>' +
      '<button type="button" class="btn ghost" data-a="changeCode">Change code</button></section>' +
      '<section class="stack danger-zone" style="gap:10px" aria-labelledby="set-danger"><h2 id="set-danger" class="h2">Danger zone</h2>' +
      '<p class="lede">Reset sets your successful days (' + S.counter + ') and NoFap clean days (' + nd + ') back to 0. Your closed days, journal and urges stay.</p>' +
      '<button type="button" class="btn outline danger" data-a="askResetCounters">Reset all counters…</button>' +
      '<button type="button" class="link small danger" data-a="askReset">Erase all data</button></section></div>';
  }

  // ---------------------------------------------------------------- chrome
  var TITLES = { today: 'Today', journal: 'Journal', urge: 'Urge hit', urges: 'Urges log', days: 'Days', journey: 'Journey', settings: 'Settings' };

  function appVersion() {
    try { if (window.StationsStore && window.StationsStore.version) return window.StationsStore.version(); } catch (e) { }
    return 'web preview';
  }

  function renderDrawer() {
    if (!ui.drawer) return '';
    var items = [['today', 'Today', I.nToday], ['journal', 'Journal', I.nJournal], ['urges', 'Urges log', I.nUrges], ['days', 'Days', I.nDays], ['journey', 'Journey', I.nJourney], ['settings', 'Settings', I.nSettings]];
    return '<div class="drawer-wrap"><button type="button" class="drawer-scrim" aria-label="Close menu" data-a="closeDrawer"></button><nav class="drawer" aria-label="Pages">' +
      '<div class="drawer-h"><span class="drawer-t">Improvement</span><span class="sub">' + plural(S.counter, 'successful day', 'successful days') + ' · clean for ' + plural(nofapDays(), 'day', 'days') + '</span></div>' +
      items.map(function (it) { return '<button type="button" class="nav-i" data-a="go" data-to="' + it[0] + '"' + (ui.screen === it[0] ? ' aria-current="page"' : '') + '>' + it[2] + it[1] + '</button>'; }).join('') +
      '<span class="grow"></span><button type="button" class="nav-i lock-i" data-a="lockNow">' + I.lock + 'Lock app</button>' +
      '<span class="app-ver">Version ' + esc(appVersion()) + '</span></nav></div>';
  }

  function renderModal() {
    var m = ui.modal;
    if (!m) return '';
    var inner = '';
    if (m.type === 'confirm') {
      var ev = evaluate(S.goals, S.doneToday, S.settings.minScore), st = statusFor(ev);
      inner = '<span class="k">Close day</span><h2 id="m-title">Close ' + fmt(S.today) + '?</h2>' +
        '<div class="confirm-box ' + st.cls + '"><span class="cb-score">' + ev.score + '/' + S.settings.minScore + '</span><span class="col"><b>' + esc(st.ct) + '</b><span>' + esc(st.cb) + '</span></span></div>' +
        '<p>You can’t change today’s tasks after closing (you can still edit the day later from Days).</p>' +
        '<div class="two"><button type="button" class="btn outline" data-a="closeModal">Cancel</button><button type="button" class="btn dark" data-a="closeDay">Yes, close day</button></div>';
    } else if (m.type === 'relapse') {
      var h = S.history[m.idx];
      if (!h) { ui.modal = null; return ''; }
      var missed = h.items.filter(function (it) { return it.nonNegotiable && !it.done; }).map(function (it) { return it.goalName; }).join(', ') || '—';
      inner = '<span class="k deep">' + esc(fmtLong(h.date)) + '</span><h2 id="m-title">Relapsed</h2>' +
        '<p>' + (m.isNew ? 'You missed a non-negotiable, so the counter is back to 0. Write down what happened — it helps you see the pattern.' : 'This is what you wrote for this day. You can change it or delete it.') + '</p>' +
        '<span class="missed">Missed: ' + esc(missed) + '</span><label for="rel-reason" class="lbl strong">Relapse reason</label>' +
        '<textarea id="rel-reason" class="area" rows="4" placeholder="What happened? What will you do differently?" data-a="relDraft">' + esc(m.draft) + '</textarea>' +
        '<button type="button" class="btn dark" data-a="relSave">Save reason</button><div class="row-between">' +
        (h.relapseReason ? '<button type="button" class="link danger" data-a="relDelete">Delete reason</button>' : '<span></span>') +
        '<button type="button" class="link" data-a="closeModal">' + (m.isNew ? 'Skip for now' : 'Close') + '</button></div>';
    } else if (m.type === 'day') {
      var d = S.history[m.idx];
      if (!d) { ui.modal = null; return ''; }
      var pl = pillOf(d);
      inner = '<span class="k">' + esc(fmtLong(d.date)) + '</span><div class="row-between"><h2 id="m-title" class="big-score">' + d.score + '/' + d.minScore + '</h2><span class="res ' + pl.c + '">' + pl.t + '</span></div>' +
        '<ul class="items">' + itemRows(d.items) + '</ul><div class="two"><button type="button" class="btn outline" data-a="dayEditFromModal" data-idx="' + m.idx + '">Edit this day</button><button type="button" class="btn dark" data-a="closeModal">Close</button></div>';
    } else if (m.type === 'dayEdit') {
      var items = m.items.map(function (it, i) { return Object.assign({}, it, { done: m.done[i] }); });
      var o = dayOutcome(items, m.min), rl = o.result === 'count' ? 'Counts' : o.result === 'reset' ? 'Relapse' : 'No change';
      inner = '<span class="k">' + esc(fmtLong(m.date)) + (m.isNew ? ' · no record yet' : '') + '</span>' +
        '<div class="row-between"><h2 id="m-title" class="big-score">' + o.score + '/' + m.min + '</h2><span class="res ' + o.result + '">' + rl + '</span></div>' +
        (m.isNew ? '<p>Tick what you did that day and save to add it. Your counter is recalculated.</p>' : '') +
        (items.length ? '<ul class="items">' + items.map(function (it, i) {
          return '<li class="' + (it.done ? 'done' : 'missed') + (it.nonNegotiable ? ' must' : '') + ' editable" role="button" tabindex="0" aria-pressed="' + it.done + '" data-a="mdItem" data-i="' + i + '">' +
            '<span class="ic">' + (it.done ? I.checkSm : I.xSm) + '</span><span class="nm">' + esc(it.goalName) + '</span>' + (it.nonNegotiable ? '<span class="mustlbl">Must</span>' : '') +
            '<span class="pt">' + (it.done ? '+' + it.points : '0') + '</span></li>';
        }).join('') + '</ul>' : '<p>No tasks were set for this day.</p>') +
        '<div class="row-between"><div class="col"><span class="edit-lbl">Minimum for this day</span><span class="day-sub">Other days keep their own</span></div>' +
        '<div class="stepper"><button type="button" class="sq light" aria-label="Lower this day\'s minimum" data-a="mdMin" data-v="-1"' + (m.min <= 1 ? ' disabled' : '') + '>' + I.minus + '</button>' +
        '<span class="pts-val">' + m.min + '</span><button type="button" class="sq light" aria-label="Raise this day\'s minimum" data-a="mdMin" data-v="1"' + (m.min >= Math.max(1, o.total) ? ' disabled' : '') + '>' + I.plus + '</button></div></div>' +
        (o.result === 'reset' ? '<label for="md-reason" class="lbl strong">Relapse reason</label><textarea id="md-reason" class="area" rows="3" placeholder="What happened?" data-a="mdReason">' + esc(m.reason) + '</textarea>' : '') +
        '<div class="two"><button type="button" class="btn ghost" data-a="closeModal">Cancel</button><button type="button" class="btn dark" data-a="mdSave">' + (m.isNew ? 'Add day' : 'Save day') + '</button></div>';
    } else if (m.type === 'typed') {
      inner = '<span class="k" style="color:#8F3A0C">' + esc(m.kicker) + '</span><h2 id="m-title">' + esc(m.title) + '</h2><p>' + esc(m.body) + '</p>' +
        '<ul class="impact">' + m.impact.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<label for="typed-confirm" class="lbl strong">Type <b class="word">' + m.word + '</b> to confirm</label>' +
        '<input id="typed-confirm" class="field" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" data-a="typedConfirm" value="">' +
        '<div class="two"><button type="button" class="btn ghost" data-a="closeModal">Cancel</button><button type="button" class="btn danger-fill" data-a="typedYes" disabled>' + esc(m.ok) + '</button></div>';
    } else if (m.type === 'ask') {
      inner = '<span class="k" style="color:' + m.color + '">' + esc(m.kicker) + '</span><h2 id="m-title">' + esc(m.title) + '</h2><p>' + esc(m.body) + '</p>' +
        '<div class="two"><button type="button" class="btn ghost" data-a="closeModal">Cancel</button><button type="button" class="btn danger-fill" data-a="askYes">' + esc(m.ok) + '</button></div>';
    } else {
      inner = '<span class="k" style="color:' + m.color + '">' + esc(m.kicker) + '</span><h2 id="m-title">' + esc(m.title) + '</h2><p>' + esc(m.body) + '</p>' +
        '<button type="button" class="btn dark" data-a="closeModal">' + esc(m.ok) + '</button>';
    }
    return '<div class="scrim" data-a="scrim"><div class="sheet' + (m.reward ? ' reward' : '') + '" role="dialog" aria-modal="true" aria-labelledby="m-title">' + inner + '</div></div>';
  }

  var root = document.getElementById('app');
  var lastScreen = null, lastLocked = null;

  function render() {
    purgeBlankNofap();
    var main = document.getElementById('main');
    var keep = main && lastScreen === ui.screen + ui.jView && !lastLocked ? main.scrollTop : 0;
    var gs = document.querySelector('[data-graph-scroll]');
    if (gs && ui.graphScroll !== 0) ui.graphScroll = gs.scrollLeft;
    if (ui.locked) {
      root.innerHTML = renderLock();
    } else {
      var body = ui.screen === 'journal' ? renderJournal() : ui.screen === 'urge' ? renderUrge() : ui.screen === 'urges' ? renderUrges()
        : ui.screen === 'days' ? renderDays() : ui.screen === 'journey' ? renderJourney() : ui.screen === 'settings' ? renderSettings() : renderToday();
      root.innerHTML = '<header class="top"><button type="button" class="menu-btn" aria-label="Open menu" data-a="openDrawer">' + I.menu + '</button>' +
        '<span class="top-t">' + TITLES[ui.screen] + '</span><span class="top-d">' + fmt(localToday()) + '</span></header>' +
        '<main id="main">' + body + '</main>' +
        (ui.screen !== 'urge' ? '<button type="button" class="fab" data-a="startUrge">' + I.flame + 'Urge hit</button>' : '') +
        renderDrawer() + '<div id="overlay">' + renderModal() + '</div>';
      main = document.getElementById('main');
      applyFilters();
      var tas = main.querySelectorAll('textarea.nf-text');
      for (var t = 0; t < tas.length; t++) autosize(tas[t]);
      main.scrollTop = keep;
      gs = document.querySelector('[data-graph-scroll]');
      if (gs) gs.scrollLeft = ui.graphScroll == null ? gs.scrollWidth : ui.graphScroll;
      if (ui.graphScroll === 0) ui.graphScroll = undefined; // "Older" jumps left once, then keeps position
    }
    lastScreen = ui.screen + ui.jView;
    lastLocked = ui.locked;
  }

  function commit() { clampMin(); purgeBlankNofap(); save(); render(); }

  function applyFilters() {
    var main = document.getElementById('main');
    if (!main) return;
    Object.keys(ui.q).forEach(function (key) {
      var list = main.querySelector('[data-list="' + key + '"]');
      if (!list) return;
      var q = ui.q[key].trim().toLowerCase(), shown = 0, rows = list.querySelectorAll('[data-name]');
      for (var i = 0; i < rows.length; i++) { var hit = !q || rows[i].getAttribute('data-name').indexOf(q) >= 0; rows[i].hidden = !hit; if (hit) shown++; }
      var nm = main.querySelector('[data-nomatch="' + key + '"]');
      if (nm) { nm.hidden = !(q && rows.length && !shown); nm.querySelector('span').textContent = ui.q[key].trim(); }
      var x = main.querySelector('.search-x[data-key="' + key + '"]');
      if (x) x.hidden = !ui.q[key];
    });
  }

  function purgeBlankNofap() {
    NOFAP_LISTS.forEach(function (l) { S.nofap[l.key] = S.nofap[l.key].filter(function (x) { return x.text.trim() || x.id === ui.nfNew; }); });
  }
  function autosize(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }

  // ---------------------------------------------------------------- actions
  function findGoal(id) { return S.goals.find(function (g) { return g.id === id; }); }
  function findReward(id) { return S.rewards.find(function (r) { return r.id === id; }); }
  function findAction(id) { return S.actions.find(function (a) { return a.id === id; }); }
  function findUrge(id) { return S.urges.find(function (u) { return u.id === id; }); }
  function nfFind(list, id) { return S.nofap[list].find(function (x) { return x.id === id; }); }
  function go(screen) {
    ui.screen = screen; ui.drawer = false; ui.edit = null; ui.nfNew = null;
    if (screen === 'journal') { ui.jView = 'list'; ui.jConfirmDelete = false; }
    render();
  }
  function focusField(sel) {
    var el = document.querySelector(sel);
    if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); if (el.select) el.select(); }
  }
  function openDayIdx(idx) {
    var h = S.history[idx];
    if (!h) return;
    ui.modal = h.result === 'reset' ? { type: 'relapse', idx: idx, draft: h.relapseReason || '', isNew: false } : { type: 'day', idx: idx };
    render();
  }
  function setNofapRelapse(date) { if (!S.nofapSince || date > S.nofapSince) S.nofapSince = date; }

  function doCloseDay() {
    if (S.today > localToday()) return;
    var ev = closeOpenDay(), counter = S.counter, idx = S.history.length - 1, min = S.history[idx].minScore;
    ui.histOpen = null; ui.edit = null;
    if (ev.result === 'reset') {
      ui.modal = { type: 'relapse', idx: idx, draft: '', isNew: true };
      return commit();
    }
    var rewards = sortedRewards();
    var hit = ev.result === 'count' ? rewards.filter(function (r) { return r.daysRequired === counter; }) : [];
    var next = rewards.find(function (r) { return r.daysRequired > counter; });
    var nextLine = next ? (next.daysRequired - counter) + ' to go until ' + next.name + '.' : rewards.length ? 'Every reward on your journey is reached.' : '';
    var m;
    if (hit.length) m = { kicker: 'Reward unlocked · day ' + counter, title: hit.map(function (r) { return r.name; }).join(' + '), reward: true, body: 'You reached your minimum ' + counter + ' times in this run. Go enjoy it. ' + nextLine, color: '#B34A12' };
    else if (ev.result === 'count') m = { kicker: 'Day counted · ' + ev.score + '/' + min, title: plural(counter, 'successful day', 'successful days'), body: nextLine, color: '#1E6A50' };
    else m = { kicker: 'No change · ' + ev.score + '/' + min, title: 'Still at ' + plural(counter, 'day', 'days'), body: 'Under the minimum, but you kept every non-negotiable, so nothing is lost.', color: '#3F433C' };
    m.type = 'info'; m.ok = 'Start ' + fmt(S.today);
    ui.modal = m;
    commit();
  }

  function startEdit(idx) {
    var h = S.history[idx];
    if (!h) return;
    ui.edit = { idx: idx, done: h.items.map(function (it) { return !!it.done; }), min: h.minScore };
    ui.histOpen = idx;
    var pos = S.history.length - 1 - idx;
    if (pos >= ui.histLimit) ui.histLimit = Math.ceil((pos + 1) / PAGE) * PAGE;
  }

  var A = {
    // lock
    pinKey: function (el) { pinKey(el.getAttribute('data-k')); },
    pinCancel: function () { ui.pin = ''; ui.pinErr = false; ui.pinMode = 'unlock'; ui.pinFirst = ''; ui.locked = false; setBars(); render(); },
    lockNow: lockNow,
    changeCode: function () { ui.locked = true; ui.pin = ''; ui.pinErr = false; ui.pinMode = 'new'; ui.pinFirst = ''; setBars(); render(); },
    // chrome
    openDrawer: function () { ui.drawer = true; render(); },
    closeDrawer: function () { ui.drawer = false; render(); },
    go: function (el) { go(el.getAttribute('data-to')); },
    startUrge: function () { ui.ud = freshUrge(); go('urge'); },
    closeModal: function () {
      var m = ui.modal;
      ui.modal = null;
      if (m && m.ok && m.ok.indexOf('Start ') === 0) ui.screen = 'today';
      render();
    },
    scrim: function (el, ev) { if (ev.target === el && ui.modal && ui.modal.type !== 'relapse') A.closeModal(); },
    askYes: function () { var m = ui.modal; ui.modal = null; if (m && m.run) m.run(); commit(); },
    // today
    toggle: function (el) { var id = el.getAttribute('data-id'); if (S.doneToday[id]) delete S.doneToday[id]; else S.doneToday[id] = true; commit(); },
    askClose: function () { if (S.today <= localToday()) { ui.modal = { type: 'confirm' }; render(); } },
    closeDay: doCloseDay,
    gDay: function (el) {
      var date = el.getAttribute('data-date'), idx = -1;
      S.history.forEach(function (h, i) { if (h.date === date) idx = i; });
      if (idx >= 0) {
        var h = S.history[idx];
        ui.modal = { type: 'dayEdit', date: date, idx: idx, isNew: false, items: h.items, done: h.items.map(function (it) { return !!it.done; }), min: h.minScore, reason: h.relapseReason || '' };
      } else {
        var items = S.goals.map(function (g) { return { goalName: g.name, points: g.points, nonNegotiable: g.nonNegotiable, done: false }; });
        ui.modal = { type: 'dayEdit', date: date, idx: -1, isNew: true, items: items, done: items.map(function () { return false; }), min: S.settings.minScore, reason: '' };
      }
      render();
    },
    gOpen: function () { go('today'); var t = document.querySelector('.goal'); if (t) t.scrollIntoView({ block: 'center' }); },
    gOlder: function () { ui.graphYears++; ui.graphScroll = 0; render(); },
    mdItem: function (el) { var i = Number(el.getAttribute('data-i')); ui.modal.done[i] = !ui.modal.done[i]; render(); },
    mdMin: function (el) {
      var m = ui.modal, t = m.items.reduce(function (a, it) { return a + it.points; }, 0);
      m.min = Math.max(1, Math.min(Math.max(1, t), m.min + Number(el.getAttribute('data-v')))); render();
    },
    mdSave: function () {
      var m = ui.modal, before = S.counter, h;
      if (m.isNew) {
        h = { date: m.date, items: m.items.map(function (it, i) { return Object.assign({}, it, { done: m.done[i] }); }), score: 0, minScore: m.min, total: 0, result: 'hold', counterAfter: 0, relapseReason: '', added: true };
        S.history.push(h);
        S.history.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
        // Keep a manual counter reset pointing at the same day after inserting earlier days.
        if (S.counterResetAt != null && S.history.indexOf(h) < S.counterResetAt) S.counterResetAt++;
      } else {
        h = S.history[m.idx];
        h.items.forEach(function (it, i) { it.done = m.done[i]; });
        h.minScore = m.min; h.edited = true;
      }
      replayHistory();
      h.relapseReason = h.result === 'reset' ? (m.reason || '').trim() : h.relapseReason;
      ui.histOpen = null; ui.edit = null;
      var name = { count: 'counted', hold: 'no change', reset: 'relapse' };
      ui.modal = { type: 'info', kicker: (m.isNew ? 'Day added · ' : 'Day updated · ') + fmt(h.date), color: '#1E6A50', ok: 'Done',
        title: before === S.counter ? 'Still at ' + plural(S.counter, 'day', 'days') : plural(before, 'day', 'days') + ' → ' + S.counter,
        body: 'This day is ' + h.score + '/' + h.minScore + ' (' + name[h.result] + '). Every later day was recounted with its own minimum.' };
      commit();
    },
    saveDraft: function () {
      var t = ui.journalDraft.trim();
      if (!t) return;
      S.journal.push({ id: uid('j'), date: localToday(), time: nowTime(), text: t });
      ui.journalDraft = '';
      commit();
    },
    // relapse modal
    relOpen: function (el) { openDayIdx(Number(el.getAttribute('data-idx'))); },
    relSave: function () { var m = ui.modal, h = S.history[m.idx]; if (h) h.relapseReason = (m.draft || '').trim(); ui.modal = null; commit(); },
    relDelete: function () { var m = ui.modal, h = S.history[m.idx]; if (h) h.relapseReason = ''; ui.modal = null; commit(); },
    dayEditFromModal: function (el) { var idx = Number(el.getAttribute('data-idx')); ui.modal = null; ui.screen = 'days'; startEdit(idx); render(); },
    // journal
    openEntry: function (el) { ui.jId = el.getAttribute('data-id'); ui.jView = 'read'; ui.jConfirmDelete = false; ui.screen = 'journal'; ui.drawer = false; render(); },
    jNew: function () { ui.jId = null; ui.jText = ''; ui.jView = 'edit'; render(); focusField('#j-edit'); },
    jBack: function () { ui.jView = 'list'; ui.jConfirmDelete = false; render(); },
    jEdit: function () { var e = S.journal.find(function (x) { return x.id === ui.jId; }); ui.jText = e ? e.text : ''; ui.jView = 'edit'; render(); },
    jCancel: function () { ui.jView = ui.jId ? 'read' : 'list'; render(); },
    jSave: function () {
      var t = ui.jText.trim();
      if (!t) { ui.jView = ui.jId ? 'read' : 'list'; return render(); }
      var e = S.journal.find(function (x) { return x.id === ui.jId; });
      if (e) e.text = t;
      else { e = { id: uid('j'), date: localToday(), time: nowTime(), text: t }; S.journal.push(e); ui.jId = e.id; }
      ui.jView = 'read'; commit();
    },
    jDelete: function () {
      if (!ui.jConfirmDelete) { ui.jConfirmDelete = true; return render(); }
      S.journal = S.journal.filter(function (x) { return x.id !== ui.jId; });
      ui.jId = null; ui.jView = 'list'; ui.jConfirmDelete = false; commit();
    },
    // urge flow
    udInt: function (el) { ui.ud.intensity = Number(el.getAttribute('data-v')); render(); },
    udTag: function (el) { var k = el.getAttribute('data-key'); ui.ud[k] = toggleIn(ui.ud[k], el.getAttribute('data-v')); render(); },
    udSuggest: function () { if (!ui.ud.intensity) return; ui.ud.suggested = suggest(ui.ud.triggers.concat(ui.ud.moods), ui.ud.intensity); ui.ud.step = 2; document.getElementById('main').scrollTop = 0; render(); },
    udDid: function (el) { ui.ud.did = toggleIn(ui.ud.did, el.getAttribute('data-id')); render(); },
    udOut: function (el) { var v = el.getAttribute('data-v'); ui.ud.outcome = ui.ud.outcome === v ? '' : v; render(); },
    udBack: function () { ui.ud.step = 1; render(); },
    udSave: function () {
      var u = ui.ud, rec = { id: uid('u'), date: localToday(), time: nowTime(), intensity: u.intensity, triggers: u.triggers, moods: u.moods, note: u.note.trim(),
        suggestedActionIds: u.suggested, didActionIds: u.did, outcome: u.outcome };
      S.urges.push(rec);
      if (rec.outcome === 'relapsed') setNofapRelapse(rec.date);
      ui.ud = freshUrge(); ui.urgeOpen = rec.id; ui.urgeConfirmDelete = null;
      ui.screen = 'urges';
      commit();
    },
    // urges log
    uToggle: function (el) { var id = el.getAttribute('data-id'); ui.urgeOpen = ui.urgeOpen === id ? null : id; ui.urgeConfirmDelete = null; render(); },
    uDid: function (el) { var u = findUrge(el.getAttribute('data-id')); if (u) { u.didActionIds = toggleIn(u.didActionIds || [], el.getAttribute('data-act')); commit(); } },
    uOut: function (el) {
      var u = findUrge(el.getAttribute('data-id')), v = el.getAttribute('data-v');
      if (!u) return;
      u.outcome = u.outcome === v ? '' : v;
      if (u.outcome === 'relapsed') setNofapRelapse(u.date);
      commit();
    },
    uDelete: function (el) {
      var id = el.getAttribute('data-id');
      if (ui.urgeConfirmDelete !== id) { ui.urgeConfirmDelete = id; return render(); }
      S.urges = S.urges.filter(function (u) { return u.id !== id; }); ui.urgeOpen = null; ui.urgeConfirmDelete = null; commit();
    },
    // days
    dayToggle: function (el) {
      var i = Number(el.getAttribute('data-idx'));
      if (ui.edit && ui.edit.idx !== i) ui.edit = null;
      ui.histOpen = ui.histOpen === i ? null : i;
      if (ui.histOpen === null) ui.edit = null;
      render();
    },
    histMore: function () { ui.histLimit += PAGE; render(); },
    editDay: function (el) { startEdit(Number(el.getAttribute('data-idx'))); render(); },
    editItem: function (el) { var i = Number(el.getAttribute('data-i')); ui.edit.done[i] = !ui.edit.done[i]; render(); },
    editMinDec: function () { ui.edit.min = Math.max(1, ui.edit.min - 1); render(); },
    editMinInc: function () { var t = S.history[ui.edit.idx].items.reduce(function (a, it) { return a + it.points; }, 0); ui.edit.min = Math.min(Math.max(1, t), ui.edit.min + 1); render(); },
    cancelEdit: function () { ui.edit = null; render(); },
    saveEdit: function () {
      var e = ui.edit, h = S.history[e.idx];
      if (!h) { ui.edit = null; return render(); }
      var before = S.counter, beforeResult = h.result;
      h.items.forEach(function (it, i) { it.done = e.done[i]; });
      h.minScore = e.min; h.edited = true;
      replayHistory();
      ui.edit = null;
      var name = { count: 'counted', hold: 'no change', reset: 'relapse' };
      ui.modal = { type: 'info', kicker: 'Day updated · ' + fmt(h.date), color: '#1E6A50', ok: 'Done',
        title: before === S.counter ? 'Still at ' + plural(S.counter, 'day', 'days') : plural(before, 'day', 'days') + ' → ' + S.counter,
        body: 'This day is now ' + h.score + '/' + h.minScore + ' (' + name[h.result] + (beforeResult !== h.result ? ', was ' + name[beforeResult] : '') + '). Every later day was recounted with its own minimum.' };
      commit();
    },
    // settings
    minDec: function () { S.settings.minScore = Math.max(1, S.settings.minScore - 1); commit(); },
    minInc: function () { S.settings.minScore = Math.min(totalPoints(S.goals), S.settings.minScore + 1); commit(); },
    addGoal: function () { var g = { id: uid('g'), name: 'New task', points: 2, nonNegotiable: false }; S.goals.unshift(g); ui.q.goals = ''; commit(); focusField('input[data-id="' + g.id + '"]'); },
    ptsDec: function (el) { var g = findGoal(el.getAttribute('data-id')); if (g) { g.points = Math.max(1, g.points - 1); commit(); } },
    ptsInc: function (el) { var g = findGoal(el.getAttribute('data-id')); if (g) { g.points = Math.min(50, g.points + 1); commit(); } },
    toggleMust: function (el) { var g = findGoal(el.getAttribute('data-id')); if (g) { g.nonNegotiable = !g.nonNegotiable; commit(); } },
    removeGoal: function (el) {
      var g = findGoal(el.getAttribute('data-id'));
      if (!g) return;
      ui.modal = { type: 'ask', kicker: 'Delete task', title: g.name, color: '#7A2F08', ok: 'Delete', body: 'It disappears from today and from future days. Closed days keep it.',
        run: function () { S.goals = S.goals.filter(function (x) { return x.id !== g.id; }); delete S.doneToday[g.id]; } };
      render();
    },
    addReward: function () {
      var maxDays = S.rewards.reduce(function (m, r) { return Math.max(m, r.daysRequired); }, 0);
      var r = { id: uid('r'), name: 'New reward', daysRequired: Math.min(9999, maxDays + 10) };
      S.rewards.unshift(r); ui.q.rewards = ''; commit(); focusField('input[data-a="renameReward"][data-id="' + r.id + '"]');
    },
    removeReward: function (el) {
      var r = findReward(el.getAttribute('data-id'));
      if (!r) return;
      ui.modal = { type: 'ask', kicker: 'Delete reward', title: r.name, color: '#7A2F08', ok: 'Delete', body: 'This reward is removed from your journey.',
        run: function () { S.rewards = S.rewards.filter(function (x) { return x.id !== r.id; }); } };
      render();
    },
    addAction: function () { var a = { id: uid('a'), name: 'New action', tags: [] }; S.actions.unshift(a); ui.actionOpen = a.id; commit(); focusField('input[data-a="renameAction"][data-id="' + a.id + '"]'); },
    actionTags: function (el) { var id = el.getAttribute('data-id'); ui.actionOpen = ui.actionOpen === id ? null : id; render(); },
    actionTag: function (el) { var a = findAction(el.getAttribute('data-id')); if (a) { a.tags = toggleIn(a.tags, el.getAttribute('data-v')); commit(); } },
    removeAction: function (el) {
      var a = findAction(el.getAttribute('data-id'));
      if (!a) return;
      ui.modal = { type: 'ask', kicker: 'Delete action', title: a.name, color: '#7A2F08', ok: 'Delete', body: 'It will no longer be suggested when an urge hits. Past urges keep their history.',
        run: function () { S.actions = S.actions.filter(function (x) { return x.id !== a.id; }); } };
      render();
    },
    nfAdd: function (el) {
      var list = el.getAttribute('data-list'), item = { id: uid('n'), text: '' };
      ui.nfNew = item.id; S.nofap[list].push(item); commit(); focusField('textarea[data-id="' + item.id + '"]');
    },
    nfRemove: function (el) {
      var list = el.getAttribute('data-list'), it = nfFind(list, el.getAttribute('data-id'));
      if (!it) return;
      var drop = function () { S.nofap[list] = S.nofap[list].filter(function (x) { return x.id !== it.id; }); };
      if (!it.text.trim()) { drop(); return commit(); }
      ui.nfNew = null;
      ui.modal = { type: 'ask', kicker: 'Delete item', title: it.text.length > 60 ? it.text.slice(0, 57) + '…' : it.text, color: '#7A2F08', ok: 'Delete',
        body: 'It will be removed from ' + NOFAP_LISTS.filter(function (l) { return l.key === list; })[0].title.toLowerCase() + '.', run: drop };
      render();
    },
    clearSearch: function (el) {
      var key = el.getAttribute('data-key'), input = document.querySelector('[data-search="' + key + '"]');
      ui.q[key] = ''; if (input) input.value = ''; applyFilters();
    },
    askResetCounters: function () {
      ui.modal = { type: 'typed', kicker: 'Dangerous action', title: 'Reset all counters?', word: 'RESET', ok: 'Reset counters',
        body: 'This starts everything from zero and cannot be undone.',
        impact: ['Successful days: ' + S.counter + ' → 0 (your reward journey starts again)', 'NoFap clean for ' + plural(nofapDays(), 'day', 'days') + ' → 0 (clean since today)', 'Closed days, journal, urges and settings are kept'],
        run: function () {
          resetCounters();
          ui.modal = { type: 'info', kicker: 'Done', title: 'Counters reset', body: 'Successful days and NoFap clean days are back to 0. Your new run starts today.', ok: 'OK', color: '#1E6A50' };
        } };
      render();
      focusField('#typed-confirm');
    },
    typedYes: function () {
      var input = document.getElementById('typed-confirm'), m = ui.modal;
      if (!m || !input || input.value.trim().toUpperCase() !== m.word) return;
      ui.modal = null;
      m.run();
      commit();
    },
    askReset: function () {
      ui.modal = { type: 'typed', kicker: 'Dangerous action', title: 'Erase all data?', word: 'ERASE', ok: 'Erase everything',
        body: 'Everything is deleted from this phone and cannot be undone.',
        impact: ['Tasks, rewards and the minimum go back to the defaults', 'All closed days, journal entries and urges are deleted', 'NoFap settings and lists are deleted', 'Your lock code stays'],
        run: function () { var sec = S.security; S = defaultState(); S.security = sec; ui.histOpen = null; ui.edit = null; ui.screen = 'today'; } };
      render();
      focusField('#typed-confirm');
    }
  };

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-a]');
    if (!el || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
    var fn = A[el.getAttribute('data-a')];
    if (fn) fn(el, ev);
  });

  // Text fields update state without re-rendering, so focus and the tap that
  // follows are never lost; everything else re-reads state when it renders.
  document.addEventListener('input', function (ev) {
    var el = ev.target, a = el.getAttribute('data-a'), id = el.getAttribute('data-id');
    var sk = el.getAttribute('data-search');
    if (sk) { ui.q[sk] = el.value; applyFilters(); return; }
    if (a === 'renameGoal' || a === 'renameReward') { var card = el.closest('[data-name]'); if (card) card.setAttribute('data-name', el.value.toLowerCase()); }
    if (a === 'renameGoal') { var g = findGoal(id); if (g) { g.name = el.value; save(); } }
    else if (a === 'renameReward') { var r = findReward(id); if (r) { r.name = el.value; save(); } }
    else if (a === 'renameAction') { var ac = findAction(id); if (ac) { ac.name = el.value; save(); } }
    else if (a === 'nfEdit') { var n = nfFind(el.getAttribute('data-list'), id); if (n) { n.text = el.value; save(); } autosize(el); }
    else if (a === 'journalDraft') { ui.journalDraft = el.value; var b = document.querySelector('[data-a="saveDraft"]'); if (b) b.disabled = !el.value.trim(); }
    else if (a === 'jText') ui.jText = el.value;
    else if (a === 'udNote') ui.ud.note = el.value;
    else if (a === 'relDraft') { if (ui.modal) ui.modal.draft = el.value; }
    else if (a === 'mdReason') { if (ui.modal) ui.modal.reason = el.value; }
    else if (a === 'uNote') { var u = findUrge(id); if (u) { u.note = el.value; save(); } }
    else if (a === 'typedConfirm' && ui.modal) { var yes = document.querySelector('[data-a="typedYes"]'); if (yes) yes.disabled = el.value.trim().toUpperCase() !== ui.modal.word; }
  });
  document.addEventListener('focusout', function (ev) {
    var el = ev.target;
    if (el.getAttribute && el.getAttribute('data-a') === 'nfEdit') {
      var n = nfFind(el.getAttribute('data-list'), el.getAttribute('data-id'));
      if (n && n.text !== n.text.trim()) { n.text = n.text.trim(); el.value = n.text; save(); }
    }
  });
  document.addEventListener('change', function (ev) {
    var el = ev.target, a = el.getAttribute('data-a'), id = el.getAttribute('data-id');
    if (a === 'renameGoal' || a === 'renameReward' || a === 'renameAction') {
      var item = a === 'renameGoal' ? findGoal(id) : a === 'renameReward' ? findReward(id) : findAction(id);
      if (item && !item.name.trim()) { item.name = a === 'renameGoal' ? 'Untitled task' : a === 'renameReward' ? 'Untitled reward' : 'Untitled action'; el.value = item.name; }
      save();
    }
    if (a === 'setDays') {
      var r = findReward(id);
      if (!r) return;
      var v = parseInt(el.value, 10);
      r.daysRequired = isNaN(v) ? r.daysRequired : Math.max(1, Math.min(9999, v));
      el.value = r.daysRequired; save();
    }
    if (a === 'nofapSince' && el.value) {
      var t = localToday();
      S.nofapSince = el.value > t ? t : el.value;
      el.value = S.nofapSince;
      commit();
    }
  });
  document.addEventListener('keydown', function (ev) {
    var t = ev.target;
    if (ui.locked) {
      if (/^[0-9]$/.test(ev.key)) { pinKey(ev.key); ev.preventDefault(); return; }
      if (ev.key === 'Backspace') { pinKey('back'); ev.preventDefault(); return; }
    }
    if (ev.key === 'Enter' && t.tagName === 'INPUT') t.blur();
    if (ev.key === 'Enter' && t.getAttribute && t.getAttribute('data-a') === 'nfEdit') { ev.preventDefault(); t.blur(); }
    if ((ev.key === 'Enter' || ev.key === ' ') && t.getAttribute && /^(editItem|mdItem)$/.test(t.getAttribute('data-a'))) { ev.preventDefault(); t.click(); }
  });

  // Called by the Android shell for the system back gesture. Returns true when handled.
  window.stationsBack = function () {
    if (ui.locked) {
      if (ui.pinMode !== 'unlock') { A.pinCancel(); return true; }
      return false;
    }
    if (ui.modal) { A.closeModal(); return true; }
    if (ui.drawer) { ui.drawer = false; render(); return true; }
    var ae = document.activeElement;
    if (ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName)) { ae.blur(); return true; }
    if (ui.edit) { ui.edit = null; render(); return true; }
    if (ui.screen === 'journal' && ui.jView !== 'list') { ui.jView = ui.jView === 'edit' && ui.jId ? 'read' : 'list'; ui.jConfirmDelete = false; render(); return true; }
    if (ui.screen === 'urge' && ui.ud.step === 2) { ui.ud.step = 1; render(); return true; }
    if (ui.screen !== 'today') { go('today'); return true; }
    return false;
  };

  // Called on resume and every minute so a new day is picked up without a restart.
  var lastSeenDay = localToday();
  window.stationsRefresh = function () {
    var changed = catchUp() > 0, now = localToday();
    if (changed || now !== lastSeenDay) {
      lastSeenDay = now;
      var ae = document.activeElement;
      if (!(ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName))) render();
    }
  };
  document.addEventListener('visibilitychange', function () { if (!document.hidden) window.stationsRefresh(); });
  setInterval(window.stationsRefresh, 60000);

  window.__improvementSha256 = sha256; // exposed for tests only

  catchUp();
  clampMin();
  purgeBlankNofap();
  save();
  setBars();
  render();
})();
