/* КрасСервис, прототип. Данные объектов и анимации. */
(function () {
  'use strict';

  /* Объекты: названия и подписи только из постов клиента и того, что видно на фото */
  var OBJECTS = [
    { cls: 'r7', key: 'miraj', imgs: [2, 1, 3, 4, 5, 6, 7, 8, 9], pos: '50% 44%', title: '«Мираж»', meta: 'Браславские озёра. Наружные и внутренние работы завершены.' },
    { cls: 'r5', key: 'spory', imgs: [1, 3], pos: '50% 70%', title: '«Малые Споры»', meta: 'Дачные дома' },
    { cls: 'r5', key: 'hibiny', imgs: [1, 2, 3], pos: '50% 34%', title: '«Хибины»', meta: 'Браславские озёра' },
    { cls: 'r7', key: 'dom250', imgs: [1, 2, 4, 3], pos: '50% 62%', title: 'Дом 250 м² жилой площади', meta: '' },
    { cls: 'r7', key: 'dom200', imgs: [7, 6, 4, 1, 2, 3, 5], pos: '50% 56%', title: 'Дом из бруса 200 мм', meta: 'Просторная гостиная, три спальни, вся сметная документация' },
    { cls: 'r5', key: 'terrasa', imgs: [1, 2, 3, 5, 6], pos: '50% 72%', title: 'Дом с террасой', meta: 'Большие окна' }
  ];

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* плавный переход по якорям: CSS smooth мешает доводке этапов */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1), el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (gal.open) gal.close();
    if (a.dataset.mode) {
      var r = $('input[name=mode][value=' + a.dataset.mode + ']');
      r.checked = true; r.dispatchEvent(new Event('change'));
    }
    /* «Что ещё делаем»: заявка сразу знает, о чём речь */
    if (a.dataset.note && !$('#fNote').value) $('#fNote').value = a.dataset.note;
    var top = id === 'top' ? 0 : el.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* карточки объектов */
  var grid = $('#objGrid');
  OBJECTS.forEach(function (o, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'obj ' + o.cls;
    b.setAttribute('aria-label', o.title + ', открыть фото');
    b.innerHTML =
      '<div class="obj-ph rv"><img loading="lazy" src="img/' + o.key + '-' + o.imgs[0] + '.webp" alt="' + o.title + '" style="object-position:' + o.pos + '"></div>' +
      '<h3>' + o.title.replace(/(\S+)$/, '<span class="nb">$1&nbsp;<svg class="i"><use href="#i-arrow-right"/></svg></span>') + '</h3>' + (o.meta ? '<p>' + o.meta + '</p>' : '');
    b.addEventListener('click', function () { openGal(i, b); });
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
  function openGal(i, btn) {
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
    show(0);
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
      var off = buildStages(false);
      return function () { hero.classList.remove('is-pin'); off(); };
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
        onUpdate: function (s) { top.classList.toggle('hid', s.direction === 1 && s.scroll() > 160); }
      });
      var off = buildStages(true);
      return function () { off(); top.classList.remove('hid'); };
    });

    /* шапка на тёмных секциях */
    [['.objects', '.inside'], ['.hands', '.hands'], ['.faq', '.faq'], ['.foot', '.foot']].forEach(function (p) {
      ScrollTrigger.create({ trigger: p[0], endTrigger: p[1], start: 'top 64px', end: 'bottom 64px', toggleClass: { targets: '.top', className: 'dark' } });
    });

    /* большой интерьер раскрывается до краёв экрана */
    gsap.fromTo('.ins-full', { clipPath: 'inset(7% 5% 7% 5% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.ins-full', start: 'top 92%', end: 'top 18%', scrub: true } });
    gsap.fromTo('.ins-full img', { scale: 1.06 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.ins-full', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* раскрытие фото объектов */
    $$('.rv').forEach(function (el) {
      gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      gsap.from($('img', el), { scale: 1.12, duration: 1.5, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    /* заголовки секций */
    $$('.objects h2, .objects .lead, .inside h2, .inside .lead, .ins-sub, .hands h2, .hands .lead, .more-head, .faq-head, .req-head h2, .req-head .lead').forEach(function (el) {
      gsap.from(el, { y: 24, opacity: 0, duration: .8, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    /* строки «В одних руках» и вопросы появляются по одной */
    $$('.hand, .faq-list details').forEach(function (el) {
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

  /* Этапы: блок закреплён через sticky, кадры меняются венцами с разных сторон.
     На компьютере скролл доводится до целого кадра, на телефоне нет: спорит с инерцией пальца. */
  function buildStages(mobile) {
    var ROWS = mobile ? 5 : 7;
    var sec = $('#process'), frame = $('.proc-frame'), stages = $$('.stage'), nav = $('.stage-nav');
    var LAST = stages.length - 1;
    sec.classList.add('is-pin');
    frame.innerHTML = ''; nav.innerHTML = '';
    var layers = stages.map(function (st) {
      var layer = document.createElement('div');
      layer.className = 'layer';
      for (var r = 0; r < ROWS; r++) {
        var row = document.createElement('div');
        row.className = 'row';
        row.style.top = (r * 100 / ROWS) + '%';
        row.style.height = 'calc(' + (100 / ROWS) + '% + 1px)';
        var img = document.createElement('img');
        img.src = st.dataset.img; img.alt = '';
        img.style.top = (-r * 100) + '%';
        img.style.height = (ROWS * 100) + '%';
        img.style.objectPosition = st.dataset.pos;
        row.appendChild(img);
        layer.appendChild(row);
      }
      frame.appendChild(layer);
      var li = document.createElement('li');
      li.textContent = $('h3', st).textContent;
      nav.appendChild(li);
      return layer;
    });
    var items = $$('li', nav), texts = stages.map(function (s) { return $('.stage-text', s); });
    var box = $('.stages');
    function fit() {
      box.style.height = '';
      box.style.height = Math.max.apply(null, stages.map(function (s) { return s.offsetHeight; })) + 'px';
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); ScrollTrigger.refresh(); });
    ScrollTrigger.addEventListener('refreshInit', fit);

    /* текст меняется сразу целиком на 30% смены кадра: призраков в стоп-кадре нет */
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

    var TR = mobile ? .34 : .72; /* смена кадра занимает эту долю шага: на телефоне короче, чтобы палец реже оставлял мозаику */
    var T0 = mobile ? .33 : .2;
    var rest = stages.map(function (_, i) { return i === 0 ? 0 : i === LAST ? 1 : (i - .04) / LAST; });
    var tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: 'bottom bottom', scrub: mobile ? true : .35,
        snap: mobile ? false : { snapTo: rest, duration: { min: .2, max: .45 }, delay: .15, inertia: false, directional: true, ease: 'power2.inOut' },
        onUpdate: function (s) {
          nav.style.setProperty('--p', s.progress.toFixed(3));
          var pos = s.progress * LAST;
          var k = pos < T0 + TR * .3 ? 0 : Math.min(LAST, Math.floor(pos - T0 - TR * .3) + 1);
          setStage(k);
        }
      }
    });
    stages.forEach(function (st, i) {
      if (i === 0) return;
      var rows = $$('.row', layers[i]);
      gsap.set(rows, { xPercent: function (k) { return k % 2 ? 102 : -102; } });
      tl.to(rows, { xPercent: 0, duration: TR * .86, stagger: { each: TR * .14 / ROWS, from: 'end' } }, i - 1 + T0);
    });
    tl.to({}, { duration: .01 }, LAST - .01);

    return function () {
      ScrollTrigger.removeEventListener('refreshInit', fit);
      sec.classList.remove('is-pin');
      box.style.height = '';
      frame.innerHTML = ''; nav.innerHTML = '';
      gsap.set(texts, { clearProps: 'all' });
    };
  }
})();
