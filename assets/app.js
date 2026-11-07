/* Three.js 繁中文件 — 頁面渲染、路由與可編輯範例 */
(function () {
  'use strict';

  var THREE_VERSION = window.THREE_VERSION || '0.170.0';
  var CDN = 'https://unpkg.com/three@' + THREE_VERSION + '/';
  var SRC_BASE = 'https://github.com/mrdoob/three.js/blob/r' + THREE_VERSION.split('.')[1] + '/';

  /* 範例共用的 doc-stage 輔助模組：建立場景、相機、渲染器、OrbitControls 與燈光 */
  var STAGE_SRC = [
    "import * as THREE from 'three';",
    "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';",
    "export function createStage(o = {}) {",
    "  const renderer = new THREE.WebGLRenderer({ antialias: true });",
    "  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));",
    "  renderer.setSize(innerWidth, innerHeight);",
    "  if (o.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }",
    "  document.body.appendChild(renderer.domElement);",
    "  const scene = new THREE.Scene();",
    "  scene.background = new THREE.Color(o.background ?? 0x1e2027);",
    "  const camera = new THREE.PerspectiveCamera(o.fov ?? 50, innerWidth / innerHeight, o.near ?? 0.1, o.far ?? 1000);",
    "  camera.position.set(...(o.cameraPosition ?? [3, 2.5, 5]));",
    "  const target = new THREE.Vector3(...(o.target ?? [0, 0, 0]));",
    "  let controls = null;",
    "  if (o.controls !== false) {",
    "    controls = new OrbitControls(camera, renderer.domElement);",
    "    controls.enableDamping = true;",
    "    controls.target.copy(target);",
    "    controls.update();",
    "  } else camera.lookAt(target);",
    "  if (o.lights !== false) {",
    "    scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 1.2));",
    "    const sun = new THREE.DirectionalLight(0xffffff, 2);",
    "    sun.position.set(3, 5, 4);",
    "    scene.add(sun);",
    "  }",
    "  if (o.grid) scene.add(new THREE.GridHelper(o.grid === true ? 10 : o.grid, 10, 0x666666, 0x3a3a3a));",
    "  if (o.axes) scene.add(new THREE.AxesHelper(o.axes === true ? 1.5 : o.axes));",
    "  const clock = new THREE.Clock();",
    "  const frames = [], resizes = [];",
    "  const stage = {",
    "    scene, camera, renderer, controls, clock,",
    "    onFrame(fn) { frames.push(fn); return stage; },",
    "    onResize(fn) { resizes.push(fn); return stage; },",
    "    render() { renderer.render(scene, camera); },",
    "  };",
    "  renderer.setAnimationLoop(() => {",
    "    const dt = clock.getDelta(), t = clock.elapsedTime;",
    "    for (const f of frames) f(t, dt);",
    "    if (controls) controls.update();",
    "    stage.render();",
    "  });",
    "  addEventListener('resize', () => {",
    "    if (camera.isPerspectiveCamera) { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }",
    "    renderer.setSize(innerWidth, innerHeight);",
    "    for (const f of resizes) f(innerWidth, innerHeight);",
    "  });",
    "  return stage;",
    "}"
  ].join('\n');
  window.DOC_STAGE_SRC = STAGE_SRC;

  var IMPORT_MAP = {
    imports: {
      'three': CDN + 'build/three.module.js',
      'three/addons/': CDN + 'examples/jsm/',
      'doc-stage': 'data:text/javascript;charset=utf-8,' + encodeURIComponent(STAGE_SRC)
    }
  };
  var STORE_PREFIX = 'threejs-zh-doc:';
  var hasCM = typeof window.CodeMirror === 'function';

  var pages = [];
  var byTitle = {};
  window.DOCS.forEach(function (g) {
    g.items.forEach(function (p) {
      p.group = g.group;
      p.section = g.section || 'guide';
      pages.push(p);
      if (p.section === 'api') byTitle[p.title] = p.id;
    });
  });

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var main = $('#main');
  var nav = $('#nav');
  var tocEl = $('#pageToc');
  var widgets = [];
  var currentSection = 'guide';
  var tocObserver = null;

  $('#verTag').textContent = 'r' + THREE_VERSION.split('.')[1];

  /* ---------- 圖示 ---------- */
  var ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 5v14l12-7z" fill="currentColor"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    open: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    exit: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gh: '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 18c-4.5 1.5-4.5-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var MOD = isMac ? '⌘' : 'Ctrl';
  $$('.search-trigger kbd').forEach(function (k) { k.textContent = MOD + 'K'; });

  /* ---------- 儲存（可能不可用，一律 try/catch） ---------- */
  function load(key) { try { return localStorage.getItem(STORE_PREFIX + key); } catch (e) { return null; } }
  function save(key, val) {
    try {
      if (val == null) localStorage.removeItem(STORE_PREFIX + key);
      else localStorage.setItem(STORE_PREFIX + key, val);
    } catch (e) { /* 忽略 */ }
  }

  /* ---------- 主題、選單、搜尋快捷鍵 ---------- */
  var savedTheme = load('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  $('#themeBtn').addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    if (!cur) cur = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    save('theme', next);
  });
  /* ---------- 配色切換 ---------- */
  var PALETTES = [
    ['ocean', '海洋藍', '#0ea5e9', '#2dd4bf'],
    ['indigo', '靛藍', '#6366f1', '#22d3ee'],
    ['green', '翡翠綠', '#10b981', '#06b6d4'],
    ['coral', '珊瑚橘', '#f97316', '#f43f5e'],
    ['rose', '玫瑰紫', '#d946ef', '#8b5cf6'],
    ['graphite', '石墨黑白', '#3f3f46', '#a1a1aa']
  ];
  var paletteBtn = $('#paletteBtn'), paletteMenu = $('#paletteMenu');
  function currentPalette() { return document.documentElement.getAttribute('data-palette') || 'ocean'; }
  function buildPaletteMenu() {
    var cur = currentPalette();
    paletteMenu.innerHTML = '<h6>主題配色</h6>' + PALETTES.map(function (p) {
      return '<button role="menuitemradio" aria-checked="' + (p[0] === cur) + '" data-palette="' + p[0] + '">' +
        '<span class="sw" style="background:linear-gradient(135deg,' + p[2] + ' 50%,' + p[3] + ' 50%)"></span>' + p[1] +
        '<svg class="ck" viewBox="0 0 24 24" width="16" height="16"><path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    }).join('');
  }
  function togglePalette(open) {
    if (open === undefined) open = paletteMenu.hidden;
    paletteMenu.hidden = !open;
    paletteBtn.setAttribute('aria-expanded', String(open));
    if (open) { buildPaletteMenu(); var c = paletteMenu.querySelector('[aria-checked="true"]'); if (c) c.focus(); }
  }
  paletteBtn.addEventListener('click', function (e) { e.stopPropagation(); togglePalette(); });
  paletteMenu.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-palette]');
    if (!b) return;
    document.documentElement.setAttribute('data-palette', b.dataset.palette);
    save('palette', b.dataset.palette);
    buildPaletteMenu();
  });
  document.addEventListener('click', function (e) { if (!paletteMenu.hidden && !e.target.closest('.palette-wrap')) togglePalette(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !paletteMenu.hidden) { togglePalette(false); paletteBtn.focus(); } });

  $('#menuBtn').addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  $('#scrim').addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  function focusSearch() {
    if (matchMedia('(max-width: 900px)').matches) document.body.classList.add('nav-open');
    var s = $('#search');
    s.focus();
    s.select();
  }
  $('#searchTrigger').addEventListener('click', focusSearch);
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); focusSearch(); }
    else if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && !document.activeElement.closest('.CodeMirror')) { e.preventDefault(); focusSearch(); }
    else if (e.key === 'Escape') {
      var full = $('.example.ex-full');
      if (full) full._exitFull();
      else if (document.activeElement === $('#search')) { $('#search').blur(); document.body.classList.remove('nav-open'); }
    }
  });
  $('#search').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var first = $$('#nav a').find(function (a) { return a.style.display !== 'none'; });
      if (first) { location.hash = first.getAttribute('href'); this.blur(); }
    }
  });

  /* ---------- 閱讀進度、回到頂端 ---------- */
  var progress = $('#progress'), toTop = $('#toTop');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    toTop.classList.toggle('show', h.scrollTop > 800);
  }
  addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- 側邊目錄 ---------- */
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function stripTags(html) { var d = document.createElement('div'); d.innerHTML = html || ''; return d.textContent; }

  function buildNav() {
    var html = '';
    window.DOCS.forEach(function (g) {
      html += '<div class="nav-group" data-section="' + (g.section || 'guide') + '"><h4>' + g.group + '</h4>';
      g.items.forEach(function (p) {
        html += '<a href="#/' + p.id + '" data-id="' + p.id + '"><span>' + p.title + '</span>' +
          (p.en && p.en !== p.title ? '<small>' + p.en + '</small>' : '') + '</a>';
      });
      html += '</div>';
    });
    nav.innerHTML = html;
    pages.forEach(function (p) {
      var members = (p.props || []).concat(p.methods || [], p.statics || []).map(function (m) { return m[0] + ' ' + m[1]; }).join(' ');
      p._search = (p.title + ' ' + (p.en || '') + ' ' + p.id + ' ' + stripTags(p.html) + ' ' + (p.desc || '') + ' ' + members + ' ' +
        (p.examples || []).map(function (e) { return e.title; }).join(' ')).toLowerCase();
    });
    filterNav();
  }
  function filterNav() {
    var q = $('#search').value.trim().toLowerCase();
    $$('.nav-group', nav).forEach(function (g) {
      var any = false;
      var inSection = g.dataset.section === currentSection;
      $$('a', g).forEach(function (a) {
        var p = pages.find(function (x) { return x.id === a.dataset.id; });
        var show = q ? p._search.indexOf(q) !== -1 : inSection;
        a.style.display = show ? '' : 'none';
        if (show) any = true;
      });
      g.style.display = any ? '' : 'none';
    });
  }
  $('#search').addEventListener('input', filterNav);

  /* ---------- 路由：#/頁面id 或 #/頁面id/成員名稱 ---------- */
  function parseHash() {
    var m = location.hash.match(/^#\/([\w-]+)(?:\/([\w.$-]+))?/) || [];
    return { id: m[1] || pages[0].id, member: m[2] };
  }
  var renderedId = null;
  function route() {
    var h = parseHash();
    var idx = pages.findIndex(function (p) { return p.id === h.id; });
    if (idx < 0) idx = 0;
    if (pages[idx].id !== renderedId) renderPage(idx);
    renderedId = pages[idx].id;
    if (h.member) {
      var target = document.getElementById('m-' + h.member);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        if (target.classList.contains('member')) {
          target.classList.add('flash');
          setTimeout(function () { target.classList.remove('flash'); }, 1600);
        }
      }
    } else {
      window.scrollTo(0, 0);
    }
    document.body.classList.remove('nav-open');
    onScroll();
  }
  window.addEventListener('hashchange', route);

  function setSection(sec) {
      currentSection = sec;
      $$('.tabs a').forEach(function (a) { a.classList.toggle('active', a.dataset.sec === sec); });
      filterNav();
    }

  function renderPage(idx) {
      widgets.forEach(function (w) { w.destroy(); });
      widgets = [];
      document.body.classList.remove('has-full');

      var p = pages[idx];
      setSection(p.section);
      var same = pages.filter(function (x) { return x.section === p.section; });
      var si = same.indexOf(p);
      var prev = same[si - 1], next = same[si + 1];

      var head = '<header class="doc-head' + (p.api ? ' api' : '') + '">' +
        '<div class="crumb"><span class="chip">' + (p.section === 'api' ? 'API 參考' : '教學指南') + '</span>' +
        '<span class="sep">/</span><span>' + p.group + '</span></div>' +
        '<h1>' + p.title + (p.en && p.en !== p.title ? '<span class="h1-en">' + p.en + '</span>' : '') + '</h1>' +
        (p.api ? apiHeadMeta(p) : '') +
        '</header>';

      var body = '';
      if (p.api) body = renderApi(p);
      else {
        body += (p.html || '').replace('__STAGE_SRC__', escapeHtml(STAGE_SRC));
        (p.examples || []).forEach(function (ex, i) { body += '<div class="example" data-ex="' + i + '"></div>'; });
        body += (p.after || '');
      }

      main.innerHTML = '<article class="doc">' + head + body +
        '<nav class="pager">' +
        (prev ? '<a href="#/' + prev.id + '"><small>← 上一頁</small>' + prev.title + '</a>' : '<span></span>') +
        (next ? '<a class="next" href="#/' + next.id + '"><small>下一頁 →</small>' + next.title + '</a>' : '') +
        '</nav>' +
        '<footer class="credits">' +
        '<span>引擎作者 <a href="https://github.com/mrdoob" target="_blank" rel="noopener">Mr.doob</a></span>' +
        '<span class="sep">|</span>' +
        '<span>文件生成 Claude x William77</span>' +
        '</footer></article>';

      $$('pre.code', main).forEach(highlight);
      $$('.example[data-ex]', main).forEach(function (el) {
        var i = +el.dataset.ex;
        widgets.push(createExample(el, p.examples[i], p.id + '#' + i));
      });
      // 成員範例：展開時才建立
      $$('details.member-ex', main).forEach(function (d) {
        d.addEventListener('toggle', function () {
          if (!d.open || d._built) return;
          d._built = true;
          var m = p._memberEx[+d.dataset.mex];
          var el = document.createElement('div');
          el.className = 'example compact';
          d.appendChild(el);
          widgets.push(createExample(el, m.ex, p.id + '@' + m.key));
        });
      });

      $$('a', nav).forEach(function (a) { a.classList.toggle('active', a.dataset.id === p.id); });
      var active = $('a.active', nav);
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
      document.title = p.title + ' — Three.js 繁中文件';
      buildToc(p);
    }

  /* ---------- 右側本頁目錄（scroll spy） ---------- */
  function buildToc(p) {
      if (tocObserver) tocObserver.disconnect();
      var items = [];
      var n = 0;
      $$('.doc h2, .doc .member', main).forEach(function (el) {
        if (!el.id) el.id = 'm-sec' + (n++);
        var isMember = el.classList.contains('member');
        var label = isMember ? (el.dataset.name || '') : el.textContent;
        if (!label) return;
        items.push({ el: el, html: '<a class="' + (isMember ? 'lvl3' : 'lvl2') + '" data-target="' + el.id + '" href="#/' + p.id + '/' + el.id.slice(2) + '">' + escapeHtml(label) + '</a>' });
      });
      if (items.length < 2) { tocEl.innerHTML = ''; return; }
      tocEl.innerHTML = '<h5>本頁內容</h5>' + items.map(function (i) { return i.html; }).join('');
      var links = {};
      $$('a', tocEl).forEach(function (a) { links[a.dataset.target] = a; });
      var visible = {};
      tocObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
        var firstVisible = items.find(function (i) { return visible[i.el.id]; });
        if (!firstVisible) return;
        $$('a.active', tocEl).forEach(function (a) { a.classList.remove('active'); });
        var link = links[firstVisible.el.id];
        if (link) {
          link.classList.add('active');
          var r = link.getBoundingClientRect(), tr = tocEl.getBoundingClientRect();
          if (r.top < tr.top + 40 || r.bottom > tr.bottom - 20) tocEl.scrollTop += r.top - tr.top - tr.height / 3;
        }
      }, { rootMargin: '-70px 0px -65% 0px' });
      items.forEach(function (i) { tocObserver.observe(i.el); });
    }

  /* ---------- API 頁面 ---------- */
  function linkify(html, selfTitle) {
      // 只替換標籤外的文字
      return html.replace(/(<[^>]+>)|\b([A-Z][A-Za-z0-9]+)\b/g, function (all, tag, w) {
        if (tag) return tag;
        if (byTitle[w] && w !== selfTitle) return '<a href="#/' + byTitle[w] + '">' + w + '</a>';
        return w;
      });
    }
  function linkTypes(text, selfTitle) { return linkify(escapeHtml(text), selfTitle); }

  /* 把簽名字串格式化為帶有語法色彩的 HTML */
  function fmtSig(sig, selfTitle) {
      return sig.split('<br>').map(function (part) {
        var s = escapeHtml(part);
        // 型別：「 : Type」
        s = s.replace(/ : ([A-Za-z][\w.]*(?:\s*\|\s*[A-Za-z][\w.]*)*)/g, function (m, t) {
          return ' <span class="punc">:</span> <span class="ty">' + t + '</span>';
        });
        // new 關鍵字與名稱
        s = s.replace(/^(new )?(\.?[\w$]+(?:\s*\/\s*\.?[\w$]+)*)/, function (m, kw, name) {
          return (kw ? '<span class="kw">new</span> ' : '') + '<span class="nm">' + name + '</span>';
        });
        // 括號內參數名稱
        s = s.replace(/\(([^)]*)\)/, function (m, inner) {
          if (!inner.trim()) return '<span class="punc">()</span>';
          return '<span class="punc">(</span>' + inner.replace(/(^|,\s*)([\w.$]+)(?=\s*(?:<span class="punc">:|,|$|\s))/g, '$1<span class="pn">$2</span>') + '<span class="punc">)</span>';
        });
        return linkify(s, selfTitle);
      }).join('<br>');
    }
  function memberName(sig) {
      var m = sig.match(/^\.?([\w$]+)/);
      return m ? m[1] : sig;
    }
  function normEx(ex) {
      if (!ex) return null;
      if (typeof ex === 'string') ex = { code: ex, consoleOnly: true };
      var c = ex.code.replace(/^\n/, '');
      if (!/^\s*import\s/m.test(c)) c = "import * as THREE from 'three';\n\n" + c;
      return { title: ex.title || '', desc: ex.desc || '', code: c, consoleOnly: !!ex.consoleOnly };
    }

  function apiHeadMeta(p) {
      var h = '<div class="head-meta">';
      if (p.inherits && p.inherits.length) {
        h += '<span><span class="lbl">繼承</span><span class="inherit">' + p.inherits.concat([p.title]).map(function (c, i, arr) {
          var el = byTitle[c] && c !== p.title ? '<a href="#/' + byTitle[c] + '">' + c + '</a>' : (c === p.title ? '<b>' + c + '</b>' : '<a style="pointer-events:none;color:var(--fg-3)">' + c + '</a>');
          return el + (i < arr.length - 1 ? '<span class="arr">→</span>' : '');
        }).join('') + '</span></span>';
      }
      if (p.src) {
        var src = p.src.indexOf('examples/') === 0 ? p.src : 'src/' + p.src;
        h += '<a class="src" href="' + SRC_BASE + src + '" target="_blank" rel="noopener">' + ICON.gh + ' 原始碼</a>';
      }
      h += '</div>';
      if (p.module) h += '<div class="import-line">' + escapeHtml(p.module) + '</div>';
      return h;
    }

  function renderApi(p) {
      p._memberEx = [];
      var h = '<div class="api-desc">' + (p.desc || '') + '</div>';

      var count = function (l) { return l ? l.length : 0; };
      var chips = [];
      if (p.examples && p.examples.length) chips.push(['examples', '範例', p.examples.length]);
      if (p.ctor) chips.push(['ctor', '建構子', 0]);
      if (count(p.props)) chips.push(['props', '屬性', p.props.length]);
      if (count(p.methods)) chips.push(['methods', '方法', p.methods.length]);
      if (count(p.statics)) chips.push(['statics', '靜態成員', p.statics.length]);
      if (chips.length > 1) {
        h += '<nav class="chips">' + chips.map(function (t) {
          return '<a href="#/' + p.id + '/' + t[0] + '">' + t[1] + (t[2] ? '<span>' + t[2] + '</span>' : '') + '</a>';
        }).join('') + '</nav>';
      }

      if (p.examples && p.examples.length) {
        h += '<h2 id="m-examples">範例</h2>';
        p.examples.forEach(function (ex, i) { h += '<div class="example" data-ex="' + i + '"></div>'; });
      }

      if (p.ctor) {
        h += '<h2 id="m-ctor">建構子</h2>';
        var ctors = Array.isArray(p.ctor) ? p.ctor : [p.ctor];
        ctors.forEach(function (c) {
          h += '<div class="ctor-box"><div class="sig">' + fmtSig(c.sig, '') + '</div>';
          if (c.desc) h += '<p>' + c.desc + '</p>';
          if (c.params && c.params.length) {
            h += '<table class="params"><tr><th>參數</th><th>型別</th><th>說明</th></tr>' +
              c.params.map(function (r) {
                return '<tr><td><code>' + r[0] + '</code></td><td>' + linkTypes(r[1], p.title) + '</td><td>' + r[2] + '</td></tr>';
              }).join('') + '</table>';
          }
          h += '</div>';
        });
      }

      function members(list, kind, heading, isStatic) {
        if (!list || !list.length) return '';
        var out = '<h2 id="m-' + kind + '">' + heading + '</h2>';
        if (kind === 'props' && p.inherits && p.inherits.length) {
          out += '<p class="muted">另可使用父類別 ' + p.inherits.slice().reverse().map(function (c) {
            return byTitle[c] ? '<a href="#/' + byTitle[c] + '/props">' + c + '</a>' : c;
          }).join('、') + ' 的屬性與方法。</p>';
        }
        out += '<div class="members">';
        list.forEach(function (m) {
          var sig = m[0], desc = m[1], ex = normEx(m[2]);
          var name = memberName(sig);
          var anchor = (isStatic ? 's-' : '') + name;
          out += '<div class="member" id="m-' + anchor + '" data-name="' + escapeHtml((kind === 'methods' ? '.' + name + '()' : (isStatic ? name : '.' + name))) + '">' +
            '<a class="anchor" href="#/' + p.id + '/' + anchor + '" aria-label="連結">#</a>' +
            '<div class="sig">' + (isStatic ? '<span class="static">STATIC</span>' : '') + fmtSig(sig, '') + '</div>' +
            '<div class="member-desc">' + desc + '</div>';
          if (ex) {
            var k = p._memberEx.length;
            p._memberEx.push({ ex: ex, key: kind + '.' + anchor });
            out += '<details class="member-ex" data-mex="' + k + '"><summary>範例' + (ex.title ? '：' + ex.title : '') + '</summary></details>';
          }
          out += '</div>';
        });
        return out + '</div>';
      }
      h += members(p.props, 'props', '屬性');
      h += members(p.methods, 'methods', '方法');
      h += members(p.statics, 'statics', '靜態成員', true);
      return h;
    }

  /* ---------- 靜態程式碼高亮 + 複製按鈕 ---------- */
  function highlight(pre) {
      var codeEl = pre.querySelector('code') || pre;
      var text = codeEl.textContent.replace(/^\n/, '').replace(/\s+$/, '');
      var lang = pre.dataset.lang || 'javascript';
      if (!hasCM || !CodeMirror.runMode || lang === 'bash' || lang === 'text') { codeEl.textContent = text; }
      else {
        var mode = lang === 'html' ? { name: 'xml', htmlMode: true } : 'javascript';
        pre.classList.add('cm-s-material-darker');
        codeEl.textContent = '';
        CodeMirror.runMode(text, mode, codeEl);
      }
      var wrap = document.createElement('div');
      wrap.className = 'codeblock';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      var label = document.createElement('span');
      label.className = 'lang';
      label.textContent = lang === 'javascript' ? 'js' : lang;
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '複製';
      btn.addEventListener('click', function () {
        copyText(text, function () { btn.textContent = '已複製 ✓'; setTimeout(function () { btn.textContent = '複製'; }, 1300); });
      });
      wrap.appendChild(label);
      wrap.appendChild(btn);
    }
  function copyText(text, done) {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* 忽略 */ }
        ta.remove();
      }
    }

  /* ---------- 執行環境（iframe srcdoc） ---------- */
  var CONSOLE_HOOK = [
    '(function(){',
    'function fmt(v){',
    '  try{',
    '    if(v instanceof Error) return v.name+": "+v.message;',
    '    if(v===null||v===undefined) return String(v);',
    '    if(typeof v==="object"){',
    '      if(v.isColor) return "Color(#"+v.getHexString()+")";',
    '      if(v.isMatrix4||v.isMatrix3){var e=v.elements,n=v.isMatrix4?4:3,rows=[];for(var r=0;r<n;r++){var row=[];for(var c=0;c<n;c++)row.push((+e[c*n+r].toFixed(3)).toString().padStart(7));rows.push(row.join(" "));}return (v.isMatrix4?"Matrix4":"Matrix3")+"\\n"+rows.join("\\n");}',
    '      if(typeof v.toArray==="function"&&(v.isVector2||v.isVector3||v.isVector4||v.isQuaternion||v.isEuler)){return v.constructor.name+"("+v.toArray().map(function(x){return typeof x==="number"?+x.toFixed(4):JSON.stringify(x)}).join(", ")+")";}',
    '      if(v.isBox3) return "Box3(min: "+fmt(v.min)+", max: "+fmt(v.max)+")";',
    '      if(v.isSphere) return "Sphere(center: "+fmt(v.center)+", radius: "+(+v.radius.toFixed(4))+")";',
    '      if(v.isPlane) return "Plane(normal: "+fmt(v.normal)+", constant: "+(+v.constant.toFixed(4))+")";',
    '      if(v.isRay) return "Ray(origin: "+fmt(v.origin)+", direction: "+fmt(v.direction)+")";',
    '      if(v.isObject3D) return v.type+(v.name?"(\\""+v.name+"\\")":"");',
    '      if(v.isBufferGeometry) return v.type+"（頂點 "+(v.attributes.position?v.attributes.position.count:0)+"）";',
    '      if(v.isMaterial) return v.type;',
    '      if(v.isTexture) return v.constructor.name+"(id "+v.id+")";',
    '      if(Array.isArray(v)&&v.some(function(x){return x&&typeof x==="object"&&(x.isVector3||x.isObject3D||x.isVector2)})) return "["+v.map(fmt).join(", ")+"]";',
    '      return JSON.stringify(v,function(k,x){return typeof x==="number"?+x.toFixed(4):x},0);',
    '    }',
    '    return String(v);',
    '  }catch(e){return String(v);}',
    '}',
    'function send(type,args){try{parent.postMessage({__threeDoc:1,type:type,text:[].map.call(args,fmt).join(" ")},"*");}catch(e){}}',
    '["log","info","warn","error"].forEach(function(t){var o=console[t];console[t]=function(){send(t==="info"?"log":t,arguments);o.apply(console,arguments);};});',
    'addEventListener("error",function(e){',
    '  if(e.target&&e.target!==window&&e.target.src){send("error",["資源載入失敗："+e.target.src]);return;}',
    '  send("error",[(e.message||"錯誤")+(e.lineno?"（第 "+e.lineno+" 行）":"")]);',
    '},true);',
    'addEventListener("unhandledrejection",function(e){send("error",["未處理的 Promise 錯誤："+(e.reason&&e.reason.message||e.reason)]);});',
    'parent.postMessage({__threeDoc:1,type:"ready"},"*");',
    '})();'
  ].join('\n');

  function buildDoc(code, opts) {
    var safe = code.replace(/<\/script/gi, '<\\/script');
    return '<!doctype html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>html,body{margin:0;height:100%;overflow:hidden;background:#0a0b0f;color:#e5e7eb;' +
      'font:14px/1.5 -apple-system,"PingFang TC","Noto Sans TC",sans-serif}canvas{display:block}' +
      'button{font:inherit;font-size:13px;padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(20,22,30,.75);color:#fff;cursor:pointer;backdrop-filter:blur(6px)}' +
      'button:hover{background:rgba(60,64,90,.85)}.lil-gui{--font-family:-apple-system,"PingFang TC",sans-serif}</style>' +
      '<script type="importmap">' + JSON.stringify(IMPORT_MAP) + '<\/script>' +
      (opts && opts.standalone ? '' : '<script>' + CONSOLE_HOOK + '<\/script>') +
      '</head><body><script type="module">\n' + safe + '\n<\/script></body></html>';
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || !d.__threeDoc) return;
    for (var i = 0; i < widgets.length; i++) {
      var w = widgets[i];
      if (w.iframe && w.iframe.contentWindow === e.source) { w.onMessage(d); break; }
    }
  });

  /* ---------- 範例元件 ---------- */
  function createExample(el, ex, key) {
    var original = ex.code.replace(/^\n/, '').replace(/\s+$/, '') + '\n';
    var stored = load('code:' + key);
    if (ex.consoleOnly) el.classList.add('console-only');
    var compact = el.classList.contains('compact');
    var showHead = !(compact && !ex.title);

    el.innerHTML =
      (showHead ? '<div class="ex-head"><h3>' + (ex.title || '範例') + '<span class="badge">已修改</span></h3>' +
        (ex.desc ? '<p>' + ex.desc + '</p>' : '') + '</div>' : '') +
      '<div class="ex-body">' +
      '<div class="ex-editor">' +
      '<div class="ex-bar">' +
      '<span class="ex-file"><span class="js">JS</span>main.js</span>' +
      '<span class="ex-hint">可直接編輯' + (showHead ? '' : '<span class="badge">已修改</span>') + '</span>' +
      '<button class="tbtn icon reset" title="還原為原始範例">' + ICON.reset + '</button>' +
      '<button class="tbtn icon copy" title="複製程式碼">' + ICON.copy + '</button>' +
      '<button class="tbtn icon open" title="在新分頁開啟">' + ICON.open + '</button>' +
      '<button class="tbtn run" title="執行（' + MOD + ' + Enter）">' + ICON.play + '<span class="txt">執行</span><kbd>' + MOD + '↵</kbd></button>' +
      '</div>' +
      '<div class="ex-code"></div>' +
      '</div>' +
      '<div class="ex-output">' +
      '<div class="ex-out-head"><span class="status"><span class="dot"></span><span class="st">' + (ex.consoleOnly ? '輸出' : '執行結果') + '</span></span>' +
      '<button class="tbtn icon full" title="全螢幕（Esc 離開）">' + ICON.full + '</button></div>' +
      '<div class="ex-frame"><div class="placeholder"><i>▶</i>點擊執行範例</div></div>' +
      '<div class="ex-console">' +
      '<div class="ex-console-head">Console <span class="count">0</span><button class="tbtn clear" title="清除">' + ICON.trash + '清除</button></div>' +
      '<div class="ex-log"></div>' +
      '</div>' +
      '</div>' +
      '</div>';

    var codeBox = $('.ex-code', el);
    var frameBox = $('.ex-frame', el);
    var consoleBox = $('.ex-console', el);
    var logBox = $('.ex-log', el);
    var countEl = $('.count', el);
    var dot = $('.dot', el);
    var status = $('.st', el);
    var editor, iframe = null, observer = null, saveTimer = null;
    var errCount = 0, lineCount = 0;

    function getCode() { return editor.getValue(); }
    function setModified() { el.classList.toggle('modified', getCode() !== original); }

    if (hasCM) {
      editor = CodeMirror(codeBox, {
        value: stored || original,
        mode: 'javascript',
        theme: 'material-darker',
        lineNumbers: true,
        tabSize: 2,
        indentUnit: 2,
        matchBrackets: true,
        autoCloseBrackets: true,
        viewportMargin: 50,
        extraKeys: {
          'Ctrl-Enter': run, 'Cmd-Enter': run,
          'Tab': function (cm) { cm.somethingSelected() ? cm.indentSelection('add') : cm.replaceSelection('  '); }
        }
      });
      editor.on('change', onChange);
    } else {
      var ta = document.createElement('textarea');
      ta.className = 'fallback';
      ta.spellcheck = false;
      ta.value = stored || original;
      codeBox.appendChild(ta);
      ta.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
      });
      ta.addEventListener('input', onChange);
      editor = { getValue: function () { return ta.value; }, setValue: function (v) { ta.value = v; onChange(); }, refresh: function () { } };
    }
    setModified();

    function onChange() {
      setModified();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        var v = getCode();
        save('code:' + key, v === original ? null : v);
      }, 400);
    }

    function setStatus(kind, text) {
      dot.className = 'dot' + (kind ? ' ' + kind : '');
      status.textContent = text;
    }
    function clearLog() {
      logBox.innerHTML = '';
      errCount = 0; lineCount = 0;
      countEl.textContent = '0';
      countEl.classList.remove('err');
      consoleBox.classList.remove('has');
    }

    function run() {
      clearLog();
      var ph = $('.placeholder', frameBox);
      if (ph) ph.remove();
      if (iframe) iframe.remove();
      iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts allow-pointer-lock');
      iframe.setAttribute('title', (ex.title || '範例') + ' 執行結果');
      iframe.srcdoc = buildDoc(getCode());
      frameBox.appendChild(iframe);
      api.iframe = iframe;
      setStatus('load', '載入中…');
    }

    function onMessage(d) {
      if (d.type === 'ready') { setStatus('on', '執行中'); return; }
      var line = document.createElement('div');
      line.className = d.type;
      line.textContent = d.text;
      logBox.appendChild(line);
      if (logBox.childNodes.length > 500) logBox.removeChild(logBox.firstChild);
      logBox.scrollTop = logBox.scrollHeight;
      consoleBox.classList.add('has');
      lineCount++;
      countEl.textContent = String(lineCount);
      if (d.type === 'error') {
        errCount++;
        countEl.classList.add('err');
        setStatus('err', '發生錯誤（' + errCount + '）');
      }
    }

    function enterFull() {
      el.classList.add('ex-full');
      document.body.classList.add('has-full');
      $('.full', el).innerHTML = ICON.exit;
      if (editor.refresh) setTimeout(function () { editor.refresh(); }, 0);
    }
    function exitFull() {
      el.classList.remove('ex-full');
      document.body.classList.remove('has-full');
      $('.full', el).innerHTML = ICON.full;
      if (editor.refresh) setTimeout(function () { editor.refresh(); }, 0);
    }
    el._exitFull = exitFull;

    $('.run', el).addEventListener('click', run);
    frameBox.addEventListener('click', function (e) { if (e.target.closest('.placeholder')) run(); });
    $('.clear', el).addEventListener('click', clearLog);
    $('.full', el).addEventListener('click', function () { el.classList.contains('ex-full') ? exitFull() : enterFull(); });
    $('.reset', el).addEventListener('click', function () {
      editor.setValue(original);
      save('code:' + key, null);
      setModified();
      run();
    });
    $('.copy', el).addEventListener('click', function (e) {
      var btn = e.currentTarget;
      copyText(getCode(), function () { btn.innerHTML = ICON.check; setTimeout(function () { btn.innerHTML = ICON.copy; }, 1200); });
    });
    $('.open', el).addEventListener('click', function () {
      var blob = new Blob([buildDoc(getCode(), { standalone: true })], { type: 'text/html' });
      window.open(URL.createObjectURL(blob), '_blank');
    });

    var api = {
      iframe: null,
      onMessage: onMessage,
      destroy: function () {
        if (observer) observer.disconnect();
        if (iframe) { iframe.srcdoc = ''; iframe.remove(); }
      }
    };

    // 捲動到可見範圍時才自動執行，避免同時建立過多 WebGL context
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { observer.disconnect(); observer = null; run(); }
      }, { rootMargin: '100px' });
      observer.observe(el);
    } else {
      run();
    }
    return api;
  }

  buildNav();
  route();
})();
