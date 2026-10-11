/*
 * A tiny game engine for the Flexbox and Grid challenges.
 * You type CSS on the left; the page compares the position of every box with the goal.
 * No libraries, no build step: this is plain JavaScript that runs from a double-click.
 *
 * Each level looks like this:
 *   { title, text, goal, items,          what to show (items: a number, or a list of names)
 *     fieldStyle, itemStyle,             base CSS for the container (.field) and the boxes (.item)
 *     start, solution,                   the text in the editor at the start, and the answer
 *     must: [regex strings], hint }      things the CSS must use (so that the level teaches its lesson)
 */
(function () {
  'use strict';

  var FORBIDDEN = [
    [/position\s*:\s*(absolute|fixed|relative|sticky)/i, 'Try to solve it without `position`: this level is about the layout tool.'],
    [/(^|[\s;{])(top|left|right|bottom|inset)\s*:/i, 'Try to solve it without `top`, `left`, `right`, `bottom`: use the layout tool of this level.'],
    [/(^|[\s;{])(transform|translate)\s*:/i, 'Try to solve it without `transform`.'],
    [/float\s*:/i, 'Try to solve it without `float`.']
  ];

  window.startChallenges = function (config) {
    var levels = config.levels;
    var app = document.getElementById('app');
    var storageKey = config.storageKey;
    var done = load();
    var current = 0;
    var timer = null;

    function load() {
      try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (e) { return []; }
    }
    function save() {
      try { localStorage.setItem(storageKey, JSON.stringify(done)); } catch (e) { /* private window: fine */ }
    }
    function el(tag, attrs, html) {
      var e = document.createElement(tag);
      Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (html !== undefined) e.innerHTML = html;
      return e;
    }
    function esc(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function md(s) {
      // tiny markdown: `code` and **bold**
      return s.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }

    // ----- build the page
    app.innerHTML =
      '<div class="ch">' +
      '  <section class="ch-side" aria-label="The level">' +
      '    <p class="ch-count" id="ch-count"></p>' +
      '    <h2 id="ch-title" tabindex="-1"></h2>' +
      '    <div class="ch-text" id="ch-text"></div>' +
      '    <div class="ch-goal" id="ch-goal"></div>' +
      '    <label class="ch-label" for="ch-css">Your CSS</label>' +
      '    <textarea id="ch-css" rows="9" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>' +
      '    <p class="ch-status" id="ch-status" role="status" data-state="idle"></p>' +
      '    <div class="ch-actions">' +
      '      <button type="button" class="btn btn-outline" id="ch-hint-btn">Hint</button>' +
      '      <button type="button" class="btn btn-outline" id="ch-solution-btn">Show the answer</button>' +
      '      <button type="button" class="btn btn-outline" id="ch-restart-btn">Start the level again</button>' +
      '      <button type="button" class="btn" id="ch-next-btn" hidden>Next level</button>' +
      '    </div>' +
      '    <p class="ch-hint" id="ch-hint" hidden></p>' +
      '    <nav aria-label="Levels"><ol class="ch-levels" id="ch-levels"></ol></nav>' +
      '  </section>' +
      '  <section class="ch-stages" aria-label="Pictures">' +
      '    <h3>Your result</h3>' +
      '    <div class="arena" id="yours" aria-hidden="true"><div class="field"></div></div>' +
      '    <h3>The goal</h3>' +
      '    <div class="arena" id="goal" aria-hidden="true"><div class="field"></div></div>' +
      '    <p class="ch-note">Both boxes are the same size. When every box is in the same place as in the goal, the level is solved. These games are visual: if you use a screen reader, the text of each level describes the goal in words.</p>' +
      '  </section>' +
      '</div>';

    var $ = function (id) { return document.getElementById(id); };
    var baseStyle = el('style');
    var yourStyle = el('style');
    var goalStyle = el('style');
    document.head.appendChild(baseStyle);
    document.head.appendChild(yourStyle);
    document.head.appendChild(goalStyle);

    levels.forEach(function (lv, i) {
      var li = el('li');
      var b = el('button', { type: 'button', 'aria-label': 'Level ' + (i + 1) + ': ' + lv.title }, String(i + 1));
      b.addEventListener('click', function () { go(i); });
      li.appendChild(b);
      $('ch-levels').appendChild(li);
    });

    $('ch-css').addEventListener('input', function () {
      apply();
      clearTimeout(timer);
      timer = setTimeout(check, 60);
    });
    $('ch-hint-btn').addEventListener('click', function () {
      var h = $('ch-hint');
      h.hidden = !h.hidden;
    });
    $('ch-solution-btn').addEventListener('click', function () {
      $('ch-css').value = levels[current].solution;
      apply();
      check();
    });
    $('ch-restart-btn').addEventListener('click', function () { go(current); });
    $('ch-next-btn').addEventListener('click', function () { go(Math.min(current + 1, levels.length - 1)); $('ch-title').focus(); });
    window.addEventListener('hashchange', function () { var n = fromHash(); if (n !== current) go(n); });

    function fromHash() {
      var n = parseInt((location.hash || '').replace('#', ''), 10);
      return n >= 1 && n <= levels.length ? n - 1 : 0;
    }

    // ----- show a level
    function fillField(field, lv) {
      field.textContent = '';
      var names = typeof lv.items === 'number' ? null : lv.items;
      var n = names ? names.length : lv.items;
      for (var i = 0; i < n; i++) {
        var d = el('div', { class: names ? 'item ' + names[i] : 'item item-' + (i + 1) }, names ? names[i] : String(i + 1));
        d.style.setProperty('--i', i + 1);
        field.appendChild(d);
      }
    }

    function go(i) {
      current = i;
      var lv = levels[i];
      if (location.hash !== '#' + (i + 1)) {
        try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { /* file:// in some browsers */ }
      }
      $('ch-count').textContent = 'Level ' + (i + 1) + ' of ' + levels.length;
      $('ch-title').textContent = lv.title;
      $('ch-text').innerHTML = md(lv.text).split('\n\n').map(function (p) { return '<p>' + p + '</p>'; }).join('');
      $('ch-goal').innerHTML = '<strong>Your goal:</strong> ' + md(lv.goal) + (lv.picture ? '<pre aria-hidden="true">' + esc(lv.picture) + '</pre>' : '');
      $('ch-hint').innerHTML = '<strong>Hint:</strong> ' + md(lv.hint);
      $('ch-hint').hidden = true;
      $('ch-css').value = lv.start;
      $('ch-next-btn').hidden = true;
      setStatus('idle', 'Type your CSS in the box. The result changes as you type.');
      var base =
        '.arena .field { ' + (lv.fieldStyle || '') + ' }\n' +
        '.arena .item { ' + (config.kind === 'flex' ? 'width: 3.5rem; height: 3.5rem; ' : '') + (lv.itemStyle || '') + ' }\n';
      baseStyle.textContent = base;
      fillField($('yours').firstChild, lv);
      fillField($('goal').firstChild, lv);
      goalStyle.textContent = '#goal {\n' + lv.solution + '\n}';
      apply();
      markLevels();
      check();
    }

    function apply() {
      yourStyle.textContent = '#yours {\n' + $('ch-css').value + '\n}';
    }

    function markLevels() {
      Array.prototype.forEach.call($('ch-levels').querySelectorAll('button'), function (b, i) {
        b.setAttribute('data-done', done.indexOf(i) !== -1 ? 'true' : 'false');
        if (i === current) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
    }

    function setStatus(state, text) {
      var s = $('ch-status');
      s.setAttribute('data-state', state);
      s.textContent = text;
    }

    // ----- compare with the goal
    function measure(arena) {
      var field = arena.firstChild;
      var f = field.getBoundingClientRect();
      return {
        field: [f.width, f.height],
        items: Array.prototype.map.call(field.children, function (c) {
          var r = c.getBoundingClientRect();
          return [r.left - f.left, r.top - f.top, r.width, r.height];
        })
      };
    }
    function same(a, b) {
      for (var i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 1.5) return false;
      return true;
    }

    function check() {
      var lv = levels[current];
      var css = $('ch-css').value.replace(/\/\*[\s\S]*?\*\//g, '');
      var open = (css.match(/\{/g) || []).length, close = (css.match(/\}/g) || []).length;
      if (open !== close) { setStatus('idle', 'Check your curly braces: every { needs a } that closes it.'); return; }

      var a = measure($('yours')), b = measure($('goal'));
      var match = same(a.field, b.field) && a.items.every(function (r, i) { return same(r, b.items[i]); });
      if (!match) { setStatus('idle', 'Not there yet. Compare your boxes with the goal below them.'); return; }

      for (var i = 0; i < FORBIDDEN.length; i++) {
        if (FORBIDDEN[i][0].test(css)) { setStatus('almost', 'The picture matches, but... ' + FORBIDDEN[i][1]); return; }
      }
      var missing = (lv.must || []).filter(function (m) { return !new RegExp(m, 'i').test(css); });
      if (missing.length) {
        setStatus('almost', 'The picture matches, but this level is about ' + (lv.mustName || 'a particular property') + '. Try to solve it with that. (Press Hint if you are stuck.)');
        return;
      }
      if (done.indexOf(current) === -1) { done.push(current); save(); }
      markLevels();
      setStatus('solved', current === levels.length - 1 ? 'Solved! That was the last level. You did it.' : 'Solved! Well done.');
      $('ch-next-btn').hidden = current === levels.length - 1;
    }

    go(fromHash());
  };
})();
