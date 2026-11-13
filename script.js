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
    lenis = new Lenis({ smoothWheel: true, lerp: 0.2, wheelMultiplier: 1 });
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

  /* ---------- Герой: камера едет к столу защиты, пока герой уходит вверх (без залипания) ---------- */
  var heroTl = null;
  var LAYERS = [['.ly-wall', 28, 1.04], ['.ly-bench', 56, 1.07], ['.ly-tables', 118, 1.11], ['.ly-fore', 200, 1.15]];
  function setPan(pan) {
    LAYERS.forEach(function (L) { var el = hero.querySelector(L[0]); if (el) gsap.set(el, { x: pan * -L[1], scale: L[2] }); });
    var spot = hero.querySelector('.spot'); if (spot) gsap.set(spot, { x: (pan + 1) * 455 });
    var lp = hero.querySelector('.lbl-pro'), ld = hero.querySelector('.lbl-def');
    if (lp) gsap.set(lp, { opacity: .6 - pan * .38 }); if (ld) gsap.set(ld, { opacity: .6 + pan * .38 });
    var pr = hero.querySelector('.portrait-frame'); if (pr) gsap.set(pr, { x: isMobile() ? 0 : (pan + 1) * -11 });
  }
  function setupHeroPan() {
    if (heroTl) { heroTl.scrollTrigger && heroTl.scrollTrigger.kill(); heroTl.kill(); heroTl = null; }
    if (!hasGsap) return;
    if (isMobile() || reduce) { setPan(isMobile() ? 0 : -1); return; }
    setPan(-1);
    heroTl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    var D = 0.7, E = 'power1.inOut';
    LAYERS.forEach(function (L) { var el = hero.querySelector(L[0]); if (el) heroTl.to(el, { x: -L[1], duration: D, ease: E }, 0); });
    var spot = hero.querySelector('.spot'); if (spot) heroTl.to(spot, { x: 910, duration: D, ease: E }, 0);
    var lp = hero.querySelector('.lbl-pro'), ld = hero.querySelector('.lbl-def');
    if (lp) heroTl.to(lp, { opacity: .22, duration: D, ease: E }, 0);
    if (ld) heroTl.to(ld, { opacity: .98, duration: D, ease: E }, 0);
    var pr = hero.querySelector('.portrait-frame'); if (pr) heroTl.to(pr, { x: -22, duration: D, ease: E }, 0);
    var hin = hero.querySelector('.hero-in'); if (hin) heroTl.to(hin, { y: -80, opacity: .35, duration: 1 }, 0);
  }

  /* пауза анимаций сцены вне экрана */
  new IntersectionObserver(function (en) { hero.classList.toggle('is-off', !en[0].isIntersecting); }, { threshold: 0 }).observe(hero);

  /* ---------- Сцены секций (всё, кроме героя) ----------
     Секция ждёт в начальном положении и проигрывает свою анимацию целиком, по времени и плавно,
     когда оказывается в середине экрана. Прокрутку ничто не держит, к позиции скролла анимация не привязана. */
  function flipTo(inner, on, delay) {
    gsap.to(inner, { rotateX: on ? -180 : 0, duration: 0.8, delay: delay || 0, ease: 'power3.inOut', overwrite: 'auto' });
  }
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1600;
    (function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }
  function splitLines(h) {
    var sp = new SplitText(h, { type: 'lines', linesClass: 'ln' });
    return sp.lines.map(function (l) { var s = document.createElement('span'); s.innerHTML = l.innerHTML; l.innerHTML = ''; l.appendChild(s); return s; });
  }
  function showAllStatic() {
    Array.prototype.forEach.call(document.querySelectorAll('.rv'), function (el) { el.classList.add('is-in'); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-flip]'), function (f) { f.style.setProperty('--flip', '1'); });
    var st = document.querySelector('.steps'); if (st) st.style.setProperty('--draw', '1');
  }
  function setupScenes() {
    if (!hasGsap || reduce) { showAllStatic(); return; }
    var sections = Array.prototype.slice.call(document.querySelectorAll('main section')).filter(function (s) { return s !== hero; });
    sections.forEach(function (sec) {
      var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 1 } });
      var q = function (sel) { return Array.prototype.slice.call(sec.querySelectorAll(sel)); };

      /* фон плиты проявляется и «садится» */
      var bg = sec.querySelector('.plate-bg svg');
      if (bg) tl.fromTo(bg, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 0);

      /* текст плиты: кикер, заголовок, лид, кнопка - лесенкой */
      var ptxt = q('.plate-text > *:not(.tp-row)');
      if (ptxt.length) tl.fromTo(ptxt, { opacity: 0, y: 34 }, { opacity: 1, y: 0, stagger: 0.09 }, 0.05);
      var tps = q('.tp');
      if (tps.length) tl.fromTo(tps, { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.09, duration: 0.8 }, 0.35);

      /* заголовки секций: строки выезжают из-под маски */
      q('.split:not(.h1)').forEach(function (h) {
        if (typeof SplitText === 'undefined') return;
        var lines = splitLines(h);
        tl.fromTo(lines, { yPercent: 108 }, { yPercent: 0, stagger: 0.08, duration: 1.05 }, 0.05);
      });
      var kick = q('.sec-head .kicker, .rev-head .kicker, .ab-text > .kicker');
      if (kick.length) tl.fromTo(kick, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.8 }, 0);

      /* блоки .rv - по очереди, через CSS-переход */
      q('.rv').forEach(function (el, i) { tl.call(function () { el.classList.add('is-in'); }, null, 0.25 + i * 0.09); });

      /* фото службы: карточки «ложатся» на стол */
      var sp1 = sec.querySelector('.sp1'), sp2 = sec.querySelector('.sp2'), cap = sec.querySelector('.sp-cap');
      if (sp1) tl.fromTo(sp1, { opacity: 0, y: 70, rotation: -9 }, { opacity: 1, y: 0, rotation: -2.4, duration: 1.2 }, 0.2);
      if (sp2) tl.fromTo(sp2, { opacity: 0, y: 90, rotation: 8 }, { opacity: 1, y: 0, rotation: 2, duration: 1.2 }, 0.38);
      if (cap) tl.fromTo(cap, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1);

      /* таблички переворачиваются ПРОКУРОР-сторона -> список */
      q('[data-flip]').forEach(function (f) {
        var inner = f.querySelector('.dp-in, .tp-in'); if (!inner) return;
        var k = parseFloat(f.style.getPropertyValue('--k')) || 0;
        if (f.classList.contains('dp')) tl.fromTo(f, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9 }, 0.1);
        tl.fromTo(inner, { rotateX: 0 }, { rotateX: -180, duration: 1.15, ease: 'power3.inOut' }, 0.7 + k * 0.18);
      });

      /* линия шагов */
      var steps = sec.querySelector('.steps');
      if (steps) { var pr = { d: 0 }; steps.style.setProperty('--draw', '0');
        tl.to(pr, { d: 1, duration: 1.4, ease: 'power2.inOut', onUpdate: function () { steps.style.setProperty('--draw', pr.d.toFixed(4)); } }, 0.2); }

      /* счётчики */
      q('.num[data-count]').forEach(function (n) { n.textContent = '0'; tl.call(function () { runCounter(n); }, null, 0.4); });

      if (!tl.getChildren().length) return;
      ScrollTrigger.create({
        trigger: sec, once: true,
        /* точка на 15% выше середины секции доходит до середины экрана; высокая секция - когда её верх на 30% экрана */
        start: function () { if (isMobile()) return 'top 82%'; return sec.offsetHeight > window.innerHeight * 1.05 ? 'top 30%' : '35% center'; },
        onEnter: function () { tl.timeScale(1.4).play(); }
      });
    });
  }
  /* карточки плиты «прокурор» переворачиваются и по касанию */
  Array.prototype.forEach.call(document.querySelectorAll('.tp'), function (tp) {
    tp.addEventListener('click', function () {
      var inner = tp.querySelector('.tp-in');
      if (!hasGsap || reduce) { var cur = parseFloat(tp.style.getPropertyValue('--flip')) || 0; tp.style.setProperty('--flip', cur > 0.5 ? '0' : '1'); return; }
      flipTo(inner, (gsap.getProperty(inner, 'rotateX') || 0) > -90, 0);
    });
  });

  /* ---------- Герой уходит: отъезжает вглубь и темнеет (только герой привязан к прокрутке) ---------- */
  function setupHeroExit() {
    if (!hasGsap || reduce || isMobile()) return;
    var sh = document.createElement('i'); sh.className = 'plate-shade'; sh.setAttribute('aria-hidden', 'true'); hero.appendChild(sh);
    gsap.fromTo(hero, { scale: 1 }, { scale: .955, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'bottom 85%', end: 'bottom top', scrub: true } });
    gsap.fromTo(sh, { opacity: 0 }, { opacity: .55, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'bottom 85%', end: 'bottom top', scrub: true } });
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
    setupHeroPan();
    setupHeroExit();
    setupScenes();
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
      if (isMobile() !== lastMobile) { lastMobile = isMobile(); setupHeroPan(); }
      if (hasGsap) ScrollTrigger.refresh();
    }, 150);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
