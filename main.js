/* =========================================================
   Abhijith T — portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- intro ---------- */
  var intro = document.getElementById('intro');
  function endIntro() {
    if (!intro || intro.classList.contains('is-done')) return;
    intro.classList.add('is-done');
    document.body.classList.add('intro-done');
    setTimeout(function () { intro.remove(); }, 800);
  }
  // Case study pages have no intro overlay.
  if (!intro) {
    document.body.classList.add('intro-done');
  } else if (reduced) {
    endIntro();
  } else {
    setTimeout(endIntro, 1500);
    intro.addEventListener('click', endIntro);
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  function show(el, delay) {
    if (el.classList.contains('is-in')) return;
    el.style.transitionDelay = (delay || 0) + 'ms';
    el.classList.add('is-in');
  }
  function showAll() { revealables.forEach(function (el) { show(el, 0); }); }

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // stagger within a batch, but never make anyone wait long
        show(e.target, Math.min(n++ * 70, 350));
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });

    // Fail-safe: if the observer never fires (background tab, odd browser),
    // nothing on the page would ever be visible. Reveal everything after 2.5s.
    setTimeout(function () {
      if (!document.querySelector('.reveal.is-in')) showAll();
    }, 2500);
  } else {
    showAll();
  }

  /* ---------- nav: stick + hide on scroll down ---------- */
  var nav = document.getElementById('nav');
  var lastY = window.scrollY;

  /* ---------- image parallax ---------- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  function applyParallax() {
    if (reduced) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      var amount = parseFloat(el.dataset.parallax) || 0.05;
      // -1 (below fold) .. 1 (above fold)
      var progress = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2);
      var img = el.querySelector('img');
      if (img) img.style.setProperty('--py', (progress * amount * rect.height).toFixed(1) + 'px');
    });
  }

  var alwaysStuck = document.body.classList.contains('is-case');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', alwaysStuck || y > 40);
    if (y > 320 && y > lastY && !document.body.classList.contains('is-locked')) {
      nav.classList.add('is-hidden');
    } else {
      nav.classList.remove('is-hidden');
    }
    lastY = y;
    applyParallax();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', applyParallax);
  applyParallax();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function closeMenu() {
    burger.classList.remove('is-open');
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- marquee + ticker: duplicate the set for a seamless loop ---------- */
  ['mtrack', 'ticker'].forEach(function (id) {
    var track = document.getElementById(id);
    if (!track) return;
    var set = track.firstElementChild;
    if (set) track.appendChild(set.cloneNode(true));
  });

  /* ---------- counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var dur = 1400;
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min((now - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        runCount(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- capability tabs ---------- */
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.panel');
  var ink = document.getElementById('tabink');
  function moveInk(btn) {
    if (!ink || !btn) return;
    ink.style.width = btn.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
  }
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      panels.forEach(function (p) { p.classList.remove('is-active'); });
      var panel = document.getElementById(btn.dataset.tab);
      if (panel) {
        // restart the stagger animation
        panel.querySelectorAll('.skills li').forEach(function (li) {
          li.style.animation = 'none';
          void li.offsetWidth;
          li.style.animation = '';
        });
        panel.classList.add('is-active');
      }
      moveInk(btn);
    });
  });
  window.addEventListener('load', function () { moveInk(document.querySelector('.tab.is-active')); });
  window.addEventListener('resize', function () { moveInk(document.querySelector('.tab.is-active')); });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbimg');
  var lbClose = document.getElementById('lbclose');
  var lastFocus = null;

  function openLb(src, alt) {
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    lbClose.focus();
  }
  function closeLb() {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () { lb.hidden = true; lbImg.src = ''; }, 350);
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('.shot').forEach(function (fig) {
    fig.addEventListener('click', function () {
      var img = fig.querySelector('img');
      openLb(fig.dataset.full || img.src, img.alt);
    });
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lb.hidden) closeLb();
  });

  /* ---------- custom cursor ---------- */
  var cursor = document.getElementById('cursor');
  if (cursor && finePointer && !reduced) {
    var cx = 0, cy = 0, mx = 0, my = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('is-on');
    });
    (function ride() {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(ride);
    })();
    document.querySelectorAll('a, button, .logo, .skills li, .shot').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  /* ---------- footer clock (IST) ---------- */
  var clock = document.getElementById('clock');
  if (clock) {
    var tick = function () {
      clock.textContent = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit'
      }) + ' IST';
    };
    tick();
    setInterval(tick, 20000);
  }
})();
