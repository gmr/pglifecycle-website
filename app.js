/* ============================================================
   pglifecycle — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---- Opt into JS-driven reveals (base markup stays visible without JS) ---- */
  document.documentElement.classList.add('js');

  /* ---- Sticky nav state ---- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal ---- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Verb tabs ---- */
  var verbTabs = [].slice.call(document.querySelectorAll('.verb-tab'));
  var verbPanels = [].slice.call(document.querySelectorAll('.verb-panel'));
  verbTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var v = tab.getAttribute('data-verb');
      verbTabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      verbPanels.forEach(function (p) {
        var on = p.getAttribute('data-panel') === v;
        p.classList.toggle('active', on);
        if (on) {
          p.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('in'); });
        }
      });
    });
  });

  /* ---- Real-content tabs ---- */
  var realTabs = [].slice.call(document.querySelectorAll('.real-tab'));
  var realPanels = [].slice.call(document.querySelectorAll('.real-panel'));
  realTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var v = tab.getAttribute('data-real');
      realTabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      realPanels.forEach(function (p) {
        var on = p.getAttribute('data-realpanel') === v;
        p.classList.toggle('active', on);
        if (on) {
          p.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('in'); });
        }
      });
    });
  });

  /* ---- Copy buttons ---- */
  function flash(btn) {
    var orig = btn.textContent;
    btn.textContent = 'copied ✓';
    btn.classList.add('copied');
    setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 1400);
  }
  function copyText(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(btn); }).catch(function () { fallback(text, btn); });
    } else { fallback(text, btn); }
  }
  function fallback(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); flash(btn); } catch (e) {}
    document.body.removeChild(ta);
  }
  [].slice.call(document.querySelectorAll('.copy-btn')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var direct = btn.getAttribute('data-copy');
      if (direct) { copyText(direct, btn); return; }
      var elId = btn.getAttribute('data-copy-el');
      if (elId) {
        var el = document.getElementById(elId);
        if (el) { copyText(el.innerText.trim(), btn); }
      }
    });
  });

  /* ---- Round-trip pipeline: sequential light-up when in view ---- */
  var pipeline = document.getElementById('pipeline');
  var steps = pipeline ? [].slice.call(pipeline.querySelectorAll('.pstep')) : [];
  var played = false;
  function playPipeline() {
    if (played || !steps.length) return;
    played = true;
    steps.forEach(function (s, i) {
      setTimeout(function () {
        steps.forEach(function (x) { x.classList.remove('lit'); });
        s.classList.add('lit');
        if (i === steps.length - 1) {
          setTimeout(function () { s.classList.remove('lit'); }, 600);
        }
      }, 360 * i);
    });
  }
  if (pipeline && 'IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { playPipeline(); pio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    pio.observe(pipeline);
  }

  /* ---- Dependency graph: draw edges when in view ---- */
  var graph = document.getElementById('graph');
  if (graph && 'IntersectionObserver' in window) {
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { graph.classList.add('in-view'); gio.unobserve(e.target); } });
    }, { threshold: 0.3 });
    gio.observe(graph);
  } else if (graph) {
    graph.classList.add('in-view');
  }

  /* ---- Active nav link on scroll ---- */
  var sections = ['problem', 'commands', 'proof', 'graph', 'different', 'internals'];
  var navLinks = {};
  [].slice.call(document.querySelectorAll('.nav-links a')).forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#') navLinks[href.slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = e.target.id;
        if (navLinks[id]) {
          if (e.isIntersecting) {
            Object.keys(navLinks).forEach(function (k) { navLinks[k].style.color = ''; });
            navLinks[id].style.color = 'var(--pg)';
          }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (id) { var el = document.getElementById(id); if (el) sio.observe(el); });
  }
})();
