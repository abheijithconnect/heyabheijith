/* =========================================================
   Abhijith T — portfolio interactions
   ========================================================= */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var EMAIL = 'abhijithprapoyil@gmail.com';
  // pages inside /work/ load "../styles.css", so links in the quick menu need the same prefix
  var css = document.querySelector('link[href$="styles.css"]');
  var base = css ? css.getAttribute('href').replace('styles.css', '') : '';
  var onHome = !!document.getElementById('about');
  var touch = window.matchMedia('(hover: none)').matches;

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 20); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- toast ---------- */
  var toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var toastTimer;
  var say = function (msg) {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  };

  /* ---------- responsive type: letters gain weight near the cursor ----------
     Manrope is a variable font, so every letter can take its own weight, from light to semibold. */
  var esc = function (c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c; };
  var split = function (el) {
    el.innerHTML = el.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch">' + esc(c) + '</span>'; }).join('') + '</span>';
    }).join(' ');
  };
  var pointer = { x: -9999, y: -9999, seen: 0 };
  window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = performance.now(); if (h1fx) h1fx.wake(); }, { passive: true });
  document.addEventListener('pointerleave', function () { pointer.x = pointer.y = -9999; });

  var smooth = function (k) { return k * k * (3 - 2 * k); };
  var h1fx = null;
  var h1 = document.querySelector('.hero__h1[data-vf]');
  if (h1 && !reduced) {
    h1.setAttribute('aria-label', [].map.call(h1.querySelectorAll(':scope > span'), function (s) { return s.textContent; }).join(' '));
    h1.querySelectorAll(':scope > span > span').forEach(split);
    var o = { wt: [300, 560], R: touch ? 0 : 190 };
    var chars = [].slice.call(h1.querySelectorAll('.ch')), n = chars.length;
    var wt = chars.map(function () { return o.wt[0]; });
    var t0 = performance.now(), raf1 = 0;
    var frame1 = function (now) {
      raf1 = 0;
      // one soft wave runs through the headline after it lands
      // (skipped on phones, where the headline wraps freely and heavier letters would reflow it)
      var s = (now - t0) / 1000 - 1.0, pos = innerWidth > 760 && s >= 0 && s < 1.6 ? s / 1.6 * (n + 12) - 6 : -99;
      var busy = pos > -99;
      for (var i = 0; i < n; i++) {
        var r = chars[i].getBoundingClientRect();
        var dx = r.left + r.width / 2 - pointer.x, dy = (r.top + r.height / 2 - pointer.y) * 1.4, d = Math.sqrt(dx * dx + dy * dy);
        var k = d < o.R ? smooth(1 - d / o.R) : 0;
        var w = pos > -99 ? Math.exp(-((i - pos) * (i - pos)) / 10) * 0.85 : 0;
        var v = Math.max(k, w);
        var b = o.wt[0] + (o.wt[1] - o.wt[0]) * v;
        wt[i] += (b - wt[i]) * 0.16;
        if (Math.abs(b - wt[i]) > 0.5) busy = true;
        chars[i].style.setProperty('--wt', wt[i].toFixed(1));
      }
      if (busy || performance.now() - pointer.seen < 300) h1fx.wake();
    };
    h1fx = { wake: function () { if (!raf1 && window.scrollY < innerHeight) raf1 = requestAnimationFrame(frame1); } };
    h1fx.wake();
  }

  /* ---------- light: photographs sit toned in the palette, and the cursor's trail brings back their colour ----------
     A small 2D canvas records where the light has been (it fades every frame);
     a WebGL shader uses it to mix the toned image with the original and to bend the image slightly at the trail's edges. */
  var VERT = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    'precision mediump float;varying vec2 uv;uniform sampler2D u_img,u_trail;uniform vec2 u_px;uniform float u_t;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){',
    '  float m=texture2D(u_trail,uv).r;',
    '  float dx=texture2D(u_trail,uv+vec2(u_px.x,0.)).r-texture2D(u_trail,uv-vec2(u_px.x,0.)).r;',
    '  float dy=texture2D(u_trail,uv+vec2(0.,u_px.y)).r-texture2D(u_trail,uv-vec2(0.,u_px.y)).r;',
    '  vec2 st=uv-vec2(dx,dy)*.035+sin(uv.yx*22.+u_t*1.3)*.0022*m;',
    '  vec3 c=texture2D(u_img,clamp(st,0.,1.)).rgb;',
    '  float l=dot(c,vec3(.299,.587,.114));l=l*l*(3.-2.*l);',
    '  vec3 duo=mix(vec3(.086,.063,.047),vec3(.70,.65,.59),l);',
    '  vec3 col=mix(duo,c,smoothstep(.04,.7,m));',
    '  col+=(hash(uv*vec2(731.,913.)+fract(u_t*.37))-.5)*.04;',
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  var Light = function (box) {
    var cv = document.createElement('canvas');
    var gl = cv.getContext('webgl', { antialias: false, alpha: false }) || cv.getContext('experimental-webgl');
    if (!gl) return;
    var sh = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var tex = function (unit) {
      var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return t;
    };
    var tImg = tex(0), tTrail = tex(1);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_img'), 0); gl.uniform1i(gl.getUniformLocation(prog, 'u_trail'), 1);
    var uT = gl.getUniformLocation(prog, 'u_t'), uPx = gl.getUniformLocation(prog, 'u_px');

    // where the light has been, at low resolution
    var TW = 180, TH = 180;
    var trail = document.createElement('canvas'), tc = trail.getContext('2d');
    var ready = false, raf = 0, visible = false, t0 = performance.now();
    var hand = null, last = null, lastTouch = 0;
    var hint = box.parentElement.querySelector('[data-hint]');

    var size = function () {
      var r = box.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      TH = Math.round(TW * r.height / r.width);
      trail.width = TW; trail.height = TH; tc.fillStyle = '#000'; tc.fillRect(0, 0, TW, TH);
      gl.uniform2f(uPx, 2 / TW, 2 / TH);
    };
    var dab = function (x, y, a) {
      var r = TW * 0.2, g = tc.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      tc.fillStyle = g; tc.beginPath(); tc.arc(x, y, r, 0, 6.2832); tc.fill();
    };
    var stroke = function (p, a) {
      // fill the gap between frames so fast moves still leave a continuous trail
      if (last) {
        var dx = p.x - last.x, dy = p.y - last.y, steps = Math.min(12, Math.ceil(Math.sqrt(dx * dx + dy * dy) / 6));
        for (var i = 1; i <= steps; i++) dab(last.x + dx * i / steps, last.y + dy * i / steps, a);
      } else dab(p.x, p.y, a);
      last = p;
    };
    var draw = function (now) {
      raf = 0;
      var t = (now - t0) / 1000;
      tc.globalCompositeOperation = 'source-over'; tc.fillStyle = 'rgba(0,0,0,.03)'; tc.fillRect(0, 0, TW, TH);
      tc.globalCompositeOperation = 'lighter';
      if (hand) { stroke(hand, 0.2); hand = null; }
      else if (!reduced && now - lastTouch > 2600) {
        // nobody is touching it: a slow light drifts across on its own
        last = null;
        dab(TW * (0.5 + 0.34 * Math.sin(t * 0.31)), TH * (0.46 + 0.3 * Math.sin(t * 0.47 + 1.1)), 0.075);
      } else last = null;
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tTrail);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trail);
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    var start = function () { if (ready && !raf && visible) raf = requestAnimationFrame(draw); };

    var move = function (e) {
      var r = box.getBoundingClientRect();
      hand = { x: (e.clientX - r.left) / r.width * TW, y: (e.clientY - r.top) / r.height * TH };
      lastTouch = performance.now();
      if (hint) hint.classList.add('is-gone');
      start();
    };
    box.addEventListener('pointermove', move);
    box.addEventListener('pointerdown', move);
    box.addEventListener('pointerleave', function () { last = null; });

    var pic = new Image();
    pic.onload = function () {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tImg);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pic);
      box.appendChild(cv); size(); ready = true;
      draw(performance.now());
      box.classList.add('is-live');
      start();
    };
    pic.src = box.getAttribute('data-light');
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (ready) { size(); draw(performance.now()); } }, 150); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }, { rootMargin: '100px' }).observe(box);
    else { visible = true; }
    document.addEventListener('visibilitychange', start);
  };
  document.querySelectorAll('[data-light]').forEach(Light);
  if (touch) document.querySelectorAll('[data-hint]').forEach(function (h) { h.textContent = 'Drag across the photo'; });

  /* ---------- silk: the hero art, brown satin folds catching copper light ----------
     A height field of slow, warped waves is lit like fabric (soft diffuse plus a narrow sheen).
     The cursor presses into it, and the folds ripple out from where it passes. */
  var SILK = [
    'precision highp float;uniform vec2 r;uniform float t;uniform vec2 m;uniform float mi;',
    'float H(vec2 p){',
    '  vec2 d=p-m;float k=exp(-dot(d,d)*.9)*mi;',
    '  p+=vec2(sin(p.y*1.6+t*.55),cos(p.x*1.25-t*.45))*.38;',
    '  p+=vec2(cos(p.y*2.4-t*.35),sin(p.x*2.1+t*.5))*.16;',
    '  float h=sin(p.x*2.6+p.y*1.4+t*.32)*.55+sin(p.x*1.05-p.y*2.3+t*.21)*.35+sin((p.x+p.y)*4.2-t*.4)*.08;',
    '  return h-k*.7+sin(length(d)*7.-t*2.6)*k*.08;',
    '}',
    'float g(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/r;float ar=r.x/r.y;vec2 p=vec2(uv.x*ar,uv.y)*3.;',
    '  float e=.01;',
    '  float hx=(H(p+vec2(e,0.))-H(p-vec2(e,0.)))/(2.*e),hy=(H(p+vec2(0.,e))-H(p-vec2(0.,e)))/(2.*e);',
    '  vec3 n=normalize(vec3(-hx*.42,-hy*.42,1.));',
    '  vec3 L=normalize(vec3(-.45,.65,.62));',
    '  float dif=max(dot(n,L),0.);',
    '  float spec=pow(max(dot(n,normalize(L+vec3(0.,0.,1.))),0.),26.);',
    '  float rim=pow(1.-n.z,1.6);',
    '  vec3 shadow=vec3(.075,.05,.038),body=vec3(.36,.19,.11),sheen=vec3(.98,.72,.50);',
    '  vec3 col=mix(shadow,body,smoothstep(.25,1.,dif));',
    '  col+=sheen*spec*.75+vec3(.55,.28,.15)*rim*.35;',
    '  col*=.78+.32*uv.y;',
    '  col=mix(col,vec3(.086,.063,.047),smoothstep(.55,1.15,length(uv-vec2(.5,.55))));',
    '  col+=(g(gl_FragCoord.xy+fract(t*7.3))-.5)*.03;',
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  var silk = document.querySelector('[data-silk]');
  if (silk) (function () {
    var card = silk.parentElement;
    var gl = silk.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) { silk.remove(); return; }
    var sh = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, SILK));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { silk.remove(); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uM = gl.getUniformLocation(prog, 'm'), uMi = gl.getUniformLocation(prog, 'mi');

    var tgt = { x: .5, y: .5, i: 0 }, cur = { x: .5, y: .5, i: 0 }, raf = 0, visible = true, t0 = performance.now(), ar = .8;
    var layers = card.querySelectorAll('[data-depth]');
    var size = function () {
      var b = card.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      silk.width = Math.round(b.width * dpr); silk.height = Math.round(b.height * dpr); ar = b.width / b.height;
      gl.viewport(0, 0, silk.width, silk.height); gl.uniform2f(uR, silk.width, silk.height);
    };
    var draw = function (now) {
      raf = 0;
      var t = reduced ? 8 : (now - t0) / 1000;
      // with no cursor around (phones, idle), a soft press wanders across the fabric on its own
      if (!tgt.i || touch) { tgt.x = .5 + .3 * Math.sin(t * .23); tgt.y = .5 + .28 * Math.sin(t * .31 + 1.3); }
      var want = tgt.i || (touch ? .7 : .45);
      // the press point trails the cursor, which is what makes the fabric feel heavy and liquid
      cur.x += (tgt.x - cur.x) * .05; cur.y += (tgt.y - cur.y) * .05; cur.i += (want - cur.i) * .04;
      gl.uniform1f(uT, t);
      gl.uniform2f(uM, cur.x * ar * 3, cur.y * 3); gl.uniform1f(uMi, cur.i);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    var start = function () { if (!raf) raf = requestAnimationFrame(draw); };
    card.addEventListener('pointermove', function (e) {
      var b = card.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      tgt.x = x; tgt.y = 1 - y; tgt.i = 1;
      // glass tags drift a little against the cursor, at different depths
      layers.forEach(function (l) {
        var k = +l.getAttribute('data-depth');
        l.style.setProperty('--px', ((.5 - x) * k).toFixed(1) + 'px'); l.style.setProperty('--py', ((.5 - y) * k).toFixed(1) + 'px');
      });
      start();
    });
    card.addEventListener('pointerleave', function () {
      tgt.i = 0;
      layers.forEach(function (l) { l.style.setProperty('--px', '0px'); l.style.setProperty('--py', '0px'); });
    });
    size(); draw(performance.now());
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); draw(performance.now()); }, 150); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(card);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
  })();

  /* ---------- about: the story lights up word by word as you scroll ---------- */
  var lit = document.querySelector('[data-lit]');
  if (lit && !reduced) {
    lit.querySelectorAll('p').forEach(function (p) {
      // the inline label stays as it is; only the words after it light up
      var lbl = p.querySelector('.lbl'), keep = lbl ? lbl.outerHTML + ' ' : '';
      var text = (lbl ? p.textContent.replace(lbl.textContent, '') : p.textContent).trim();
      p.innerHTML = keep + text.split(' ').map(function (w) { return '<span class="lw">' + esc(w) + '</span>'; }).join(' ');
    });
    var words = [].slice.call(lit.querySelectorAll('.lw')), shown = -1, lt = 0;
    var light = function () {
      lt = 0;
      var r = lit.getBoundingClientRect(), vh = innerHeight;
      // starts as the text enters the lower part of the screen, done by the time it reaches the upper third
      var p = (vh * 0.88 - r.top) / (r.height + vh * 0.88 - vh * 0.38);
      var upto = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      if (upto === shown) return;
      words.forEach(function (w, i) { w.classList.toggle('on', i < upto); });
      shown = upto;
    };
    window.addEventListener('scroll', function () { if (!lt) lt = requestAnimationFrame(light); }, { passive: true });
    window.addEventListener('resize', light);
    light();
  }

  /* ---------- contact: copy the address on click, with a label that follows the cursor ---------- */
  var mail = document.getElementById('mail'), pill = document.getElementById('pill');
  if (mail && pill && !touch) {
    mail.addEventListener('pointermove', function (e) { pill.style.left = e.clientX + 'px'; pill.style.top = e.clientY + 'px'; pill.classList.add('is-on'); });
    mail.addEventListener('pointerleave', function () { pill.classList.remove('is-on'); setTimeout(function () { pill.textContent = 'Copy email'; }, 250); });
    mail.addEventListener('click', function (e) {
      if (!navigator.clipboard) return;   // no clipboard: let mailto open
      e.preventDefault();
      navigator.clipboard.writeText(EMAIL).then(function () { pill.textContent = 'Copied'; say('Email copied'); }, function () { window.location.href = 'mailto:' + EMAIL; });
    });
  }

  /* ---------- client wall: a soft light follows the cursor ---------- */
  var wall = document.getElementById('wall');
  if (wall) {
    wall.addEventListener('pointermove', function (e) {
      var b = wall.getBoundingClientRect();
      wall.style.setProperty('--mx', (e.clientX - b.left) + 'px');
      wall.style.setProperty('--my', (e.clientY - b.top) + 'px');
    });
    wall.addEventListener('pointerleave', function () { wall.style.setProperty('--mx', '-999px'); wall.style.setProperty('--my', '-999px'); });
  }

  /* ---------- quick menu: Ctrl K / Cmd K on every page ---------- */
  var go = function (href) {
    return function () {
      var hash = href.split('#')[1];
      if (onHome && hash) { document.getElementById(hash).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); history.replaceState(null, '', '#' + hash); }
      else window.location.href = base + href;
    };
  };
  var open = function (url) { return function () { window.open(url, '_blank', 'noopener'); }; };
  var ITEMS = [
    { g: 'Work', label: 'The Legacy Primo', hint: 'Silverglades', run: go('work/legacy-primo.html') },
    { g: 'Work', label: 'J 36', hint: 'J Estates', run: go('work/j-36.html') },
    { g: 'Work', label: 'Bloom Maternity', hint: 'CARE Hospitals', run: go('work/care-hospitals.html') },
    { g: 'Work', label: 'All work', hint: 'Index', run: go('work.html') },
    { g: 'Go to', label: 'Home', hint: '', run: go('index.html') },
    { g: 'Go to', label: 'About', hint: 'Story and capabilities', run: go('index.html#about') },
    { g: 'Go to', label: 'Clients', hint: 'Brands and agencies', run: go('index.html#clients') },
    { g: 'Go to', label: 'Contact', hint: '', run: go('index.html#contact') },
    { g: 'Connect', label: 'Copy email address', hint: EMAIL, run: function () {
        var done = function () { say('Email copied'); };
        if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, function () { say(EMAIL); }); else say(EMAIL);
      } },
    { g: 'Connect', label: 'Write an email', hint: 'Opens your mail app', run: function () { window.location.href = 'mailto:' + EMAIL; } },
    { g: 'Connect', label: 'LinkedIn', hint: 'in/abheijith', run: open('https://www.linkedin.com/in/abheijith') },
    { g: 'Connect', label: 'WhatsApp', hint: '+91 88482 32086', run: open('https://wa.me/918848232086') },
    { g: 'Connect', label: 'Download resume', hint: 'PDF', run: function () { var a = document.createElement('a'); a.href = base + 'assets/abhijith-t-cv.pdf'; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); } }
  ];

  // touch screens have no shortcut to show, so they get a search glyph instead
  var keyLabel = touch
    ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
    : (isMac ? '⌘K' : 'Ctrl K');
  document.querySelectorAll('[data-kbd]').forEach(function (k) { k.innerHTML = keyLabel; });

  var pal = document.createElement('div');
  pal.className = 'cmdk'; pal.hidden = true;
  pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-modal', 'true'); pal.setAttribute('aria-label', 'Quick menu');
  pal.innerHTML =
    '<div class="cmdk__box">' +
      '<div class="cmdk__top"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      '<input class="cmdk__in" type="text" placeholder="Search work, pages and contact" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-label="Search"></div>' +
      '<div class="cmdk__list" id="cmdk-list" role="listbox"></div>' +
      '<div class="cmdk__foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd>Move</span><span><kbd>&crarr;</kbd>Open</span><span><kbd>Esc</kbd>Close</span></div>' +
    '</div>';
  document.body.appendChild(pal);
  var input = pal.querySelector('.cmdk__in'), list = pal.querySelector('.cmdk__list');
  var shown = [], sel = 0, lastFocus = null;

  var render = function () {
    var q = input.value.trim().toLowerCase();
    shown = ITEMS.filter(function (it) { return !q || (it.label + ' ' + it.hint + ' ' + it.g).toLowerCase().indexOf(q) > -1; });
    if (sel >= shown.length) sel = Math.max(0, shown.length - 1);
    if (!shown.length) { list.innerHTML = '<p class="cmdk__empty">Nothing matches. Try “email” or “work”.</p>'; return; }
    var html = '', g = '';
    shown.forEach(function (it, i) {
      if (it.g !== g) { g = it.g; html += '<p class="cmdk__group">' + g + '</p>'; }
      html += '<button type="button" class="cmdk__item" role="option" id="cmdk-' + i + '" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span>' + it.label + '</span><small>' + it.hint + '</small></button>';
    });
    list.innerHTML = html;
    input.setAttribute('aria-activedescendant', 'cmdk-' + sel);
  };
  var move = function (n) {
    if (!shown.length) return;
    sel = (sel + n + shown.length) % shown.length;
    list.querySelectorAll('.cmdk__item').forEach(function (b) { b.setAttribute('aria-selected', +b.getAttribute('data-i') === sel); });
    var cur = list.querySelector('[data-i="' + sel + '"]'); if (cur) cur.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', 'cmdk-' + sel);
  };
  var openPal = function () {
    if (!pal.hidden) return;
    lastFocus = document.activeElement; input.value = ''; sel = 0; render();
    pal.hidden = false; document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { pal.classList.add('is-open'); input.focus(); });
  };
  var closePal = function () {
    pal.classList.remove('is-open'); document.body.style.overflow = '';
    setTimeout(function () { pal.hidden = true; }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  var runSel = function (i) { var it = shown[i]; if (!it) return; closePal(); setTimeout(it.run, 60); };

  input.addEventListener('input', function () { sel = 0; render(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); runSel(sel); }
    else if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? -1 : 1); }
  });
  list.addEventListener('click', function (e) { var b = e.target.closest('.cmdk__item'); if (b) runSel(+b.getAttribute('data-i')); });
  list.addEventListener('pointermove', function (e) { var b = e.target.closest('.cmdk__item'); if (b && +b.getAttribute('data-i') !== sel) move(+b.getAttribute('data-i') - sel); });
  pal.addEventListener('click', function (e) { if (e.target === pal) closePal(); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
    else if (e.key === 'Escape' && !pal.hidden) closePal();
  });

  // a small key in the nav opens it too, so touch visitors can use it
  var links = nav.querySelector('.nav__links');
  if (links) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'nav__cmdk'; btn.setAttribute('aria-label', 'Open quick menu');
    btn.innerHTML = '<kbd>' + keyLabel + '</kbd>';
    links.appendChild(btn);
  }
  document.querySelectorAll('[data-cmdk], .nav__cmdk').forEach(function (b) { b.addEventListener('click', openPal); });

  /* ---------- lightbox (case pages) ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbClose = lb.querySelector('.lightbox__close'), last = null;
    var openLb = function (src, alt) { last = document.activeElement; lbImg.src = src; lbImg.alt = alt || ''; lb.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(function () { lb.classList.add('is-open'); }); lbClose.focus(); };
    var closeLb = function () { lb.classList.remove('is-open'); document.body.style.overflow = ''; setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, 300); if (last) last.focus(); };
    document.querySelectorAll('[data-zoom]').forEach(function (el) {
      el.addEventListener('click', function () { var img = el.tagName === 'IMG' ? el : el.querySelector('img'); openLb(img.currentSrc || img.src, img.alt); });
    });
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  /* ---------- reveal on scroll ---------- */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!document.querySelector('.reveal.in')) els.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }
})();
