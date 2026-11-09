/* Адвокат Иргизбаева Д.К. - сцена зала суда, табличка, плиты */
(function () {
  'use strict';

  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 900px)');
  var isMobile = function () { return mqMobile.matches; };
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
    gsap.defaults({ ease: 'power3.out', duration: 0.4 });
    CustomEaseFallback();
  }
  function CustomEaseFallback() {
    /* одна кривая на сайт: cubic-bezier(.2,.7,.2,1) - задаём через CSS, GSAP берёт ближайшую power3 */
  }

  /* ---------- Lenis: плавная прокрутка ---------- */
  var lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, lerp: 0.1 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  var hdrH = function () { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 76; };
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: -hdrH() + 1, duration: 1.2 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - hdrH() + 1, behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
    history.replaceState(null, '', '#' + id);
  });

  /* ---------- Шапка и меню ---------- */
  var hdr = document.getElementById('hdr');
  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');
  function onScrollHdr() { hdr.classList.toggle('is-scrolled', window.pageYOffset > 24); }
  window.addEventListener('scroll', onScrollHdr, { passive: true });
  onScrollHdr();
  function closeMenu() {
    if (!mnav || mnav.hidden) return;
    mnav.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    hdr.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    if (lenis) lenis.start();
  }
  if (burger) burger.addEventListener('click', function () {
    var open = mnav.hidden;
    mnav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    hdr.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ---------- WhatsApp: тексты ---------- */
  var WA_BASE = 'Здравствуйте, Динара Кабденовна. Нужна консультация адвоката.';
  function waHref(topic) {
    var t = topic ? WA_BASE + '\nВопрос: ' + topic + '\nМоя ситуация: ' : WA_BASE + ' Моя ситуация: ';
    return 'https://wa.me/77782580086?text=' + encodeURIComponent(t);
  }
  Array.prototype.forEach.call(document.querySelectorAll('a[data-wa]'), function (a) {
    a.href = waHref(a.getAttribute('data-wa') || '');
  });

  /* ---------- Форма -> WhatsApp ---------- */
  var form = document.getElementById('leadForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (document.getElementById('fName').value || '').trim();
    var phone = (document.getElementById('fPhone').value || '').trim();
    var msg = (document.getElementById('fMsg').value || '').trim();
    var ph = document.getElementById('fPhone');
    if (phone.replace(/\D/g, '').length < 10) { ph.focus(); ph.setCustomValidity('Введите номер телефона'); ph.reportValidity(); return; }
    ph.setCustomValidity('');
    var text = 'Здравствуйте, Динара Кабденовна. Меня зовут ' + (name || '-') + ', телефон ' + phone + '. Ситуация: ' + (msg || '-');
    window.open('https://wa.me/77782580086?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  /* ---------- Проявление блоков ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  Array.prototype.forEach.call(document.querySelectorAll('.rv:not(.hero .rv)'), function (el) { io.observe(el); });

  /* ---------- Заголовки: строки выезжают ---------- */
  function splitHeads() {
    if (!hasGsap || typeof SplitText === 'undefined' || reduce) {
      Array.prototype.forEach.call(document.querySelectorAll('.split'), function (h) { h.classList.add('is-in'); });
      return;
    }
    Array.prototype.forEach.call(document.querySelectorAll('.split:not(.h1)'), function (h) {
      var sp = new SplitText(h, { type: 'lines', linesClass: 'ln' });
      var inner = sp.lines.map(function (l) { var s = document.createElement('span'); s.innerHTML = l.innerHTML; l.innerHTML = ''; l.appendChild(s); return s; });
      gsap.set(inner, { yPercent: 108 });
      ScrollTrigger.create({
        trigger: h, start: 'top 86%', once: true,
        onEnter: function () { gsap.to(inner, { yPercent: 0, duration: 1, stagger: 0.09, ease: 'power3.out' }); }
      });
    });
  }

  /* ---------- Герой: интро и камера ---------- */
  var hero = document.getElementById('hero');
  var heroWrap = document.getElementById('heroWrap');
  var npBody = document.getElementById('npBody');

  function heroIntro() {
    var rvs = Array.prototype.slice.call(hero.querySelectorAll('.rv'));
    var h1 = hero.querySelector('.h1');
    var tl = hasGsap && !reduce ? gsap.timeline({ delay: 0.15 }) : null;

    if (tl && typeof SplitText !== 'undefined') {
      var sp = new SplitText(h1, { type: 'lines', linesClass: 'ln' });
      var inner = sp.lines.map(function (l) { var s = document.createElement('span'); s.innerHTML = l.innerHTML; l.innerHTML = ''; l.appendChild(s); return s; });
      gsap.set(inner, { yPercent: 110 });
      tl.to(inner, { yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out' }, 0.35);
    } else if (h1) { h1.classList.add('is-in'); }

    rvs.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('is-in'); }, reduce ? 0 : 250 + i * 140);
    });

    /* табличка: ПРОКУРОР -> АДВОКАТ */
    if (npBody) {
      if (reduce || !hasGsap) { npBody.style.transform = 'rotateX(-180deg)'; }
      else {
        gsap.set(npBody, { rotateX: 0, y: 24, opacity: 0 });
        tl.to(npBody, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.1);
        tl.to(npBody, { rotateX: -180, duration: 1.25, ease: 'power3.inOut' }, 1.5);
      }
    }
  }

  var heroPan = null;
  function setupHeroPan() {
    if (heroPan) { heroPan.kill(); heroPan = null; }
    hero.style.setProperty('--pan', '-1');
    if (!hasGsap || isMobile() || reduce) { if (isMobile()) hero.style.setProperty('--pan', '0'); return; }
    heroPan = ScrollTrigger.create({
      trigger: heroWrap, start: 'top top', end: 'bottom bottom', scrub: 0.6,
      onUpdate: function (self) {
        var p = self.progress;
        var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        hero.style.setProperty('--pan', String(-1 + eased * 2));
      }
    });
  }

  /* пауза анимаций сцены вне экрана */
  new IntersectionObserver(function (en) { hero.classList.toggle('is-off', !en[0].isIntersecting); }, { threshold: 0 }).observe(hero);

  /* ---------- Плиты: --enter / --stay / --exit и переворот табличек ---------- */
  var plateTriggers = [];
  function setupPlates() {
    plateTriggers.forEach(function (t) { t.kill(); });
    plateTriggers = [];
    var plates = Array.prototype.slice.call(document.querySelectorAll('.plate'));
    plates.forEach(function (p) { p.style.setProperty('--enter', '1'); p.style.setProperty('--stay', '0'); p.style.setProperty('--exit', '0'); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-flip]'), function (f) { f.style.setProperty('--flip', '0'); });
    if (!hasGsap) { Array.prototype.forEach.call(document.querySelectorAll('[data-flip]'), function (f) { f.style.setProperty('--flip', '1'); }); return; }

    var wraps = Array.prototype.slice.call(document.querySelectorAll('.pw[data-plate]'));
    var mobile = isMobile();

    wraps.forEach(function (w) {
      var plate = w.querySelector('.plate');
      var idx = plates.indexOf(plate);
      var prev = idx > 0 ? plates[idx - 1] : null;
      var flips = Array.prototype.slice.call(plate.querySelectorAll('[data-flip]'));

      if (!mobile) {
        plateTriggers.push(ScrollTrigger.create({
          trigger: w, start: 'top bottom', end: 'top top', scrub: true,
          onUpdate: function (self) {
            plate.style.setProperty('--enter', self.progress.toFixed(4));
            if (prev) prev.style.setProperty('--exit', self.progress.toFixed(4));
          }
        }));
        plateTriggers.push(ScrollTrigger.create({
          trigger: w, start: 'top top', end: 'bottom bottom', scrub: true,
          onUpdate: function (self) {
            var s = self.progress;
            plate.style.setProperty('--stay', s.toFixed(4));
            flips.forEach(function (f) {
              var k = parseFloat(f.style.getPropertyValue('--k') || getComputedStyle(f).getPropertyValue('--k')) || 0;
              f.style.setProperty('--flip', clamp(s * 2.4 - k * 0.5, 0, 1).toFixed(4));
            });
          }
        }));
      } else {
        plateTriggers.push(ScrollTrigger.create({
          trigger: plate, start: 'top bottom', end: 'top 55%', scrub: true,
          onUpdate: function (self) { plate.style.setProperty('--enter', self.progress.toFixed(4)); }
        }));
        flips.forEach(function (f) {
          plateTriggers.push(ScrollTrigger.create({
            trigger: f, start: 'top 88%', end: 'top 42%', scrub: true,
            onUpdate: function (self) { f.style.setProperty('--flip', self.progress.toFixed(4)); }
          }));
        });
      }
    });

    /* карточки плиты «прокурор» переворачиваются и по касанию */
    Array.prototype.forEach.call(document.querySelectorAll('.tp'), function (tp) {
      tp.addEventListener('click', function () {
        var cur = parseFloat(tp.style.getPropertyValue('--flip')) || 0;
        tp.style.setProperty('--flip', cur > 0.5 ? '0' : '1');
      });
    });
  }

  /* ---------- Линия шагов ---------- */
  function setupSteps() {
    var steps = document.querySelector('.steps');
    if (!steps) return;
    if (!hasGsap) { steps.style.setProperty('--draw', '1'); return; }
    ScrollTrigger.create({
      trigger: steps, start: 'top 78%', end: 'bottom 70%', scrub: 0.5,
      onUpdate: function (self) { steps.style.setProperty('--draw', self.progress.toFixed(4)); }
    });
  }

  /* ---------- Счётчики ---------- */
  function setupCounters() {
    var nums = document.querySelectorAll('.num[data-count]');
    if (!nums.length) return;
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, target = parseInt(el.getAttribute('data-count'), 10);
        if (reduce) { el.textContent = target; return; }
        var t0 = null, dur = 1400;
        (function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * e);
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(nums, function (n) { cio.observe(n); });
  }

  /* ---------- Циферблат 24/7 ---------- */
  (function dial() {
    var g = document.querySelector('.dial-ticks');
    if (!g) return;
    var html = '';
    for (var i = 0; i < 60; i++) {
      var a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
      var r1 = big ? 142 : 150, r2 = 160;
      html += '<line x1="' + (200 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (200 - Math.cos(a) * r1).toFixed(1) + '" x2="' + (200 + Math.sin(a) * r2).toFixed(1) + '" y2="' + (200 - Math.cos(a) * r2).toFixed(1) + '" stroke-width="' + (big ? 1.6 : 0.8) + '"/>';
    }
    g.innerHTML = html;
  })();

  /* ---------- Лента отзывов ---------- */
  (function reviews() {
    var track = document.getElementById('revTrack');
    var prev = document.getElementById('revPrev');
    var next = document.getElementById('revNext');
    if (!track || !prev || !next) return;
    function step() {
      var card = track.querySelector('.rev');
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 18;
      return card ? card.getBoundingClientRect().width + gap : 400;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      var fits = max <= 2;
      prev.hidden = fits; next.hidden = fits;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---------- Язык: RU / KZ ---------- */
  var RU = {};
  var i18nEls = document.querySelectorAll('[data-i18n]');
  Array.prototype.forEach.call(i18nEls, function (el) { var k = el.getAttribute('data-i18n'); if (!(k in RU)) RU[k] = el.textContent; });
  var ariaEls = document.querySelectorAll('[data-i18n-aria]');
  var RUA = {};
  Array.prototype.forEach.call(ariaEls, function (el) { RUA[el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label'); });

  function applyDict(dict, lang) {
    Array.prototype.forEach.call(i18nEls, function (el) {
      var k = el.getAttribute('data-i18n');
      var v = dict[k];
      if (v == null) return;
      if (el.classList.contains('split') || el.classList.contains('h1')) { el.textContent = v; el.classList.add('is-in'); }
      else el.textContent = v;
    });
    Array.prototype.forEach.call(ariaEls, function (el) {
      var k = el.getAttribute('data-i18n-aria');
      if (dict[k]) el.setAttribute('aria-label', dict[k]);
    });
    document.documentElement.lang = lang;
    Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (hasGsap) ScrollTrigger.refresh();
  }
  function loadKK(cb) {
    if (window.SITE_KK) { cb(window.SITE_KK); return; }
    var v = (document.currentScript && document.currentScript.src.split('?v=')[1]) || (function () { var s = document.querySelector('script[src*="script.js"]'); return s ? (s.src.split('?v=')[1] || '') : ''; })();
    var sc = document.createElement('script');
    sc.src = 'assets/lang/kk.js' + (v ? '?v=' + v : '');
    sc.onload = function () { cb(window.SITE_KK || {}); };
    document.head.appendChild(sc);
  }
  function setLang(lang, save) {
    if (lang === 'kk') loadKK(function (d) { applyDict(d, 'kk'); });
    else applyDict(Object.assign({}, RU), 'ru');
    Array.prototype.forEach.call(ariaEls, function (el) { if (lang === 'ru') el.setAttribute('aria-label', RUA[el.getAttribute('data-i18n-aria')]); });
    if (save) { try { localStorage.setItem('lang', lang); } catch (e) {} }
  }
  Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
  });
  (function initLang() {
    var q = new URLSearchParams(location.search).get('lang');
    var saved = null; try { saved = localStorage.getItem('lang'); } catch (e) {}
    var lang = q === 'kk' || q === 'ru' ? q : (saved === 'kk' ? 'kk' : 'ru');
    if (lang === 'kk') setLang('kk', false);
  })();

  /* ---------- Старт ---------- */
  function init() {
    heroIntro();
    splitHeads();
    setupHeroPan();
    setupPlates();
    setupSteps();
    setupCounters();
    if (hasGsap) {
      ScrollTrigger.refresh();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
  }
  var lastMobile = isMobile();
  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      if (isMobile() !== lastMobile) { lastMobile = isMobile(); setupHeroPan(); setupPlates(); }
      if (hasGsap) ScrollTrigger.refresh();
    }, 150);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
