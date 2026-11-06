/* КрасСервис, прототип. Данные объектов и анимации. */
(function () {
  'use strict';

  /* Объекты: только то, что есть в постах клиента или видно на фото */
  var OBJECTS = [
    { key: 'miraj', imgs: [2, 1, 3, 4, 5, 6, 7, 8, 9], pos: '50% 44%', title: '«Мираж»', meta: 'Браславские озёра. Наружные и внутренние работы завершены.',
      lead: 'Дом на Браславских озёрах. Наружные и внутренние работы завершены, поэтому здесь есть и фасады, и комнаты изнутри.',
      rows: [['Где', 'Браславские озёра'], ['Работы', 'Наружные и внутренние, завершены']] },
    { key: 'spory', imgs: [1, 3], tall: true, pos: '50% 70%', title: '«Малые Споры»', meta: 'Дачные дома',
      lead: 'Дачные дома из профилированного бруса.',
      rows: [['Что это', 'Дачные дома']] },
    { key: 'hibiny', imgs: [1, 2, 3], pos: '50% 34%', title: '«Хибины»', meta: 'Браславские озёра',
      lead: 'Дом на Браславских озёрах.',
      rows: [['Где', 'Браславские озёра'], ['Работы', 'Построен под ключ']] },
    { key: 'dom250', imgs: [1, 2, 4, 3], pos: '50% 62%', title: 'Дом 250 м² жилой площади', meta: 'Большой дом из бруса',
      lead: 'Большой дом из профилированного бруса.',
      rows: [['Площадь', '250 м² жилой площади']] },
    { key: 'dom200', imgs: [7, 6, 4, 1, 2, 3, 5], pos: '50% 56%', title: 'Дом из бруса 200 мм', meta: 'Просторная гостиная, три спальни, вся сметная документация',
      lead: 'Дом с просторной гостиной и тремя спальнями, вся сметная документация по проекту готова.',
      rows: [['Брус', '200 мм'], ['Планировка', 'Просторная гостиная, три спальни'], ['Документы', 'Вся сметная документация'], ['Работы', 'Построен под ключ']] },
    { key: 'terrasa', imgs: [1, 2, 3, 5, 6], pos: '50% 72%', title: 'Дом с террасой', meta: 'Большие окна',
      lead: 'Дом из бруса с террасой и большими окнами.',
      rows: [['Особенность', 'Терраса и большие окна']] }
  ];

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* плавный переход по якорям: CSS smooth мешает доводке этапов */
  document.addEventListener('click', function (e) {
    var soon = e.target.closest && e.target.closest('a[data-soon]');
    if (soon) {
      e.preventDefault(); closeNav();
      say('«' + soon.textContent.trim() + '»: отдельная страница в полной версии сайта');
      return;
    }
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    closeNav();
    var id = a.getAttribute('href').slice(1), el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (gal.open) gal.close();
    if (pj.open) pj.close();
    if (a.dataset.mode) {
      var r = $('input[name=mode][value=' + a.dataset.mode + ']');
      r.checked = true; r.dispatchEvent(new Event('change'));
    }
    /* «Что ещё делаем»: заявка сразу знает, о чём речь */
    if (a.dataset.note && !$('#fNote').value) $('#fNote').value = a.dataset.note;
    var top = id === 'top' ? 0 : el.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* стена рисунков */
  var grid = $('#objGrid');
  OBJECTS.forEach(function (o, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'obj';
    b.setAttribute('aria-label', o.title + ', открыть проект');
    b.innerHTML =
      '<div class="obj-ph"><img loading="lazy" src="img/ink-' + o.key + '.webp" alt="" width="1200" height="900"><img class="c" loading="lazy" src="img/obj-' + o.key + '.webp" alt="' + o.title + '" width="1200" height="900"></div>' +
      '<h3>' + o.title.replace(/(\S+)$/, '<span class="nb">$1&nbsp;<svg class="i"><use href="#i-arrow-right"/></svg></span>') + '</h3>' + (o.meta ? '<p>' + o.meta + '</p>' : '');
    b.addEventListener('click', function () { openPj(i, b); });
    grid.appendChild(b);
  });

  /* галерея */
  var gal = $('#gal'), galImg = $('#galImg'), thumbs = $('#galThumbs');
  var cur = null, idx = 0, opener = null;
  function src(k) { return 'img/' + cur.key + '-' + cur.imgs[k] + '.webp'; }
  function show(i) {
    var n = cur.imgs.length;
    idx = (i + n) % n;
    galImg.src = src(idx);
    galImg.alt = cur.title + ', фото ' + (idx + 1);
    $('#galNum').textContent = (idx + 1) + ' / ' + n;
    $$('button', thumbs).forEach(function (t, k) {
      t.classList.toggle('on', k === idx);
      if (k === idx) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }
  function openGal(i, btn, start) {
    cur = OBJECTS[i]; opener = btn;
    $('#galTitle').textContent = cur.title;
    $('#galMeta').textContent = cur.meta;
    thumbs.innerHTML = '';
    cur.imgs.forEach(function (_, k) {
      var t = document.createElement('button');
      t.type = 'button';
      t.setAttribute('aria-label', 'Фото ' + (k + 1));
      t.innerHTML = '<img src="' + src(k) + '" alt="">';
      t.addEventListener('click', function () { show(k); });
      thumbs.appendChild(t);
    });
    gal.classList.toggle('one', cur.imgs.length < 2);
    gal.showModal();
    gal.focus();
    show(start || 0);
  }
  $('.gal-x').addEventListener('click', function () { gal.close(); });
  $('.gal-prev').addEventListener('click', function () { show(idx - 1); });
  $('.gal-next').addEventListener('click', function () { show(idx + 1); });
  gal.addEventListener('close', function () { if (opener) opener.focus({ preventScroll: true }); });
  gal.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var tx = null;
  galImg.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  galImg.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var d = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(d) > 40) show(idx + (d < 0 ? 1 : -1));
  });

  /* проект: вырастает из карточки, фото открываются на весь экран */
  var pj = $('#pj'), pjP = $('#pjP'), pjI = 0, pjFrom = null;
  var anim = function () { return window.gsap && !reduce; };
  function cardClip(btn) {
    if (!btn) return null;
    var r = $('.obj-ph', btn).getBoundingClientRect(), w = window.innerWidth, h = window.innerHeight;
    if (r.bottom < 0 || r.top > h) return null;
    return 'inset(' + r.top + 'px ' + (w - r.right) + 'px ' + (h - r.bottom) + 'px ' + r.left + 'px round 14px)';
  }
  function fillPj(i) {
    var o = OBJECTS[i], next = OBJECTS[(i + 1) % OBJECTS.length], n = o.imgs.length;
    pjI = i;
    $('#pjT').textContent = o.title;
    $('#pjL').textContent = o.lead;
    var dl = $('#pjR'); dl.innerHTML = '';
    o.rows.forEach(function (r) {
      var w = document.createElement('div'), t = document.createElement('dt'), d = document.createElement('dd');
      t.textContent = r[0]; d.textContent = r[1];
      w.appendChild(t); w.appendChild(d); dl.appendChild(w);
    });
    pjP.innerHTML = '';
    o.imgs.forEach(function (num, k) {
      /* первый кадр большой, дальше квадратные снимки парами, без обрезки */
      var cls = o.tall ? 't' : k === 0 || ((n - 1) % 2 && k === n - 1) ? 'w' : 's';
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pj-ph ' + cls;
      b.setAttribute('aria-label', 'Открыть фото ' + (k + 1) + ' на весь экран');
      b.innerHTML = '<img src="img/' + o.key + '-' + num + '.webp" alt="' + o.title + ', фото ' + (k + 1) + '"' + (cls === 'w' ? ' style="object-position:' + o.pos + '"' : '') + '>';
      b.addEventListener('click', function () { openGal(i, b, k); });
      pjP.appendChild(b);
    });
    var nx = document.createElement('button');
    nx.type = 'button'; nx.className = 'pj-next';
    nx.innerHTML = '<span><small>Следующий проект</small><b>' + next.title + '<svg class="i"><use href="#i-arrow-right"/></svg></b></span><img src="img/obj-' + next.key + '.webp" alt="">';
    nx.addEventListener('click', function () {
      var k = (pjI + 1) % OBJECTS.length;
      pjFrom = $$('.obj')[k]; fillPj(k); pj.scrollTop = 0; pj.focus(); rise();
    });
    pjP.appendChild(nx);
  }
  function rise(d) {
    if (!anim()) return;
    gsap.from($$('.pj-sticky>*'), { y: 18, opacity: 0, duration: .55, ease: 'power2.out', stagger: .05, delay: d || 0, clearProps: 'transform,opacity' });
    gsap.from($$('.pj-ph', pjP).slice(0, 3), { y: 46, opacity: 0, duration: .8, ease: 'power3.out', stagger: .07, delay: (d || 0) + .05, clearProps: 'transform,opacity' });
  }
  function openPj(i, btn) {
    pjFrom = btn; fillPj(i);
    pj.showModal(); pj.scrollTop = 0; pj.focus();
    if (!anim()) return;
    var from = cardClip(btn);
    if (from) gsap.fromTo(pj, { clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: .75, ease: 'power3.inOut', clearProps: 'clipPath' });
    else gsap.fromTo(pj, { opacity: 0 }, { opacity: 1, duration: .3, clearProps: 'opacity' });
    rise(from ? .3 : .05);
  }
  function closePj() {
    var to = cardClip(pjFrom);
    function done() { pj.close(); gsap.set(pj, { clearProps: 'clipPath,opacity' }); }
    if (!anim()) { pj.close(); return; }
    if (to) gsap.fromTo(pj, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: to, duration: .55, ease: 'power3.inOut', onComplete: done });
    else gsap.to(pj, { opacity: 0, duration: .22, onComplete: done });
  }
  $('.pj-x').addEventListener('click', closePj);
  pj.addEventListener('cancel', function (e) { e.preventDefault(); closePj(); });
  pj.addEventListener('close', function () { if (pjFrom) pjFrom.focus({ preventScroll: true }); });

  /* общая шапка: выпадающие панели, меню телефона, будущие страницы */
  var root = document.documentElement, burger = $('.burger'), mnav = $('#mnav'), toast = $('#toast'), toastT, navT;
  var navBtns = $$('.nv-b');
  OBJECTS.slice(0, 6).forEach(function (o, i) {
    var t = document.createElement('button');
    t.type = 'button'; t.className = 'tile';
    t.innerHTML = '<img loading="lazy" src="img/' + o.key + '-' + o.imgs[0] + '.webp" alt=""><b>' + o.title + '</b>';
    t.addEventListener('click', function () { closeNav(); openPj(i, $$('.obj')[i]); });
    $('#pProjIn').appendChild(t);
  });
  function setPan(btn) {
    navBtns.forEach(function (b) {
      var on = b === btn;
      b.setAttribute('aria-expanded', on);
      document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
  }
  function setMenu(on) {
    root.classList.toggle('is-menu', on);
    burger.setAttribute('aria-expanded', on);
    mnav.setAttribute('aria-hidden', !on);
    document.body.style.overflow = on ? 'hidden' : '';
  }
  function closeNav() { setPan(null); setMenu(false); }
  function say(t) {
    toast.textContent = t; toast.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('on'); }, 2600);
  }
  navBtns.forEach(function (b) {
    b.addEventListener('click', function () { setPan(b.getAttribute('aria-expanded') === 'true' ? null : b); });
    b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { clearTimeout(navT); setPan(b); } });
  });
  var topEl = $('.top');
  topEl.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') navT = setTimeout(function () { setPan(null); }, 180); });
  topEl.addEventListener('pointerenter', function () { clearTimeout(navT); });
  $$('.top-in>a, .top-nav>a').forEach(function (a) {
    a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') setPan(null); });
  });
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('is-menu')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.top') && !e.target.closest('#mnav')) setPan(null); });

  /* форма: файлы, режимы, проверка */
  var FORMATS = 'PDF, DWG, JPG, PNG, HEIC, ZIP';
  var MODES = {
    project: ['Перетащите файл проекта сюда', 'или нажмите, чтобы выбрать. ' + FORMATS + ', до\u00A025\u00A0МБ'],
    sketch: ['Перетащите фото эскиза сюда', 'или сфотографируйте рисунок и выберите файл. ' + FORMATS + ', до\u00A025\u00A0МБ'],
    idea: ['Можно без файла', 'Фото участка или дома, который нравится, тоже поможет. ' + FORMATS + ', до\u00A025\u00A0МБ']
  };
  if (window.matchMedia('(pointer: coarse)').matches) {
    MODES.project = ['Выберите файл проекта', FORMATS + ', до\u00A025\u00A0МБ'];
    MODES.sketch = ['Сфотографируйте эскиз', 'или выберите готовое фото. ' + FORMATS + ', до\u00A025\u00A0МБ'];
  }
  var MAX = 25 * 1024 * 1024, list = [], mode = 'project';
  var drop = $('#drop'), input = $('#file'), filesUl = $('#files'), fileErr = $('#fileErr');
  function dropText() {
    var has = list.length > 0;
    drop.classList.toggle('has', has);
    $('#dropTitle').textContent = has ? 'Добавить ещё файл' : MODES[mode][0];
    $('#dropHint').textContent = has ? 'до\u00A025\u00A0МБ' : MODES[mode][1];
  }
  dropText();
  $$('input[name=mode]').forEach(function (r) {
    r.addEventListener('change', function () { mode = r.value; dropText(); });
  });
  function size(b) { return b > 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' МБ' : Math.max(1, Math.round(b / 1024)) + ' КБ'; }
  /* лист с файлом: превью для картинок, расширение для чертежей */
  function sheet(f, i, removable) {
    var li = document.createElement('li');
    li.className = 'sheet';
    li.style.setProperty('--r', (i % 2 ? 1.6 : -1.8) + 'deg');
    var isImg = /^image\/(jpeg|png)/.test(f.type);
    var face = isImg
      ? '<img class="sheet-face" alt="" src="' + URL.createObjectURL(f) + '">'
      : '<span class="sheet-face sheet-ext"></span>';
    li.innerHTML = face + '<span class="sheet-n"><span></span><small>' + size(f.size) + '</small></span>';
    $('.sheet-n span', li).textContent = f.name;
    if (!isImg) $('.sheet-ext', li).textContent = (f.name.split('.').pop() || 'файл').toUpperCase();
    if (removable) {
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'sheet-x'; x.setAttribute('aria-label', 'Убрать файл');
      x.innerHTML = '<svg class="i"><use href="#i-x"/></svg>';
      x.addEventListener('click', function () { list.splice(list.indexOf(f), 1); renderFiles(); });
      li.appendChild(x);
    }
    return li;
  }
  function renderFiles(fresh) {
    filesUl.innerHTML = '';
    list.forEach(function (f, i) {
      var li = sheet(f, i, true);
      filesUl.appendChild(li);
      /* файл ложится на лист */
      if (fresh && fresh.indexOf(f) > -1 && window.gsap && !reduce) {
        gsap.from(li, { y: -70, rotation: i % 2 ? 8 : -9, scale: 1.08, opacity: 0, duration: .7, ease: 'power3.out', delay: fresh.indexOf(f) * .08, clearProps: 'transform,opacity' });
      }
    });
    dropText();
  }
  function addFiles(fs) {
    var big = [], wrong = [], fresh = [];
    Array.prototype.forEach.call(fs, function (f) {
      if (!/\.(pdf|jpe?g|png|heic|dwg|zip)$/i.test(f.name)) { wrong.push(f.name); return; }
      if (f.size > MAX) { big.push(f.name); return; }
      if (list.length < 6) { list.push(f); fresh.push(f); }
    });
    var msg = [];
    if (big.length) msg.push('Больше 25 МБ: ' + big.join(', ') + '. Такой файл лучше прислать в Viber.');
    if (wrong.length) msg.push('Не тот формат: ' + wrong.join(', ') + '. Подойдут ' + FORMATS + '.');
    fileErr.hidden = !msg.length;
    fileErr.textContent = msg.join(' ');
    renderFiles(fresh);
  }
  drop.addEventListener('click', function () { input.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('click', function (e) { e.stopPropagation(); });
  input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(function (t) {
    drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (t) {
    drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('over'); });
  });
  drop.addEventListener('drop', function (e) { addFiles(e.dataTransfer.files); });

  var form = $('#reqForm'), done = $('#reqDone');
  function check(id) {
    var el = $(id), f = el.closest('.field'), ok;
    ok = el.type === 'tel' ? el.value.replace(/\D/g, '').length >= 9 : el.value.trim().length > 0;
    f.classList.toggle('bad', !ok);
    $('.err', f).hidden = ok;
    return ok;
  }
  ['#fName', '#fPhone'].forEach(function (id) {
    $(id).addEventListener('blur', function () { if ($(id).value) check(id); });
    $(id).addEventListener('input', function () { if ($(id).closest('.field').classList.contains('bad')) check(id); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = check('#fName'), b = check('#fPhone');
    if (!a) { $('#fName').focus(); return; }
    if (!b) { $('#fPhone').focus(); return; }
    /* В прототипе отправки нет: показываем, как заявка выглядела бы у Андрея */
    var rows = [
      ['Что есть', { project: 'Проект', sketch: 'Эскиз', idea: 'Только идея' }[mode]],
      ['Имя', $('#fName').value.trim()],
      ['Телефон', $('#fPhone').value.trim()],
      ['Участок', $('#fPlace').value.trim()],
      ['Что важно', $('#fNote').value.trim()]
    ].filter(function (r) { return r[1]; });
    var dl = $('#doneRows'), df = $('#doneFiles');
    dl.innerHTML = ''; df.innerHTML = '';
    rows.forEach(function (r) {
      var w = document.createElement('div'), t = document.createElement('dt'), d = document.createElement('dd');
      t.textContent = r[0]; d.textContent = r[1];
      w.appendChild(t); w.appendChild(d); dl.appendChild(w);
    });
    list.forEach(function (f, i) { df.appendChild(sheet(f, i, false)); });
    df.hidden = !list.length;
    form.hidden = true; done.hidden = false;
    done.focus({ preventScroll: true });
    done.scrollIntoView({ block: 'nearest' });
    if (window.gsap && !reduce) {
      gsap.from(done, { y: 20, opacity: 0, duration: .5, ease: 'power3.out', clearProps: 'transform,opacity' });
      gsap.from('.done-mark', { scale: .4, duration: .6, ease: 'back.out(2)', delay: .1, clearProps: 'transform' });
    }
  });
  $('#reqAgain').addEventListener('click', function () {
    form.reset(); list = []; mode = 'project'; renderFiles();
    done.hidden = true; form.hidden = false;
  });

  /* стык эскиза и дома */
  var hero = $('#hero'), seam = $('.seam'), grip = $('.seam-grip');
  var isV = function () { return window.matchMedia('(max-width:767px)').matches; };
  var S = { base: isV() ? 66 : 59, scroll: 0 };
  function paint() {
    var x = S.base * (1 - S.scroll);
    hero.style.setProperty('--x', x.toFixed(2) + '%');
    /* в конце ручка уходит вместе с рисунком */
    seam.style.opacity = S.scroll > .88 ? Math.max(0, (1 - S.scroll) / .12) : 1;
    seam.style.visibility = S.scroll > .995 ? 'hidden' : 'visible';
    seam.setAttribute('aria-valuenow', Math.round(x));
  }
  paint();
  function clampBase(v) { return Math.min(96, Math.max(4, v)); }
  function fromPointer(e) {
    var r = hero.querySelector('.hero-pin').getBoundingClientRect();
    S.base = clampBase(isV() ? (e.clientY - r.top) / r.height * 100 : (e.clientX - r.left) / r.width * 100);
    paint();
  }
  /* на телефоне тянем только за ручку, остальной экран скроллит */
  grip.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    grip.setPointerCapture(e.pointerId); seam.classList.add('drag'); fromPointer(e);
  });
  if (!isV()) {
    seam.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.seam-grip')) return;
      seam.setPointerCapture(e.pointerId); seam.classList.add('drag'); fromPointer(e);
    });
    seam.addEventListener('pointermove', function (e) { if (seam.classList.contains('drag')) fromPointer(e); });
    ['pointerup', 'pointercancel'].forEach(function (t) { seam.addEventListener(t, function () { seam.classList.remove('drag'); }); });
  }
  grip.addEventListener('pointermove', function (e) { if (seam.classList.contains('drag')) fromPointer(e); });
  ['pointerup', 'pointercancel'].forEach(function (t) {
    grip.addEventListener(t, function () { seam.classList.remove('drag'); });
  });
  seam.addEventListener('keydown', function (e) {
    var d = { ArrowLeft: -3, ArrowUp: -3, ArrowRight: 3, ArrowDown: 3 }[e.key];
    if (d) { e.preventDefault(); S.base = clampBase(S.base + d); paint(); }
  });

  /* анимации */
  window.addEventListener('DOMContentLoaded', function () {
    if (!window.gsap || !window.ScrollTrigger) { $$('.rv').forEach(function (e) { e.style.clipPath = 'none'; }); return; }
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);

    /* вход: линия идёт от края и открывает цвет, ручка один раз качается */
    var end = S.base; S.base = 100; paint();
    var v = isV();
    gsap.timeline({ delay: .25 })
      .from('.ln>span', { yPercent: 108, duration: 1, ease: 'power3.out', stagger: .1 }, 0)
      .from('.hero-sub,.hero-cta', { y: 18, opacity: 0, duration: .7, ease: 'power2.out', stagger: .08, clearProps: 'transform,opacity' }, .35)
      .to(S, { base: end, duration: 1.7, ease: 'power3.inOut', onUpdate: paint }, .3)
      .to(grip, v
        ? { y: 6, duration: .28, ease: 'sine.inOut', yoyo: true, repeat: 1, clearProps: 'y,transform' }
        : { x: 6, duration: .28, ease: 'sine.inOut', yoyo: true, repeat: 1, clearProps: 'x,transform' }, 2.05);

    /* скролл закрывает рисунок цветом */
    var mm = gsap.matchMedia();
    mm.add('(min-width:768px)', function () {
      hero.classList.add('is-pin');
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: function (s) { S.scroll = s.progress; paint(); }
      });
      var off = buildStages(false), offH = buildHands(), offL = buildLens();
      return function () { hero.classList.remove('is-pin'); off(); offH(); offL(); };
    });
    mm.add('(max-width:767px)', function () {
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom 45%', scrub: true,
        onUpdate: function (s) { S.scroll = s.progress; paint(); }
      });
      /* панель и шапка телефона */
      var mBar = $('#mBar'), top = $('.top');
      ScrollTrigger.create({ trigger: '#request', start: 'top 75%', end: 'max', toggleClass: { targets: mBar, className: 'alt' } });
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: function (s) { top.classList.toggle('hid', s.direction === 1 && s.scroll() > 160 && !root.classList.contains('is-menu')); }
      });
      var off = buildStages(true), offL = buildLens();
      return function () { off(); offL(); top.classList.remove('hid'); };
    });

    /* шапка на тёмных секциях */
    [['.objects', '.objects'], ['.hands', '.hands'], ['.faq', '.faq'], ['.foot', '.foot']].forEach(function (p) {
      ScrollTrigger.create({ trigger: p[0], endTrigger: p[1], start: 'top 64px', end: 'bottom 64px', toggleClass: { targets: '.top', className: 'dark' } });
    });

    /* стена собирается карточка за карточкой */
    gsap.from('.obj', { y: 34, opacity: 0, duration: .8, ease: 'power3.out', stagger: .07, clearProps: 'transform,opacity', scrollTrigger: { trigger: '#objGrid', start: 'top 86%', once: true } });

    /* раскрытие фото */
    $$('.rv').forEach(function (el) {
      gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      gsap.from($('img', el), { scale: 1.12, duration: 1.5, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    /* заголовки секций */
    $$('.objects h2, .objects .lead, .more-head, .faq-head, .req-head h2, .req-head .lead').forEach(function (el) {
      gsap.from(el, { y: 24, opacity: 0, duration: .8, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    /* вопросы появляются по одному */
    $$('.faq-list details').forEach(function (el) {
      gsap.from(el, { y: 26, opacity: 0, duration: .7, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    /* открытый вопрос меняет длину страницы */
    var rt;
    $$('.faq-list details').forEach(function (d) {
      d.addEventListener('toggle', function () { clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); }, 420); });
    });
    gsap.from('.req-form', { y: 40, opacity: 0, duration: .9, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.req-form', start: 'top 85%', once: true } });

    /* пересчёт после загрузки ленивых картинок */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });

  /* линза: с мышью идёт за курсором и проходит через всю стену, на телефоне открывает карточку посреди экрана */
  function buildLens() {
    var frames = $$('.obj-ph'), wall = $('#objGrid'), L = { r: 0, x: 0, y: 0 }, intro;
    function paintL() {
      frames.forEach(function (f) {
        var b = f.getBoundingClientRect();
        f.style.setProperty('--mx', (L.x - b.left) + 'px');
        f.style.setProperty('--my', (L.y - b.top) + 'px');
        f.style.setProperty('--lr', L.r + 'px');
      });
    }
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      var tr = frames.map(function (f) {
        var S = { r: 0 };
        return ScrollTrigger.create({
          trigger: f, start: 'top 60%', end: 'bottom 40%',
          onToggle: function (s) {
            gsap.to(S, { r: s.isActive ? f.offsetWidth * .72 : 0, duration: .8, ease: 'power2.inOut', overwrite: true, onUpdate: function () { f.style.setProperty('--lr', S.r + 'px'); } });
          }
        });
      });
      return function () { tr.forEach(function (t) { t.kill(); }); };
    }
    function move(e) { L.x = e.clientX; L.y = e.clientY; paintL(); }
    function enter(e) { if (intro) intro.kill(); intro = null; move(e); gsap.to(L, { r: 230, duration: .45, ease: 'power3.out', overwrite: true, onUpdate: paintL }); }
    function leave() { gsap.to(L, { r: 0, duration: .4, ease: 'power2.in', overwrite: true, onUpdate: paintL }); }
    function onScroll() { if (L.r > 0) paintL(); }
    wall.addEventListener('pointermove', move);
    wall.addEventListener('pointerenter', enter);
    wall.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', onScroll, { passive: true });
    /* один раз линза сама проходит по верхнему ряду: иначе стену примут за обычные рисунки */
    var hint = ScrollTrigger.create({
      trigger: wall, start: 'top 55%', once: true,
      onEnter: function () {
        var a = frames[0].getBoundingClientRect(), c = frames[2].getBoundingClientRect();
        L.x = a.left + a.width * .3; L.y = a.top + a.height * .55;
        intro = gsap.timeline({ onUpdate: paintL })
          .to(L, { r: 190, duration: .6, ease: 'power2.out' }, 0)
          .to(L, { x: c.right - c.width * .3, y: c.top + c.height * .42, duration: 2, ease: 'sine.inOut' }, .1)
          .to(L, { r: 0, duration: .5, ease: 'power2.in' }, 1.7);
      }
    });
    return function () {
      hint.kill(); if (intro) intro.kill();
      wall.removeEventListener('pointermove', move);
      wall.removeEventListener('pointerenter', enter);
      wall.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', onScroll);
      frames.forEach(function (f) { f.style.removeProperty('--lr'); });
    };
  }

  /* Этапы: дом собирается брус за брусом. Без WebGL остаётся обычный список с фото. */
  var gl3 = null, glOk = (function () { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; } })();
  function buildStages(mobile) {
    if (!glOk) return function () {};
    var sec = $('#process'), canvas = $('#procGl'), stages = $$('.stage'), nav = $('.stage-nav'), fin = $('.proc-fin');
    sec.classList.add('is-pin');
    nav.innerHTML = '';
    stages.forEach(function (st) {
      var li = document.createElement('li');
      li.textContent = $('h3', st).textContent;
      nav.appendChild(li);
    });
    var items = $$('li', nav), texts = stages.map(function (s) { return $('.stage-text', s); }), box = $('.stages');
    function fit() {
      box.style.height = '';
      box.style.height = Math.max.apply(null, stages.map(function (s) { return s.offsetHeight; })) + 'px';
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); ScrollTrigger.refresh(); });
    ScrollTrigger.addEventListener('refreshInit', fit);

    var active = 0;
    gsap.set(texts, { autoAlpha: 0 });
    gsap.set(texts[0], { autoAlpha: 1 });
    items[0].classList.add('on');
    function setStage(k) {
      if (k === active) return;
      var was = active; active = k;
      gsap.killTweensOf(texts);
      gsap.set(texts, { autoAlpha: 0, y: 0 });
      gsap.fromTo(texts[k], { autoAlpha: 0, y: k > was ? 12 : -12 }, { autoAlpha: 1, y: 0, duration: .28, ease: 'power2.out' });
      items.forEach(function (li, i) {
        li.classList.toggle('on', i === k);
        li.classList.toggle('done', i < k);
      });
    }
    /* границы этапов совпадают со сборкой в proc3d.js */
    var STEPS = [.1, .27, .4, .5, .87];
    var P = { v: 0 };
    function draw() {
      if (gl3) gl3.render(P.v);
      var k = 0; while (k < STEPS.length && P.v >= STEPS[k]) k++;
      setStage(k);
      nav.style.setProperty('--p', P.v.toFixed(3));
    }
    gsap.set(fin, { autoAlpha: 0, y: 70, rotation: 5 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: mobile ? .25 : .6 } })
      .to(P, { v: 1, duration: 1, ease: 'none', onUpdate: draw }, 0)
      .to(fin, { autoAlpha: 1, y: 0, rotation: -2.5, duration: .05, ease: 'power2.out' }, .9);
    function onRefresh() { if (gl3) gl3.resize(); }
    ScrollTrigger.addEventListener('refresh', onRefresh);
    if (!gl3) import('./proc3d.min.js').then(function (m) {
      gl3 = m.init(canvas, $('.proc-stick')); gl3.render(P.v);
    }).catch(function () {
      glOk = false; sec.classList.remove('is-pin'); gsap.set(texts, { clearProps: 'all' }); if (tl.scrollTrigger) tl.scrollTrigger.kill(); ScrollTrigger.refresh();
    });
    else gl3.resize();

    return function () {
      ScrollTrigger.removeEventListener('refreshInit', fit);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      sec.classList.remove('is-pin');
      box.style.height = ''; nav.innerHTML = '';
      gsap.set(texts, { clearProps: 'all' });
      gsap.set(fin, { clearProps: 'all' });
    };
  }

  /* В одних руках: сначала четыре стороны и путаница линий, скролл складывает их в один лист */
  function buildHands() {
    var sec = $('#hands'), ul = $('.hd-cols'), cards = $$('.hd'), svg = $('#hdLines');
    var was = $$('.was'), now = $$('.now');
    sec.classList.add('is-pin');
    var ns = 'http://www.w3.org/2000/svg', paths = [0, 1, 2, 3, 4, 5].map(function () { var p = document.createElementNS(ns, 'path'); svg.appendChild(p); return p; });
    var L = { t: 0 };
    function line() {
      var w = svg.clientWidth, h = svg.clientHeight, mid = h / 2, a = 1 - L.t, drop = Math.max(170, window.innerHeight * .24);
      paths.forEach(function (p, i) {
        var d = '';
        for (var k = 0; k <= 140; k++) {
          var u = k / 140, x = u * w;
          /* сначала клубок уходит вниз за карточки, скролл вытягивает его в одну прямую */
          var y = mid + a * (drop * (.5 + .5 * Math.sin(u * (5 + i * 2.3) + i * 2.1)) * (.45 + .55 * Math.sin(u * 3.1 + i)) + Math.sin(u * (23 - i * 2.7) + i * 1.3) * mid * .55);
          d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        p.setAttribute('d', d);
        p.style.stroke = L.t > .98 ? 'var(--larch-n)' : '';
        p.style.strokeWidth = (1.5 + L.t * 1.3).toFixed(2);
      });
    }
    line();
    window.addEventListener('resize', line);
    /* первый кадр: карточки брошены на стол как попало, друг на друга */
    var ROT = [8, -6, 7, -10], DX = [-6, 4, -2, 6], DY = [12, -34, 26, -24], SC = [.92, 1, .9, .96], Z = [1, 4, 2, 3];
    gsap.set(ul, { '--g': '22px', '--hr': '16px' });
    gsap.set(cards, {
      rotation: function (i) { return ROT[i]; }, x: function (i) { return DX[i]; }, y: function (i) { return DY[i]; },
      scale: function (i) { return SC[i]; }, zIndex: function (i) { return Z[i]; }
    });
    gsap.set(now.concat($$('.t-now, .f-now, .hd-tel, .hd-btn')), { autoAlpha: 0 });
    gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .5 } })
      .to(cards, { rotation: 0, x: 0, y: 0, scale: 1, duration: .3, stagger: .03 }, .12)
      .to(ul, { '--g': '0px', '--hr': '0px', duration: .3 }, .2)
      .to(L, { t: 1, duration: .42, onUpdate: line }, .1)
      .to($$('.t-was, .f-was'), { autoAlpha: 0, y: -14, duration: .08 }, .31)
      .fromTo($$('.t-now, .f-now'), { y: 14 }, { autoAlpha: 1, y: 0, duration: .1 }, .4)
      .to(was, { autoAlpha: 0, duration: .08 }, .31)
      .to(now, { autoAlpha: 1, duration: .1 }, .4)
      .to($$('.hd-tel, .hd-btn'), { autoAlpha: 1, duration: .08 }, .5)
      .to({}, { duration: .01 }, .99);
    return function () {
      window.removeEventListener('resize', line);
      sec.classList.remove('is-pin');
      gsap.set($$('.hd, .hd-cols, .was, .now, .t-was, .t-now, .f-was, .f-now, .hd-tel, .hd-btn'), { clearProps: 'all' });
      svg.innerHTML = '';
    };
  }
})();
