/* Graceland Psychiatry — shared front-end behaviour */
(function () {
  'use strict';

  /* ---------- Resources dropdown (hover on desktop, click/keyboard always) ---------- */
  function initDropdowns() {
    var items = document.querySelectorAll('.nav-item-has-menu');
    var desktop = window.matchMedia('(min-width: 961px)');

    items.forEach(function (item) {
      var trigger = item.querySelector('.nav-toggle-link');
      var menu = item.querySelector('.dropdown');
      if (!trigger || !menu) return;

      function open(state) {
        item.classList.toggle('is-open', state);
        trigger.setAttribute('aria-expanded', String(state));
      }

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        open(!item.classList.contains('is-open'));
      });

      item.addEventListener('mouseenter', function () { if (desktop.matches) open(true); });
      item.addEventListener('mouseleave', function () { if (desktop.matches) open(false); });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { open(false); trigger.focus(); }
      });

      document.addEventListener('click', function (e) {
        if (!item.contains(e.target)) open(false);
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initBurger() {
    var header = document.querySelector('.site-header');
    var burger = document.querySelector('.burger');
    if (!header || !burger) return;

    burger.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- Sticky header on scroll ---------- */
  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header || header.dataset.sticky === 'off') return;

    var threshold = 140;
    function onScroll() {
      header.classList.toggle('is-solid', window.scrollY > threshold);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Blog filter dropdowns ---------- */
  function initFilters() {
    var filters = document.querySelectorAll('.filter');
    if (!filters.length) return;

    filters.forEach(function (filter) {
      var btn = filter.querySelector('.filter-btn');
      var label = btn.querySelector('.filter-value');

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !filter.classList.contains('is-open');
        closeAll();
        filter.classList.toggle('is-open', willOpen);
        btn.setAttribute('aria-expanded', String(willOpen));
      });

      filter.querySelectorAll('.filter-menu button').forEach(function (option) {
        option.addEventListener('click', function () {
          filter.querySelectorAll('.filter-menu button').forEach(function (o) {
            o.setAttribute('aria-pressed', 'false');
          });
          option.setAttribute('aria-pressed', 'true');
          if (label) label.textContent = option.textContent.trim();
          closeAll();
          applyFilters();
        });
      });
    });

    function closeAll() {
      filters.forEach(function (f) {
        f.classList.remove('is-open');
        f.querySelector('.filter-btn').setAttribute('aria-expanded', 'false');
      });
    }
    document.addEventListener('click', closeAll);

    /* Client-side filtering over data-* attributes on the cards. */
    function applyFilters() {
      var active = {};
      filters.forEach(function (f) {
        var key = f.dataset.filter;
        var chosen = f.querySelector('.filter-menu button[aria-pressed="true"]');
        active[key] = chosen ? chosen.dataset.value : 'all';
      });

      var visible = 0;
      document.querySelectorAll('[data-post]').forEach(function (card) {
        var show = Object.keys(active).every(function (key) {
          return active[key] === 'all' || (card.dataset[key] || '') === active[key];
        });
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      var counter = document.querySelector('[data-post-count]');
      if (counter) counter.textContent = visible + (visible === 1 ? ' article' : ' articles');

      var empty = document.querySelector('[data-empty-state]');
      if (empty) empty.hidden = visible !== 0;
    }
  }

  /* ---------- Article: reading progress + TOC scrollspy ---------- */
  function initArticle() {
    var prose = document.querySelector('.prose');
    if (!prose) return;

    var bar = document.querySelector('.progress-bar');
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc-list a'));
    var targets = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    function onScroll() {
      if (bar) {
        var start = prose.offsetTop;
        var span = prose.offsetHeight - window.innerHeight;
        var pct = span > 0 ? ((window.scrollY - start) / span) * 100 : 0;
        bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
      }

      var current = targets[0];
      targets.forEach(function (t) {
        if (t.getBoundingClientRect().top <= 160) current = t;
      });
      links.forEach(function (a) {
        a.classList.toggle('is-active', current && a.getAttribute('href') === '#' + current.id);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Newsletter forms (front-end only — wire to your ESP) ---------- */
  function initForms() {
    document.querySelectorAll('form[data-subscribe]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var note = form.querySelector('.form-note');
        var input = form.querySelector('input[type="email"]');
        if (!note || !input) return;
        note.textContent = 'Thanks — check ' + input.value + ' to confirm your subscription.';
        note.classList.add('is-ok');
        form.reset();
      });
    });
  }

  /* ---------- Year stamp ---------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDropdowns();
    initBurger();
    initStickyHeader();
    initFilters();
    initArticle();
    initForms();
    initYear();
  });
})();
