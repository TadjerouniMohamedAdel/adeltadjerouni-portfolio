/* eslint-disable */
// Stations — daily goals. Plain JS, rendered into #main / #nav / #overlay.
// Persistence: the Android shell exposes `StationsStore` (SharedPreferences);
// in a desktop browser we fall back to localStorage.
(function () {
  'use strict';

  var STORE_KEY = 'stations.state.v1';
  var MAX_CATCH_UP = 400;

  // ---------------------------------------------------------------- dates
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function localToday() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function addDays(iso, n) {
    var p = iso.split('-').map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10);
  }
  var W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function parts(iso) {
    var p = iso.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return { wd: W[d.getUTCDay()], wdl: WL[d.getUTCDay()], day: d.getUTCDate(), mon: M[d.getUTCMonth()] };
  }
  function fmt(iso) { var x = parts(iso); return x.wd + ' ' + x.day + ' ' + x.mon; }

  // ---------------------------------------------------------------- state
  function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function defaultState() {
    return {
      version: 1,
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
      history: []
    };
  }

  function load() {
    var raw = null;
    try {
      raw = window.StationsStore ? window.StationsStore.load() : window.localStorage.getItem(STORE_KEY);
    } catch (e) { raw = null; }
    if (!raw) return defaultState();
    try {
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.goals) || !Array.isArray(s.history)) return defaultState();
      s.rewards = s.rewards || [];
      s.settings = s.settings || { minScore: 1 };
      s.doneToday = s.doneToday || {};
      s.counter = s.counter || 0;
      s.today = s.today || localToday();
      return s;
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
  var ui = { tab: 'today', openDate: null, sheet: null, edit: null, q: { today: '', goals: '', rewards: '' } };

  // ---------------------------------------------------------------- rules
  function totalPoints(goals) { return goals.reduce(function (t, g) { return t + g.points; }, 0); }

  function evaluate(goals, done, min) {
    var score = 0, total = 0, missing = [];
    goals.forEach(function (g) {
      total += g.points;
      if (done[g.id]) score += g.points;
      else if (g.nonNegotiable) missing.push(g.name);
    });
    var result = missing.length ? 'reset' : score >= min ? 'count' : 'hold';
    return { score: score, total: total, missing: missing, result: result };
  }

  function sortedRewards() {
    return S.rewards.slice().sort(function (a, b) { return a.daysRequired - b.daysRequired; });
  }

  // Close the open day: snapshot goals, apply rules, advance to the next day.
  function closeOpenDay() {
    var ev = evaluate(S.goals, S.doneToday, S.settings.minScore);
    var counter = ev.result === 'count' ? S.counter + 1 : ev.result === 'reset' ? 0 : S.counter;
    S.history.push({
      date: S.today,
      items: S.goals.map(function (g) {
        return { goalName: g.name, points: g.points, nonNegotiable: g.nonNegotiable, done: !!S.doneToday[g.id] };
      }),
      score: ev.score, minScore: S.settings.minScore, total: ev.total, result: ev.result, counterAfter: counter
    });
    S.counter = counter;
    S.today = addDays(S.today, 1);
    S.doneToday = {};
    return ev;
  }

  // Re-derive every closed day's result and the counter chain from the stored
  // snapshots. Each day keeps its own minimum, so later minimum changes never
  // rewrite the past; only an explicit edit of a day changes its outcome.
  function replayHistory() {
    var c = 0;
    S.history.forEach(function (h) {
      var score = 0, total = 0, missing = false;
      h.items.forEach(function (it) {
        total += it.points;
        if (it.done) score += it.points;
        else if (it.nonNegotiable) missing = true;
      });
      h.score = score;
      h.total = total;
      h.result = missing ? 'reset' : score >= h.minScore ? 'count' : 'hold';
      c = h.result === 'count' ? c + 1 : h.result === 'reset' ? 0 : c;
      h.counterAfter = c;
    });
    S.counter = c;
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

  // A day stays open until the end of the following day, so late check-ins
  // still work. Anything older is closed automatically with what was ticked.
  function catchUp() {
    var yesterday = addDays(localToday(), -1);
    var closed = [];
    var guard = 0;
    while (S.today < yesterday && guard++ < MAX_CATCH_UP) {
      closeOpenDay();
      closed.push(S.history[S.history.length - 1]);
    }
    if (guard >= MAX_CATCH_UP && S.today < yesterday) S.today = yesterday;
    if (closed.length) {
      save();
      var resets = closed.filter(function (h) { return h.result === 'reset'; }).length;
      var counts = closed.filter(function (h) { return h.result === 'count'; }).length;
      var body = closed.length === 1
        ? fmt(closed[0].date) + ' was left open, so it was closed with the goals you had ticked (' + closed[0].score + '/' + closed[0].minScore + ').'
        : 'Days from ' + fmt(closed[0].date) + ' to ' + fmt(closed[closed.length - 1].date) + ' were left open and closed with what was ticked.';
      body += resets ? ' A missed non-negotiable reset the counter.' : counts ? '' : ' Nothing changed.';
      body += ' You are now at ' + S.counter + (S.counter === 1 ? ' day.' : ' days.');
      ui.sheet = {
        kind: 'info', kicker: 'While you were away', color: '#3F433C',
        title: closed.length === 1 ? '1 day closed' : closed.length + ' days closed',
        body: body, ok: 'Got it'
      };
    }
    return closed.length;
  }

  function clampMin() {
    var t = totalPoints(S.goals);
    if (S.settings.minScore > t) S.settings.minScore = Math.max(1, t);
    if (S.settings.minScore < 1) S.settings.minScore = 1;
  }

  // ---------------------------------------------------------------- helpers
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  var I = {
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>',
    minus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    checkSm: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    xSm: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5a2 2 0 0 0 2 1.5h6a2 2 0 0 0 2-1.5L18 7M9 7V4.5h6V7"/></svg>',
    chev: '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E6259" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    gift: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B34A12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0"><rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8.5h14V12M12 8v12.5M12 8C10.5 4.5 6 4.5 6 7s3 1 6 1zm0 0c1.5-3.5 6-3.5 6-1s-3 1-6 1z"/></svg>',
    tToday: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.8"/></svg>',
    tJourney: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M8.2 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.8"/></svg>',
    tHistory: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    tSetup: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>'
  };

  var SEARCH_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';

  function searchBox(key, label) {
    return '<div class="search"><span class="search-ic">' + SEARCH_ICON + '</span>' +
      '<input type="search" enterkeyhint="search" autocomplete="off" aria-label="' + label + '" placeholder="' + label + '" data-search="' + key + '" value="' + esc(ui.q[key]) + '">' +
      '<button type="button" class="search-x" aria-label="Clear search" data-a="clearSearch" data-key="' + key + '"' + (ui.q[key] ? '' : ' hidden') + '>' + I.xSm + '</button></div>';
  }

  function noMatch(key) { return '<div class="empty nomatch" data-nomatch="' + key + '" hidden>No match for “<span></span>”.</div>'; }

  // Filters list items in place (no re-render) so the search field keeps focus.
  function applyFilters() {
    Object.keys(ui.q).forEach(function (key) {
      var list = main.querySelector('[data-list="' + key + '"]');
      if (!list) return;
      var q = ui.q[key].trim().toLowerCase();
      var shown = 0, rows = list.querySelectorAll('[data-name]');
      for (var i = 0; i < rows.length; i++) {
        var hit = !q || rows[i].getAttribute('data-name').indexOf(q) >= 0;
        rows[i].hidden = !hit;
        if (hit) shown++;
      }
      var nm = main.querySelector('[data-nomatch="' + key + '"]');
      if (nm) { nm.hidden = !(q && rows.length && !shown); nm.querySelector('span').textContent = ui.q[key].trim(); }
      var x = main.querySelector('.search-x[data-key="' + key + '"]');
      if (x) x.hidden = !ui.q[key];
    });
  }

  function nextInfo() {
    var rewards = sortedRewards();
    var next = rewards.find(function (r) { return r.daysRequired > S.counter; });
    var prevDays = rewards.filter(function (r) { return r.daysRequired <= S.counter; })
      .reduce(function (m, r) { return Math.max(m, r.daysRequired); }, 0);
    return { rewards: rewards, next: next, prevDays: prevDays };
  }

  // ---------------------------------------------------------------- screens
  function renderToday() {
    var ev = evaluate(S.goals, S.doneToday, S.settings.minScore);
    var min = S.settings.minScore;
    var ni = nextInfo(), next = ni.next;
    var real = localToday();
    var p = parts(S.today);
    var rel = S.today === real ? 'Today' : S.today < real ? 'Yesterday' : 'Tomorrow';

    var nextPct = next ? Math.round((S.counter - ni.prevDays) / Math.max(1, next.daysRequired - ni.prevDays) * 100) : 100;
    var away = next ? next.daysRequired - S.counter : 0;
    var nextAway = next ? plural(away, 'day away', 'days away') + ' · day ' + next.daysRequired
      : (S.rewards.length ? 'Route complete' : 'Add rewards in Setup');

    var C = 238.76;
    var pct = Math.min(1, ev.score / Math.max(1, min));
    var ringColor = ev.score >= min ? '#1E6A50' : '#1D211C';

    var st;
    if (!S.goals.length) st = { bg: '#E9E4D8', fg: '#2F332D', t: 'No goals yet', b: 'Add a goal to start scoring your days.' };
    else if (ev.missing.length) st = { bg: '#F6E2D3', fg: '#6A2806', t: 'Non-negotiable still open', b: ev.missing.join(', ') + ' — close the day without it and the counter resets to 0.' };
    else if (ev.result === 'count') st = { bg: '#DDEBE3', fg: '#123F30', t: 'This day counts', b: 'Close it and your counter moves to ' + (S.counter + 1) + '.' };
    else st = { bg: '#E9E4D8', fg: '#2F332D', t: plural(min - ev.score, 'point', 'points') + ' to the minimum', b: 'Below it nothing happens — the counter stays at ' + S.counter + '.' };

    var doneCount = S.goals.filter(function (g) { return S.doneToday[g.id]; }).length;
    var future = S.today > real;
    var ringTxt = ev.score + '/' + min;

    var goalsHtml = S.goals.map(function (g) {
      var d = !!S.doneToday[g.id];
      return '<button type="button" class="goal' + (d ? ' done' : '') + '" data-a="toggle" data-id="' + esc(g.id) + '" data-name="' + esc(g.name.toLowerCase()) + '" aria-pressed="' + d + '">' +
        '<span class="box">' + (d ? I.check : '') + '</span>' +
        '<span class="txt"><span class="name">' + esc(g.name) + '</span>' +
        (g.nonNegotiable ? '<span class="tag">' + I.lock + 'Non-negotiable</span>' : '') + '</span>' +
        '<span class="pts">+' + g.points + '</span></button>';
    }).join('');

    return '<div class="screen">' +
      '<header><span class="kicker">' + rel + ' · ' + p.wdl + ' ' + p.day + ' ' + p.mon + '</span>' +
      '<h1 class="h1">Daily check-in</h1></header>' +
      '<section class="hero" aria-label="Successful days"><div class="hero-top">' +
      '<div class="col" style="gap:4px"><span class="hero-label">Successful days</span><span class="hero-count">' + S.counter + '</span></div>' +
      '<div class="hero-next"><span class="hero-label">Next station</span><span class="hero-next-name">' + esc(next ? next.name : 'All reached') + '</span>' +
      '<span class="hero-next-away">' + esc(nextAway) + '</span></div></div>' +
      '<div class="bar"><div style="width:' + nextPct + '%"></div></div></section>' +
      '<section class="score" aria-label="Today\'s score" style="background:' + st.bg + '">' +
      '<div class="ring"><svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">' +
      '<circle cx="46" cy="46" r="38" fill="none" stroke="#FFFDF8" stroke-width="9"/>' +
      (pct > 0 ? '<circle class="prog" cx="46" cy="46" r="38" fill="none" stroke="' + ringColor + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (pct * C).toFixed(2) + ' ' + C + '" transform="rotate(-90 46 46)"/>' : '') + '</svg>' +
      '<div class="ring-txt"><span class="ring-num' + (ringTxt.length > 5 ? ' small' : '') + '">' + ringTxt + '</span><span class="ring-sub">' + ev.total + ' possible</span></div></div>' +
      '<div class="status" style="color:' + st.fg + '"><b>' + esc(st.t) + '</b><span>' + esc(st.b) + '</span></div></section>' +
      '<div class="row-between" style="padding-top:4px"><div class="col"><h2 class="h2">Goals</h2>' +
      '<span class="sub">' + doneCount + ' of ' + S.goals.length + ' done</span></div>' +
      '<button type="button" class="pill-btn" data-a="addGoalFromToday">' + I.plus + 'Add goal</button></div>' +
      (S.goals.length > 5 ? searchBox('today', 'Search goals') : '') +
      '<div class="stack" data-list="today">' + (goalsHtml || '<div class="empty">No goals yet. Tap “Add goal” to create your first one.</div>') + '</div>' + noMatch('today') +
      '<button type="button" class="big-btn" data-a="closeDay"' + (future ? ' disabled' : '') + '>Close ' + fmt(S.today) + '</button>' +
      (future ? '<p class="hint">You can tick goals ahead, but ' + fmt(S.today) + ' can only be closed once it begins.</p>'
        : S.today < real ? '<p class="hint">Yesterday is still open. Close it to start today.</p>' : '') +
      '</div>';
  }

  function renderJourney() {
    var rewards = sortedRewards();
    var lastReset = -1;
    S.history.forEach(function (h, i) { if (h.result === 'reset') lastReset = i; });
    var runStart = lastReset >= 0 ? addDays(S.history[lastReset].date, 1) : (S.history.length ? S.history[0].date : S.today);
    function reachedOn(days) {
      for (var i = lastReset + 1; i < S.history.length; i++) {
        var h = S.history[i];
        if (h.result === 'count' && h.counterAfter === days) return h.date;
      }
      return null;
    }
    var list = [{ name: 'Start', daysRequired: 0, start: true }].concat(rewards);
    var nextIdx = -1;
    for (var k = 0; k < list.length; k++) if (list[k].daysRequired > S.counter) { nextIdx = k; break; }

    var items = list.map(function (r, i) {
      var reached = r.daysRequired <= S.counter;
      var isNext = i === nextIdx;
      var after = list[i + 1];
      var fill = 0;
      if (after) fill = Math.max(0, Math.min(100, (S.counter - r.daysRequired) / Math.max(1, after.daysRequired - r.daysRequired) * 100));
      var here = !!after && S.counter > r.daysRequired && S.counter < after.daysRequired;
      var meta;
      if (r.start) meta = 'Run started ' + fmt(runStart);
      else if (reached) { var d = reachedOn(r.daysRequired); meta = d ? 'Unlocked ' + fmt(d) : 'Unlocked'; }
      else {
        var away = r.daysRequired - S.counter;
        meta = plural(away, 'day', 'days') + ' away · earliest ' + fmt(addDays(S.today, away - 1));
      }
      var cls = reached ? 'reached' : isNext ? 'next' : '';
      return '<li><div class="rail"><span class="node ' + cls + '">' + (reached ? I.check : isNext ? '<span class="dot"></span>' : '') + '</span>' +
        (after ? '<div class="seg"><div class="fill" style="height:' + fill.toFixed(1) + '%"></div>' +
          (here ? '<span class="here" aria-label="You are here" style="top:' + fill.toFixed(1) + '%"></span>' : '') + '</div>' : '') +
        '</div><div class="st-body"><div class="st-card ' + cls + '"><div class="row-between" style="align-items:baseline;gap:8px">' +
        '<span class="st-name">' + esc(r.name) + '</span><span class="st-day">Day ' + r.daysRequired + '</span></div>' +
        '<span class="st-meta">' + esc(meta) + '</span></div></div></li>';
    }).join('');

    return '<div class="screen wide-gap"><header><span class="kicker">Current run · day ' + S.counter + '</span>' +
      '<h1 class="h1">Your route</h1><p class="lede">Every day at or above the minimum moves you one stop. A missed non-negotiable sends you back to the start.</p></header>' +
      '<ol class="route">' + items + '</ol>' +
      (rewards.length ? '' : '<div class="empty">No stations yet. Add rewards in Setup to build your route.</div>') + '</div>';
  }

  function renderHistory() {
    var lastN = S.history.slice(-30);
    var cells = '';
    for (var i = 0; i < 30; i++) {
      var h = lastN[i];
      cells += h ? '<span class="' + h.result + '" title="' + esc(fmt(h.date) + ' · ' + h.score + '/' + h.minScore) + '"></span>' : '<span></span>';
    }
    function cnt(r) { return lastN.filter(function (h) { return h.result === r; }).length; }

    var list = S.history.map(function (h, idx) {
      var p = parts(h.date);
      var open = ui.openDate === idx;
      var editing = open && ui.edit && ui.edit.idx === idx;
      var pill = h.result === 'count' ? '+1 → ' + h.counterAfter : h.result === 'reset' ? 'Reset to 0' : 'No change';
      var doneN = h.items.filter(function (it) { return it.done; }).length;
      var shownItems = editing ? h.items.map(function (it, i) { return Object.assign({}, it, { done: ui.edit.done[i] }); }) : h.items;
      var itemRows = shownItems.map(function (it, i) {
        return '<li class="' + (it.done ? 'done' : 'missed') + (it.nonNegotiable ? ' must' : '') + (editing ? ' editable' : '') + '"' +
          (editing ? ' role="button" tabindex="0" aria-pressed="' + it.done + '" data-a="editItem" data-i="' + i + '"' : '') + '>' +
          '<span class="ic">' + (it.done ? I.checkSm : I.xSm) + '</span>' +
          '<span class="nm">' + esc(it.goalName) + '</span>' + (it.nonNegotiable ? '<span class="mustlbl">Must</span>' : '') +
          '<span class="pt">' + (it.done ? '+' + it.points : '0') + '</span></li>';
      }).join('');
      var items = '';
      if (editing) {
        var o = dayOutcome(shownItems, ui.edit.min);
        var rLbl = o.result === 'count' ? 'Counts' : o.result === 'reset' ? 'Resets to 0' : 'No change';
        items = '<ul>' + itemRows + '</ul><div class="day-edit">' +
          '<div class="row-between"><div class="col"><span class="edit-lbl">Minimum for this day</span><span class="day-sub">Other days keep their own</span></div>' +
          '<div class="stepper" style="gap:2px"><button type="button" class="sq light" aria-label="Lower this day\'s minimum" data-a="editMinDec"' + (ui.edit.min <= 1 ? ' disabled' : '') + '>' + I.minus + '</button>' +
          '<span class="pts-val">' + ui.edit.min + '</span>' +
          '<button type="button" class="sq light" aria-label="Raise this day\'s minimum" data-a="editMinInc"' + (ui.edit.min >= Math.max(1, o.total) ? ' disabled' : '') + '>' + I.plus + '</button></div></div>' +
          '<div class="row-between edit-preview"><span class="day-score">' + o.score + '/' + ui.edit.min + '</span><span class="res ' + o.result + '">' + rLbl + '</span></div>' +
          '<div class="btns"><button type="button" class="ghost" data-a="cancelEdit">Cancel</button><button type="button" data-a="saveEdit">Save day</button></div></div>';
      } else if (open) {
        items = '<ul>' + itemRows + '</ul><div class="day-edit"><button type="button" class="pill-btn edit-btn" data-a="editDay" data-idx="' + idx + '">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>Edit this day</button></div>';
      }
      return '<div class="day' + (open ? ' open' : '') + '"><button type="button" class="day-head" data-a="openDay" data-idx="' + idx + '" aria-expanded="' + open + '">' +
        '<span class="day-date"><small>' + p.wd + '</small><b>' + p.day + '</b></span>' +
        '<span class="day-mid"><span class="day-score">' + h.score + '/' + h.minScore + '</span><span class="day-sub">' + p.mon + ' · ' + doneN + ' of ' + h.items.length + ' goals' + (h.edited ? '<span class="edited-tag">Edited</span>' : '') + '</span></span>' +
        '<span class="res ' + h.result + '">' + pill + '</span>' + I.chev + '</button>' + items + '</div>';
    }).reverse().join('');

    return '<div class="screen"><header><span class="kicker">Last ' + (lastN.length || 30) + ' days</span><h1 class="h1">History</h1></header>' +
      '<section class="panel" aria-label="Overview"><div class="grid">' + cells + '</div>' +
      '<div class="legend"><span><i style="background:#1E6A50"></i>Counted · ' + cnt('count') + '</span>' +
      '<span><i style="background:#D6D0C2"></i>No change · ' + cnt('hold') + '</span>' +
      '<span><i style="background:#E9884E"></i>Reset · ' + cnt('reset') + '</span></div></section>' +
      '<div class="stack">' + (list || '<div class="empty">No closed days yet. Close your first day on the Today tab and it will show up here.</div>') + '</div></div>';
  }

  function renderSetup() {
    var total = totalPoints(S.goals);
    var min = S.settings.minScore;
    var goals = S.goals.map(function (g) {
      return '<div class="edit-card" data-name="' + esc(g.name.toLowerCase()) + '"><div class="edit-row">' +
        '<input class="field" type="text" aria-label="Goal name" maxlength="60" value="' + esc(g.name) + '" data-a="renameGoal" data-id="' + esc(g.id) + '">' +
        '<button type="button" class="icon-btn" aria-label="Remove goal" data-a="removeGoal" data-id="' + esc(g.id) + '">' + I.trash + '</button></div>' +
        '<div class="row-between" style="gap:8px"><div class="stepper" style="gap:2px">' +
        '<button type="button" class="sq light" aria-label="Fewer points" data-a="ptsDec" data-id="' + esc(g.id) + '"' + (g.points <= 1 ? ' disabled' : '') + '>' + I.minus + '</button>' +
        '<span class="pts-val">' + g.points + ' pts</span>' +
        '<button type="button" class="sq light" aria-label="More points" data-a="ptsInc" data-id="' + esc(g.id) + '"' + (g.points >= 50 ? ' disabled' : '') + '>' + I.plus + '</button></div>' +
        '<button type="button" class="switch-btn" aria-pressed="' + g.nonNegotiable + '" data-a="toggleMust" data-id="' + esc(g.id) + '">Non-negotiable<span class="switch"><i></i></span></button>' +
        '</div></div>';
    }).join('');
    var rewards = S.rewards.map(function (r) {
      return '<div class="edit-card" data-name="' + esc(r.name.toLowerCase()) + '" style="flex-direction:row;align-items:center;gap:8px;padding:10px 10px 10px 14px">' + I.gift +
        '<input class="field" type="text" aria-label="Reward name" maxlength="60" value="' + esc(r.name) + '" data-a="renameReward" data-id="' + esc(r.id) + '">' +
        '<label class="days-lbl"><input class="field num" type="number" inputmode="numeric" min="1" max="999" aria-label="Days required" value="' + r.daysRequired + '" data-a="setDays" data-id="' + esc(r.id) + '">days</label>' +
        '<button type="button" class="icon-btn" aria-label="Remove reward" data-a="removeReward" data-id="' + esc(r.id) + '">' + I.trash + '</button></div>';
    }).join('');

    return '<div class="screen wide-gap"><header><span class="kicker">Everything is yours to change</span><h1 class="h1">Setup</h1></header>' +
      '<section class="rules" aria-label="Rules"><div class="row-between"><div class="col" style="gap:3px">' +
      '<span style="font-size:16px;font-weight:700">Daily minimum</span><span style="font-size:13px;color:#C9C5BA">out of ' + total + ' possible points</span></div>' +
      '<div class="stepper"><button type="button" class="sq" aria-label="Lower minimum" data-a="minDec"' + (min <= 1 ? ' disabled' : '') + '>' + I.minus + '</button>' +
      '<span class="min-val">' + min + '</span>' +
      '<button type="button" class="sq" aria-label="Raise minimum" data-a="minInc"' + (min >= total ? ' disabled' : '') + '>' + I.plus + '</button></div></div>' +
      '<p class="min-note">Applies from ' + fmt(S.today) + ' on. Closed days keep the minimum they had — edit a single day from History.</p>' +
      '<ul><li>Reach the minimum → +1 successful day.</li><li>Below the minimum → nothing changes.</li><li>Miss a non-negotiable → counter resets to 0.</li></ul></section>' +
      '<section class="stack" style="gap:10px" aria-labelledby="goals-h"><div class="row-between"><div class="col"><h2 id="goals-h" class="h2">Goals</h2>' +
      '<span class="sub" style="font-weight:400">' + plural(S.goals.length, 'goal', 'goals') + ' · ' + total + ' pts</span></div>' +
      '<button type="button" class="pill-btn solid" data-a="addGoal">' + I.plus + 'Add goal</button></div>' +
      (S.goals.length ? searchBox('goals', 'Search goals') : '') + '<div class="stack" style="gap:10px" data-list="goals">' + goals + '</div>' + noMatch('goals') +
      '<button type="button" class="dashed" data-a="addGoal">' + I.plus + 'Add goal</button></section>' +
      '<section class="stack" style="gap:10px" aria-labelledby="rewards-h"><div class="row-between" style="align-items:baseline"><h2 id="rewards-h" class="h2">Rewards</h2>' +
      '<span class="sub" style="font-weight:400">stations on your route</span></div>' +
      (S.rewards.length ? searchBox('rewards', 'Search rewards') : '') + '<div class="stack" style="gap:10px" data-list="rewards">' + rewards + '</div>' + noMatch('rewards') +
      '<button type="button" class="dashed" data-a="addReward">' + I.plus + 'Add reward</button></section>' +
      '<p class="foot">Changes apply from the open day on. Closed days keep the goals as they were.<br>' +
      '<button type="button" class="icon-btn" style="width:auto;padding:0 12px;margin:6px auto 0;font-size:12px;font-weight:600;text-decoration:underline" data-a="askReset">Erase all data</button></p>' +
      '</div>';
  }

  function renderNav() {
    var tabs = [['today', 'Today', I.tToday], ['journey', 'Journey', I.tJourney], ['history', 'History', I.tHistory], ['setup', 'Setup', I.tSetup]];
    return tabs.map(function (t) {
      return '<button type="button" data-a="tab" data-tab="' + t[0] + '"' + (ui.tab === t[0] ? ' aria-current="page"' : '') + '>' +
        '<span class="pad">' + t[2] + '</span>' + t[1] + '</button>';
    }).join('');
  }

  function renderSheet() {
    var s = ui.sheet;
    if (!s) return '';
    var btns = s.kind === 'confirm'
      ? '<button type="button" class="ghost" data-a="dismiss">Cancel</button><button type="button" class="danger" data-a="confirm">' + esc(s.ok) + '</button>'
      : '<button type="button" data-a="dismiss">' + esc(s.ok) + '</button>';
    return '<div class="scrim" data-a="scrim"><div class="sheet' + (s.reward ? ' reward' : '') + '" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' +
      '<span class="k" style="color:' + s.color + '">' + esc(s.kicker) + '</span>' +
      '<h2 id="sheet-title">' + esc(s.title) + '</h2><p>' + esc(s.body) + '</p>' +
      '<div class="btns">' + btns + '</div></div></div>';
  }

  var main = document.getElementById('main');
  var nav = document.getElementById('nav');
  var overlay = document.getElementById('overlay');
  var lastTab = null;

  function render() {
    var keepScroll = lastTab === ui.tab ? main.scrollTop : 0;
    var html = ui.tab === 'journey' ? renderJourney() : ui.tab === 'history' ? renderHistory()
      : ui.tab === 'setup' ? renderSetup() : renderToday();
    main.innerHTML = html;
    applyFilters();
    main.scrollTop = keepScroll;
    lastTab = ui.tab;
    nav.innerHTML = renderNav();
    overlay.innerHTML = renderSheet();
  }

  function commit() { clampMin(); save(); render(); }

  // ---------------------------------------------------------------- actions
  function findGoal(id) { return S.goals.find(function (g) { return g.id === id; }); }
  function findReward(id) { return S.rewards.find(function (r) { return r.id === id; }); }

  function addGoal(focus) {
    var g = { id: uid('g'), name: 'New goal', points: 2, nonNegotiable: false };
    ui.q.goals = '';
    S.goals.unshift(g);
    ui.tab = 'setup';
    lastTab = null;
    commit();
    if (focus) {
      var el = main.querySelector('input[data-id="' + g.id + '"]');
      if (el) { el.focus(); el.select(); }
    }
  }

  function doCloseDay() {
    if (S.today > localToday()) return;
    var ev = closeOpenDay();
    var counter = S.counter;
    var rewards = sortedRewards();
    var hit = ev.result === 'count' ? rewards.filter(function (r) { return r.daysRequired === counter; }) : [];
    var next = rewards.find(function (r) { return r.daysRequired > counter; });
    var nextLine = next ? (next.daysRequired - counter) + ' to go until ' + next.name + '.'
      : rewards.length ? 'Every station on your route is reached.' : '';
    var min = S.history[S.history.length - 1].minScore;
    var sheet;
    if (hit.length) {
      sheet = { kicker: 'Station reached · day ' + counter, title: hit.map(function (r) { return r.name; }).join(' + '), reward: true,
        body: 'You hit your minimum ' + counter + ' times on this run. This one is yours. ' + nextLine, color: '#B34A12' };
    } else if (ev.result === 'count') {
      sheet = { kicker: 'Day counted · ' + ev.score + '/' + min, title: plural(counter, 'successful day', 'successful days'), body: nextLine, color: '#1E6A50' };
    } else if (ev.result === 'reset') {
      sheet = { kicker: 'Counter reset', title: 'Back to day 0', body: 'Missed non-negotiable: ' + ev.missing.join(', ') + '. Your route starts again.', color: '#7A2F08' };
    } else {
      sheet = { kicker: 'No change · ' + ev.score + '/' + min, title: 'Still at ' + plural(counter, 'day', 'days'),
        body: 'Under the minimum, but every non-negotiable was kept, so nothing is lost.', color: '#3F433C' };
    }
    sheet.kind = 'info';
    sheet.ok = 'Start ' + fmt(S.today);
    ui.sheet = sheet;
    ui.openDate = null;
    ui.edit = null;
    commit();
  }

  var actions = {
    tab: function (el) { ui.tab = el.getAttribute('data-tab'); ui.edit = null; render(); },
    toggle: function (el) { var id = el.getAttribute('data-id'); S.doneToday[id] = !S.doneToday[id]; if (!S.doneToday[id]) delete S.doneToday[id]; commit(); },
    addGoalFromToday: function () { addGoal(true); },
    addGoal: function () { addGoal(true); },
    closeDay: doCloseDay,
    openDay: function (el) {
      var i = Number(el.getAttribute('data-idx'));
      if (ui.edit && ui.edit.idx !== i) ui.edit = null;
      ui.openDate = ui.openDate === i ? null : i;
      if (ui.openDate === null) ui.edit = null;
      render();
    },
    editDay: function (el) {
      var h = S.history[Number(el.getAttribute('data-idx'))];
      if (!h) return;
      ui.edit = { idx: Number(el.getAttribute('data-idx')), done: h.items.map(function (it) { return !!it.done; }), min: h.minScore };
      render();
    },
    editItem: function (el) { var i = Number(el.getAttribute('data-i')); ui.edit.done[i] = !ui.edit.done[i]; render(); },
    editMinDec: function () { ui.edit.min = Math.max(1, ui.edit.min - 1); render(); },
    editMinInc: function () {
      var t = S.history[ui.edit.idx].items.reduce(function (a, it) { return a + it.points; }, 0);
      ui.edit.min = Math.min(Math.max(1, t), ui.edit.min + 1); render();
    },
    cancelEdit: function () { ui.edit = null; render(); },
    saveEdit: function () {
      var e = ui.edit, h = S.history[e.idx];
      if (!h) { ui.edit = null; render(); return; }
      var before = S.counter, beforeResult = h.result;
      h.items.forEach(function (it, i) { it.done = e.done[i]; });
      h.minScore = e.min;
      h.edited = true;
      replayHistory();
      ui.edit = null;
      var name = { count: 'counted', hold: 'no change', reset: 'reset' };
      ui.sheet = { kind: 'info', kicker: 'Day updated · ' + fmt(h.date), color: '#1E6A50', ok: 'Done',
        title: before === S.counter ? 'Still at ' + plural(S.counter, 'day', 'days') : plural(before, 'day', 'days') + ' → ' + S.counter,
        body: 'This day is now ' + h.score + '/' + h.minScore + ' (' + name[h.result] + (beforeResult !== h.result ? ', was ' + name[beforeResult] : '') + '). ' +
          'Every later day was recounted with its own minimum.' };
      commit();
    },
    clearSearch: function (el) {
      var key = el.getAttribute('data-key');
      ui.q[key] = '';
      var input = main.querySelector('[data-search="' + key + '"]');
      if (input) input.value = '';
      applyFilters();
    },
    minDec: function () { S.settings.minScore = Math.max(1, S.settings.minScore - 1); commit(); },
    minInc: function () { S.settings.minScore = Math.min(totalPoints(S.goals), S.settings.minScore + 1); commit(); },
    ptsDec: function (el) { var g = findGoal(el.getAttribute('data-id')); if (g) { g.points = Math.max(1, g.points - 1); commit(); } },
    ptsInc: function (el) { var g = findGoal(el.getAttribute('data-id')); if (g) { g.points = Math.min(50, g.points + 1); commit(); } },
    toggleMust: function (el) { var g = findGoal(el.getAttribute('data-id')); if (g) { g.nonNegotiable = !g.nonNegotiable; commit(); } },
    removeGoal: function (el) {
      var g = findGoal(el.getAttribute('data-id'));
      if (!g) return;
      ui.sheet = { kind: 'confirm', kicker: 'Delete goal', title: g.name, color: '#7A2F08', ok: 'Delete',
        body: 'It disappears from today and from future days. Closed days in History keep it.',
        run: function () { S.goals = S.goals.filter(function (x) { return x.id !== g.id; }); delete S.doneToday[g.id]; } };
      render();
    },
    addReward: function () {
      var maxDays = S.rewards.reduce(function (m, r) { return Math.max(m, r.daysRequired); }, 0);
      var r = { id: uid('r'), name: 'New reward', daysRequired: Math.min(999, maxDays + 10) };
      ui.q.rewards = '';
      S.rewards.push(r);
      commit();
      var el = main.querySelector('input[data-a="renameReward"][data-id="' + r.id + '"]');
      if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); el.select(); }
    },
    removeReward: function (el) {
      var r = findReward(el.getAttribute('data-id'));
      if (!r) return;
      ui.sheet = { kind: 'confirm', kicker: 'Delete reward', title: r.name, color: '#7A2F08', ok: 'Delete',
        body: 'This station is removed from your route.',
        run: function () { S.rewards = S.rewards.filter(function (x) { return x.id !== r.id; }); } };
      render();
    },
    askReset: function () {
      ui.sheet = { kind: 'confirm', kicker: 'Erase all data', title: 'Start over?', color: '#7A2F08', ok: 'Erase',
        body: 'Goals, rewards, your counter and the whole history are deleted from this phone. This cannot be undone.',
        run: function () { S = defaultState(); ui.openDate = null; ui.edit = null; ui.tab = 'today'; } };
      render();
    },
    dismiss: function () { var wasClose = ui.sheet && ui.sheet.ok && ui.sheet.ok.indexOf('Start ') === 0; ui.sheet = null; if (wasClose) ui.tab = 'today'; render(); },
    confirm: function () { var s = ui.sheet; ui.sheet = null; if (s && s.run) s.run(); commit(); },
    scrim: function (el, ev) { if (ev.target === el) actions.dismiss(); }
  };

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-a]');
    if (!el || el.tagName === 'INPUT') return;
    var fn = actions[el.getAttribute('data-a')];
    if (fn) fn(el, ev);
  });

  // Text edits update state silently so the element under the user's finger
  // is not replaced mid-tap; other views re-read state when they render.
  document.addEventListener('input', function (ev) {
    var el = ev.target, a = el.getAttribute('data-a'), id = el.getAttribute('data-id');
    var sk = el.getAttribute('data-search');
    if (sk) { ui.q[sk] = el.value; applyFilters(); return; }
    if (a === 'renameGoal' || a === 'renameReward') {
      var card = el.closest('[data-name]');
      if (card) card.setAttribute('data-name', el.value.toLowerCase());
    }
    if (a === 'renameGoal') { var g = findGoal(id); if (g) { g.name = el.value; save(); } }
    if (a === 'renameReward') { var r = findReward(id); if (r) { r.name = el.value; save(); } }
  });
  document.addEventListener('change', function (ev) {
    var el = ev.target, a = el.getAttribute('data-a'), id = el.getAttribute('data-id');
    if (a === 'renameGoal' || a === 'renameReward') {
      var item = a === 'renameGoal' ? findGoal(id) : findReward(id);
      if (item && !item.name.trim()) { item.name = a === 'renameGoal' ? 'Untitled goal' : 'Untitled reward'; el.value = item.name; }
      save();
    }
    if (a === 'setDays') {
      var r = findReward(id);
      if (!r) return;
      var v = parseInt(el.value, 10);
      r.daysRequired = isNaN(v) ? r.daysRequired : Math.max(1, Math.min(999, v));
      el.value = r.daysRequired;
      save();
    }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') ev.target.blur();
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.getAttribute('data-a') === 'editItem') { ev.preventDefault(); ev.target.click(); }
  });

  // Called by the Android shell for the system back gesture. Returns true when handled.
  window.stationsBack = function () {
    if (ui.sheet) { actions.dismiss(); return true; }
    if (ui.edit) { ui.edit = null; render(); return true; }
    if (document.activeElement && document.activeElement.tagName === 'INPUT') { document.activeElement.blur(); return true; }
    if (ui.tab !== 'today') { ui.tab = 'today'; render(); return true; }
    return false;
  };

  // Called on resume and every minute so a new day is picked up without a restart.
  var lastSeenDay = localToday();
  window.stationsRefresh = function () {
    var changed = catchUp() > 0;
    var now = localToday();
    if (changed || now !== lastSeenDay) {
      lastSeenDay = now;
      var active = document.activeElement;
      if (!(active && active.tagName === 'INPUT')) render();
    }
  };
  document.addEventListener('visibilitychange', function () { if (!document.hidden) window.stationsRefresh(); });
  setInterval(window.stationsRefresh, 60000);

  catchUp();
  clampMin();
  save();
  render();
})();
