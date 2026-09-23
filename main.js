/* =========================================================
   Abhijith T — portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  function showAll() { revealables.forEach(function (el) { el.classList.add('is-in'); }); }

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach(function (el) { io.observe(el); });

    // Fail-safe: never leave the page blank if the observer does not fire.
    setTimeout(function () {
      if (!document.querySelector('.reveal.is-in')) showAll();
    }, 2500);
  } else {
    showAll();
  }

  /* ---------- nav: solid after scroll, hide on scroll down ---------- */
  var nav = document.getElementById('nav');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 30);

    var menuOpen = document.body.classList.contains('is-locked');
    nav.classList.toggle('is-hidden', y > 400 && y > lastY && !menuOpen);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('is-locked', open);
    };
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- skill tabs ---------- */
  var tabs = document.querySelectorAll('.tab');
  var ink = document.getElementById('tabink');
  function moveInk(btn) {
    if (!ink || !btn) return;
    ink.style.width = btn.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
  }
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
        var panel = document.getElementById(b.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-active', on); }
      });
      moveInk(btn);
    });
  });
  function inkToActive() { moveInk(document.querySelector('.tab.is-active')); }
  window.addEventListener('load', inkToActive);
  window.addEventListener('resize', inkToActive);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(inkToActive);

  /* ---------- gold sheen on work rows follows the pointer ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.wrow').forEach(function (row) {
      row.addEventListener('mousemove', function (e) {
        var r = row.getBoundingClientRect();
        row.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        row.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- "View" cursor over project rows ---------- */
  var vc = document.getElementById('viewcursor');
  if (vc && finePointer && !reduced) {
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    var follow = function () {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      vc.style.left = cx + 'px';
      vc.style.top = cy + 'px';
      if (running) requestAnimationFrame(follow);
    };
    document.querySelectorAll('[data-view]').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) {
        tx = cx = e.clientX; ty = cy = e.clientY;
        vc.classList.add('is-on');
        if (!running) { running = true; follow(); }
      });
      el.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
      el.addEventListener('mouseleave', function () { vc.classList.remove('is-on'); running = false; });
    });
  }

  /* ---------- lightbox (case study pages) ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbClose = lb.querySelector('.lightbox__close');
    var lastFocus = null;
    var openLb = function (src, alt) {
      lastFocus = document.activeElement;
      lbImg.src = src; lbImg.alt = alt || '';
      lb.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      lbClose.focus();
    };
    var closeLb = function () {
      lb.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, 300);
      if (lastFocus) lastFocus.focus();
    };
    document.querySelectorAll('[data-zoom]').forEach(function (el) {
      el.addEventListener('click', function () {
        var img = el.tagName === 'IMG' ? el : el.querySelector('img');
        openLb(img.currentSrc || img.src, img.alt);
      });
    });
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  /* ---------- footer: live IST clock + year ---------- */
  var clock = document.getElementById('clock');
  if (clock) {
    var tick = function () {
      clock.textContent = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit'
      }) + ' IST, local time';
    };
    tick();
    setInterval(tick, 30000);
  }
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
