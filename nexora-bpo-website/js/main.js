/* NEXORA BPO - main script */
(function () {
  // ---------- Security: block right-click & inspect shortcuts ----------
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toUpperCase();
    if (e.keyCode === 123 ||
      (e.ctrlKey && e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) ||
      (e.ctrlKey && (k === 'U' || k === 'S')) ||
      (e.metaKey && e.altKey && (k === 'I' || k === 'J' || k === 'U'))) {
      e.preventDefault(); return false;
    }
  });
  document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });

  // ---------- Preloader ----------
  window.addEventListener('load', function () {
    var l = document.querySelector('.loader'); if (l) setTimeout(function () { l.classList.add('hide'); }, 300);
  });
  setTimeout(function () { var l = document.querySelector('.loader'); if (l) l.classList.add('hide'); }, 2500);

  // ---------- Page transitions ----------
  var curtain = document.querySelector('.page-curtain');
  document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || a.target === '_blank') return;
      e.preventDefault(); var href = a.getAttribute('href');
      if (curtain) curtain.classList.add('go');
      setTimeout(function () { window.location.href = href; }, 450);
    });
  });
  window.addEventListener('pageshow', function () { if (curtain) curtain.classList.remove('go'); });

  // ---------- Navbar ----------
  var nav = document.querySelector('.nav'), bar = document.querySelector('.progress'), topBtn = document.querySelector('.fab .top');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (topBtn) topBtn.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var burger = document.querySelector('.burger'), menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = !menu.classList.contains('open');
      menu.classList.toggle('open', open); burger.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      menu.querySelectorAll('a').forEach(function (a, i) { a.style.transitionDelay = open ? (0.15 + i * 0.05) + 's' : '0s'; });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100 && menu.classList.contains('open')) burger.click();
    });
  }
  var page = document.body.getAttribute('data-page');
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (a) {
    if (a.getAttribute('data-page') === page) a.classList.add('active');
  });

  // ---------- Ripple ----------
  document.querySelectorAll('.btn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), c = document.createElement('span');
      c.className = 'ripple'; c.style.width = c.style.height = s + 'px';
      c.style.left = (e.clientX - r.left - s / 2) + 'px'; c.style.top = (e.clientY - r.top - s / 2) + 'px';
      b.appendChild(c); setTimeout(function () { c.remove(); }, 700);
    });
  });

  // ---------- Reveal on scroll ----------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // ---------- Counters ----------
  var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return; co.unobserve(en.target);
      var el = en.target, end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '', t0 = null, dur = 2000;
      function step(t) {
        if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = (end % 1 ? v.toFixed(1) : Math.floor(v).toLocaleString('en-IN')) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(function (el) { co.observe(el); });

  // ---------- Card tilt + glow (desktop only) ----------
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.card.tilt').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
        c.style.transform = 'translateY(-10px) perspective(900px) rotateX(' + ((0.5 - y) * 8) + 'deg) rotateY(' + ((x - 0.5) * 8) + 'deg)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  // ---------- Testimonial slider ----------
  document.querySelectorAll('.slider').forEach(function (sl) {
    var track = sl.querySelector('.slides'), n = track.children.length, i = 0, wrap = sl.parentElement;
    var dots = wrap.querySelector('.dots-nav'), timer;
    for (var d = 0; d < n; d++) { var dot = document.createElement('i'); dot.dataset.i = d; dots.appendChild(dot); }
    function go(k) { i = (k + n) % n; track.style.transform = 'translateX(-' + i * 100 + '%)'; dots.querySelectorAll('i').forEach(function (x, j) { x.classList.toggle('on', j === i); }); }
    function auto() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 5500); }
    wrap.querySelector('.prev').addEventListener('click', function () { go(i - 1); auto(); });
    wrap.querySelector('.next').addEventListener('click', function () { go(i + 1); auto(); });
    dots.addEventListener('click', function (e) { if (e.target.dataset.i) { go(+e.target.dataset.i); auto(); } });
    var sx = 0; sl.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    sl.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); auto(); } });
    go(0); auto();
  });

  // ---------- FAQ ----------
  document.querySelectorAll('.faq-item').forEach(function (it) {
    it.querySelector('.faq-q').addEventListener('click', function () {
      var open = it.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (o) { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; });
      if (!open) { it.classList.add('open'); var a = it.querySelector('.faq-a'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  // ---------- Gallery filter + lightbox ----------
  var lb = document.querySelector('.lightbox');
  document.querySelectorAll('.gallery a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault(); if (!lb) return;
      lb.querySelector('img').src = a.getAttribute('href'); lb.classList.add('open');
    });
  });
  if (lb) lb.addEventListener('click', function (e) { if (e.target !== lb.querySelector('img')) lb.classList.remove('open'); });
  document.querySelectorAll('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.filters button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
      var f = b.dataset.f;
      document.querySelectorAll('.gallery a').forEach(function (a) { a.style.display = (f === 'all' || a.dataset.cat === f) ? '' : 'none'; });
    });
  });

  // ---------- Forms (offline demo: shows success + opens email) ----------
  document.querySelectorAll('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('.form-msg'); if (msg) msg.classList.add('show');
      f.reset(); setTimeout(function () { if (msg) msg.classList.remove('show'); }, 6000);
    });
  });
  document.querySelectorAll('[data-apply]').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = document.querySelector('#position'); if (s) s.value = b.getAttribute('data-apply');
    });
  });

  var y = document.querySelector('#year'); if (y) y.textContent = new Date().getFullYear();
})();
