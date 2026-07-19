/* ============================================================
   ARTHOD — main.js
   ============================================================ */
'use strict';

/* ── Disable back/forward swipe gesture ──────────────────── */
window.addEventListener('wheel', e => {
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault();
}, { passive: false });

/* ── Custom cursor: dot + outline ring ────────────────────── */
(function initCustomCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  let cursor = document.getElementById('cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'cursor';
    cursor.innerHTML = '<div id="cursor-dot"></div><div id="cursor-ring"></div>';
    document.body.appendChild(cursor);
  }
  const dot = cursor.querySelector('#cursor-dot');
  const ring = cursor.querySelector('#cursor-ring');
  let rx = 0, ry = 0, tx = 0, ty = 0, hasPoint = false;
  function move(e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!hasPoint) {
      rx = tx;
      ry = ty;
      hasPoint = true;
    }
    dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
    cursor.classList.add('on');
  }
  function tick() {
    rx += (tx - rx) * 0.42;
    ry += (ty - ry) * 0.42;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  }
  window.addEventListener('mousemove', move, { passive: true });
  window.addEventListener('mousedown', () => document.body.classList.add('ch-click'));
  window.addEventListener('mouseup', () => document.body.classList.remove('ch-click'));
  document.addEventListener('mouseover', e => {
    document.body.classList.toggle('ch-hover', !!e.target.closest('a,button,input,textarea,select,[data-media],[contenteditable="true"],.edit-btn'));
  });
  document.addEventListener('mouseleave', () => cursor.classList.remove('on'));
  tick();
})();

/* ── Nav: transparent on hero, solid after ───────────────────*/
const nav  = document.getElementById('site-nav');
const hero = document.querySelector('.hero-wrap');

function updateNav() {
  const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
  nav.classList.toggle('scrolled', window.scrollY > 20);
  // keep nav links white while hero is visible
  document.body.classList.toggle('hero-visible', heroBottom > 60);
}

updateNav();
window.addEventListener('scroll', updateNav, { passive: true });

/* ── Nav: reflect current page ───────────────────────────────*/
(function () {
  const order = ['about.html', 'works.html', 'services.html', 'contact.html'];
  const desktopLinks = [...document.querySelectorAll('.nav-links a')];
  const mobileLinks = [...document.querySelectorAll('.mobile-link')];
  const links = [...desktopLinks, ...mobileLinks];
  if (!links.length) return;

  const clearInlineActive = () => {
    links.forEach(link => {
      link.style.fontWeight = '';
      if (link.closest('.nav-links')) link.style.color = '';
    });
  };

  const setActive = href => {
    links.forEach(link => {
      const target = (link.getAttribute('href') || '').split('#')[0].split('?')[0];
      const same = target === href;
      link.classList.toggle('active', same);
      link.setAttribute('aria-current', same ? 'page' : 'false');
    });
  };

  function activeFromPage() {
    const file = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
    if (file === 'work.html') return 'works.html';
    return order.includes(file) ? file : null;
  }

  function updateActiveNav() {
    const active = activeFromPage();
    clearInlineActive();
    if (active) setActive(active);
  }

  updateActiveNav();
  window.addEventListener('pageshow', updateActiveNav);
})();

/* ── Mobile menu ─────────────────────────────────────────────*/
const toggle  = document.getElementById('nav-toggle');
const overlay = document.getElementById('mobile-overlay');

toggle?.addEventListener('click', () => {
  const open = overlay.classList.toggle('open');
  toggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    overlay.classList.remove('open');
    toggle?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Smooth scroll ───────────────────────────────────────────*/
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = nav ? nav.offsetHeight : 56;
    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
  });
});

/* ── Scroll reveal ───────────────────────────────────────────*/
(function () {
  let revealObserver = null;
  const rEls = () => [...document.querySelectorAll('.r')];

  function stagger(selector, step, max) {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (/\bd\d\b/.test(el.className)) return;
      el.style.setProperty('--r-delay', Math.min(i * step, max).toFixed(2) + 's');
    });
  }

  stagger('.port-grid .port-card', 0.10, 0.60);
  stagger('.svc-list .svc-entry', 0.12, 0.72);
  stagger('.process-steps .process-step', 0.12, 0.48);
  stagger('.faq-list .faq-item', 0.12, 0.48);

  function settle(el) {
    el.classList.add('v');
  }
  function observeReveal(root) {
    const scope = root || document;
    const targets = [...scope.querySelectorAll('.r')].filter(el => !el.classList.contains('v'));
    if (!targets.length) return;
    if (!('IntersectionObserver' in window) || !revealObserver) {
      targets.forEach(settle);
      return;
    }
    targets.forEach(el => revealObserver.observe(el));
  }
  if (!('IntersectionObserver' in window)) {
    rEls().forEach(settle);
    window.ArthodReveal = { refresh: observeReveal, settle };
    return;
  }
  try {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { settle(e.target); revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    rEls().forEach(el => revealObserver.observe(el));
    window.ArthodReveal = { refresh: observeReveal, settle };
  } catch (err) {
    rEls().forEach(settle);
    window.ArthodReveal = { refresh: observeReveal, settle };
  }
})();

/* ── Work card: video hover play ────────────────────────────*/
document.querySelectorAll('.work-card').forEach(card => {
  const vid = card.querySelector('.card-video');
  if (!vid) return;
  let ready = false;
  vid.addEventListener('canplay', () => { ready = true; });

  card.addEventListener('mouseenter', () => {
    if (ready) { vid.play().catch(() => {}); card.classList.add('playing'); }
  });
  card.addEventListener('mouseleave', () => {
    vid.pause(); vid.currentTime = 0; card.classList.remove('playing');
  });

  // Mobile: show overlay on tap
  card.addEventListener('touchstart', e => {
    const was = card.classList.contains('tap');
    document.querySelectorAll('.work-card.tap').forEach(c => c.classList.remove('tap'));
    if (!was) { card.classList.add('tap'); e.preventDefault(); }
  }, { passive: false });
});

/* Inject mobile tap-overlay style */
const mStyle = document.createElement('style');
mStyle.textContent = '@media(hover:none){.work-card .card-overlay{opacity:0}.work-card.tap .card-overlay{opacity:1}}';
document.head.appendChild(mStyle);

/* ── Particles for a4 card ───────────────────────────────────*/
const a4c = document.getElementById('a4c');
if (a4c) {
  const s = document.createElement('style');
  s.textContent = '@keyframes pfloat{0%{transform:translateY(110%);opacity:0}10%{opacity:.7}90%{opacity:.4}100%{transform:translateY(-10%);opacity:0}}';
  document.head.appendChild(s);
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    const sz = Math.random() * 2.5 + .5;
    Object.assign(p.style, {
      position:'absolute', borderRadius:'50%', background:'#2997ff',
      width:sz+'px', height:sz+'px',
      left:Math.random()*100+'%', bottom:'-5%',
      opacity:Math.random()*.7+.1,
      animationName:'pfloat',
      animationDuration:(Math.random()*14+7)+'s',
      animationDelay:(Math.random()*14)+'s',
      animationTimingFunction:'linear',
      animationIterationCount:'infinite',
    });
    a4c.appendChild(p);
  }
}

/* ── Hero video: fade in on load ─────────────────────────────*/
const hv = document.getElementById('hero-video');
if (hv) {
  const load = () => hv.classList.add('loaded');
  hv.muted = true;
  hv.defaultMuted = true;
  hv.playsInline = true;
  hv.addEventListener('canplay', load);
  if (hv.readyState >= 3) load();
  const tryPlay = () => hv.play().catch(() => {});
  hv.addEventListener('canplay', tryPlay, { once: true });
  tryPlay();
}
const fv = document.getElementById('feat-video');
if (fv) {
  const load = () => fv.classList.add('loaded');
  fv.addEventListener('canplay', load);
  if (fv.readyState >= 3) load();
}


/* ══════════════════════════════════════════════════════════
   EDIT MODE  —  텍스트 · 사진 · 영상을 직접 수정
   ─────────────────────────────────────────────────────────
   • 텍스트  : 클릭 후 바로 입력  (localStorage 저장)
   • 사진    : 클릭 → 파일 선택 → 교체  (IndexedDB 저장)
   • 영상    : 히어로 클릭 → 영상 파일 선택  (IndexedDB 저장)
   모든 수정은 이 브라우저에 저장되어 새로고침해도 유지됩니다.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TXT_PREFIX = 'arthod-edit:';
  const _rawPage = (location.pathname.split('/').pop() || 'index').replace('.html', '') || 'index';
  // 세부페이지(work.html)는 모두 같은 파일이라, 작품 id를 붙여 페이지별로 키를 분리
  // work.html 자체가 "id 파라미터 없으면 01번을 기본으로 표시"하는 규칙을 쓰므로,
  // 텍스트 저장 키도 동일한 기본값을 따라야 화면에 보이는 작품과 저장 위치가 항상 일치함
  const _workId = _rawPage === 'work' ? (new URLSearchParams(location.search).get('id') || '01') : null;
  const PAGE = (_rawPage === 'work' && _workId) ? ('work' + _workId) : _rawPage;

  /* ── 1. 수정 가능한 텍스트 (내용 카피만 — 장식/애니메이션 요소 제외) ── */
  const TEXT_SELECTORS = [
    // About
    '.ab-hero-label', '.ab-hero-year', '.ab-hero-title', '.ab-hs-word', '.ab-hero-desc', '.ab-hero-info p',
    '.ab-statement-q', '.ab-statement-body p', '.ab-recent-kicker', '.ab-recent-title', '.ab-recent-count',
    '.ab-recent-meta span', '.ab-recent-desc', '.ab-phil-tag', '.ab-phil-list li',
    '.ab-tl-title', '.ab-tl-sub', '.ab-tl-cat', '.ab-tl-year', '.ab-tl-name', '.ab-tl-desc', '.ab-tl-note', '.ab-cta h2',
    // Works
    '.wp-title', '.wp-subtitle', '.wp-count', '.wp-right p',
    // Work detail  (제목·영문·타입·연도는 공유 저장소로 분리 관리 → 아래 tagShared)
    '.wm-val', '.wb-section-label', '.wb-desc',
    '.spec-val', '.wc-text-block h3', '.wc-about-body', '.wc-caption', '.wn-label', '.wn-title',
    // Services
    '.page-title', '.page-hero-right p', '.svc-entry-name', '.svc-entry-desc', '.svc-tag',
    '.process-title', '.step-name', '.step-desc', '.cta-band h2',
    // Contact
    '.contact-eyebrow', '.contact-big-title', '.contact-desc', '.cdi-label', '.cdi-value',
    '.form-title', '.form-field label', '.form-note', '.faq-title', '.faq-q h3', '.faq-a',
    // Footer (모든 페이지 공통)
    '.f-logo', '.f-tag', '.f-col h4', '.f-col ul a', '.f-copy', '.mob-foot span',
  ];

  let keyed = [];
  function assignKeys() {
    keyed = [];
    TEXT_SELECTORS.forEach(sel => {
      const slug = sel.replace(/[^a-z0-9]+/gi, '').toLowerCase(); // 선택자별 안정 키(폴백용)
      document.querySelectorAll(sel).forEach((el, n) => {
        if (el.dataset.editKey) return;
        if (el.dataset.noEdit === '1') return;
        if (el.dataset.shared || el.dataset.mirror) return; // 공유 필드는 별도 관리
        if (el.dataset.historyManaged === '1') return; // About history는 항목 추가/삭제와 함께 별도 JSON으로 저장
        if (el.parentElement && el.parentElement.closest('[data-edit-key]')) return; // 중첩 방지
        // data-ek가 있으면 그 이름으로 영구 고정 키 사용 (코드가 바뀌어도 안전)
        // 없으면 기존 방식(선택자+등장순서)으로 폴백
        el.dataset.editKey = PAGE + ':' + (el.dataset.ek ? el.dataset.ek : (slug + ':' + n));
        keyed.push(el);
      });
    });
  }
  function restoreText() {
    keyed.forEach(el => {
      const v = localStorage.getItem(TXT_PREFIX + el.dataset.editKey);
      if (v !== null) el.innerHTML = v;
    });
  }
  function normalizeContactFormFields() {
    if (PAGE !== 'contact') return;
    const fixed = {
      name: { label: '이름 / Name', placeholder: '홍길동' },
      org: { label: '소속 / Organization', placeholder: '회사명 또는 개인' },
      email: { label: '이메일 / Email', placeholder: 'hello@example.com' },
      phone: { label: '연락처 / Phone', placeholder: '010-0000-0000' },
      type: { label: '프로젝트 유형 / Project Type' },
      message: { label: '내용 / Message', placeholder: '프로젝트에 대해 간단히 설명해주세요. 규모, 일정, 예산 범위 등을 알려주시면 더 정확한 안내가 가능합니다.' }
    };
    Object.entries(fixed).forEach(([id, cfg]) => {
      const label = document.querySelector(`label[for="${id}"]`);
      const field = document.getElementById(id);
      if (label) {
        label.textContent = cfg.label;
        label.dataset.noEdit = '1';
        label.removeAttribute('contenteditable');
        delete label.dataset.editKey;
      }
      if (field && cfg.placeholder) field.setAttribute('placeholder', cfg.placeholder);
    });
  }
  function saveText() {
    keyed.forEach(el => localStorage.setItem(TXT_PREFIX + el.dataset.editKey, el.innerHTML));
  }

  /* ── 1c. 텍스트 스타일 오버라이드 (폰트 · 크기 · 굵기 · 정렬 · 색상) ── */
  const STYLE_PREFIX = 'arthod-style:';
  const FONT_OPTIONS = [
    { label: '기본', value: '' },
    { label: 'Pretendard', value: "'Pretendard', -apple-system, sans-serif" },
    { label: 'Serif', value: "'Noto Serif KR', Georgia, serif" },
    { label: 'Mono', value: "var(--font-mono, ui-monospace, monospace)" },
    { label: 'Playfair', value: "'Playfair Display', Georgia, serif" },
  ];
  function styleKey(el) { return el.dataset.editKey || el.dataset.shared || el.dataset.historyStyle; }
  function applyStyleRec(el, rec) {
    if (!rec) return;
    if (rec.font) el.style.fontFamily = rec.font; else el.style.removeProperty('font-family');
    if (rec.size) el.style.fontSize = rec.size + 'px'; else el.style.removeProperty('font-size');
    if (rec.weight) el.style.fontWeight = rec.weight; else el.style.removeProperty('font-weight');
    if (rec.italic) el.style.fontStyle = 'italic'; else el.style.removeProperty('font-style');
    if (rec.align) el.style.textAlign = rec.align; else el.style.removeProperty('text-align');
    if (rec.color) el.style.color = rec.color; else el.style.removeProperty('color');
  }
  function restoreStyles() {
    [...keyed, ...sharedEls, ...document.querySelectorAll('[data-history-style]')].forEach(el => {
      const k = styleKey(el); if (!k) return;
      const raw = localStorage.getItem(STYLE_PREFIX + k);
      if (raw) { try { applyStyleRec(el, JSON.parse(raw)); } catch (e) {} }
    });
  }
  function getStyleRec(el) {
    const k = styleKey(el); if (!k) return {};
    try { return JSON.parse(localStorage.getItem(STYLE_PREFIX + k)) || {}; } catch (e) { return {}; }
  }
  function setStyleRec(el, patch) {
    const k = styleKey(el); if (!k) return;
    const rec = Object.assign(getStyleRec(el), patch);
    localStorage.setItem(STYLE_PREFIX + k, JSON.stringify(rec));
    applyStyleRec(el, rec);
  }

  /* ── 1b. 작품 공유 필드 (제목·영문명·타입·연도 — 작품 ID 기준 단일 소스) ──
     Works 카드 · 상세 페이지 · Next Project 가 모두 같은 값을 읽어,
     어느 페이지에서 고쳐도 전부 반영됩니다. */
  const SHARED_PREFIX = 'arthod-proj:';
  let sharedEls = [];
  function tagShared() {
    sharedEls = [];
    const tagOne = (el, field) => { if (!el) return; el.dataset.shared = field; sharedEls.push(el); };
    // Works 목록 카드
    document.querySelectorAll('.port-card').forEach(card => {
      const m = (card.getAttribute('href') || '').match(/id=(\w+)/);
      if (!m) return;
      const id = m[1];
      tagOne(card.querySelector('.card-ko'), id + ':ko');
      tagOne(card.querySelector('.card-en'), id + ':en');
      tagOne(card.querySelector('.card-type'), id + ':project');
      tagOne(card.querySelector('.card-yr'), id + ':year');
      tagOne(card.querySelector('.card-project'), id + ':project');
    });
    // 작품 상세 페이지
    if (document.querySelector('.work-hero-title')) {
      const id = (new URLSearchParams(location.search).get('id') || '01').padStart(2, '0');
      tagOne(document.querySelector('.wht-ko'), id + ':ko');
      tagOne(document.querySelector('.wht-en'), id + ':en');
      document.querySelectorAll('.work-meta-bar .wm-item').forEach(item => {
        const label = (item.querySelector('.wm-label')?.textContent || '').trim().toLowerCase();
        const val = item.querySelector('.wm-val');
        if (label === 'year') tagOne(val, id + ':year');
        else if (label === 'project') tagOne(val, id + ':project');
        else if (label === 'client') tagOne(val, id + ':clientorg');
      });
      // Next Project 제목 — 미러(읽기 전용): 다음 작품의 국문 제목을 반영
      const wn = document.querySelector('.wn-title');
      const nextHref = document.querySelector('.work-next')?.getAttribute('href') || '';
      const nm = nextHref.match(/id=(\w+)/);
      if (wn && nm) wn.dataset.mirror = nm[1] + ':ko';
    }
    document.querySelectorAll('[data-connect-index]').forEach(link => {
      tagOne(link, 'footer-connect-' + link.dataset.connectIndex + ':name');
    });
  }
  function restoreShared() {
    sharedEls.forEach(el => {
      const v = localStorage.getItem(SHARED_PREFIX + el.dataset.shared);
      if (el.dataset.shared && el.dataset.shared.indexOf('footer-connect-') === 0) {
        if (!v || !v.trim()) return;
        el.textContent = v;
        const normalizedUrl = defaultUrlForConnectName(v);
        if (normalizedUrl !== '#') el.href = normalizedUrl;
        return;
      }
      if (v !== null) el.textContent = v;
    });
  }
  function migrateLegacyProjectTitles() {
    const legacyTitle = localStorage.getItem(SHARED_PREFIX + '01:ko');
    if (legacyTitle === '빛의 파동') localStorage.setItem(SHARED_PREFIX + '01:ko', 'Stream Scape');
    const legacyEn = localStorage.getItem(SHARED_PREFIX + '01:en');
    if (legacyEn === 'Wave of Light') localStorage.setItem(SHARED_PREFIX + '01:en', 'Interactive Media Art · Generative AI');
  }
  function applyMirrors() {
    document.querySelectorAll('[data-mirror]').forEach(el => {
      const v = localStorage.getItem(SHARED_PREFIX + el.dataset.mirror);
      if (v !== null) el.textContent = v;
    });
    const wht = document.querySelector('.wht-ko');
    if (wht && document.querySelector('.work-hero-title')) {
      document.title = wht.textContent.trim() + ' — ARTHOD';
    }
  }
  function saveShared() {
    sharedEls.forEach(el => {
      localStorage.setItem(SHARED_PREFIX + el.dataset.shared, el.textContent.trim());
    });
  }

  /* Footer Connect는 모든 페이지에서 같은 목록과 편집 UI를 사용한다. */
  const FOOTER_CONNECT_KEY = 'arthod-connect:global';
  const FOOTER_CONNECT_DEFAULTS = [
    { name: 'Instagram', url: 'https://www.instagram.com/arthod_studio/' },
    { name: 'Youtube', url: 'https://www.youtube.com/@%EC%95%84%EC%8F%98%EB%93%9C' },
  ];
  let footerConnectItems = [];
  function defaultUrlForConnectName(name) {
    const normalized = String(name || '').trim().toLowerCase();
    if (normalized === 'instagram') return 'https://www.instagram.com/arthod_studio/';
    if (normalized === 'youtube') return 'https://www.youtube.com/@%EC%95%84%EC%8F%98%EB%93%9C';
    return '#';
  }
  function readFooterConnect() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(FOOTER_CONNECT_KEY) ||
        localStorage.getItem('arthod-connect:services')
      );
      if (Array.isArray(saved)) return saved.slice(0, 30)
        .map((item, index) => ({
          name: String(item?.name || '').trim(),
          url: String(item?.url && item.url !== '#' ? item.url : defaultUrlForConnectName(item?.name)),
          fallbackName: `Connect ${index + 1}`,
        }))
        .filter(item => item.name && item.url !== '#')
        .map(item => ({ name: item.name || item.fallbackName, url: item.url }));
    } catch (e) {}
    return FOOTER_CONNECT_DEFAULTS.map(item => ({ ...item }));
  }
  function safeConnectUrl(value) {
    const url = String(value || '').trim();
    return !url || /^javascript:/i.test(url) ? '#' : url;
  }
  function saveFooterConnect() {
    localStorage.setItem(FOOTER_CONNECT_KEY, JSON.stringify(footerConnectItems));
  }
  function restoreFooterConnect() {
    const connectCol = [...document.querySelectorAll('.footer .f-col')].find(col =>
      (col.querySelector('h4')?.textContent || '').trim().toLowerCase() === 'connect'
    );
    const list = connectCol?.querySelector('ul');
    document.querySelector('.footer-bot .f-soc')?.remove();
    if (!list) return;
    footerConnectItems = readFooterConnect();
    saveFooterConnect();
    list.innerHTML = '';
    footerConnectItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'connect-edit-item';
      const link = document.createElement('a');
      link.href = safeConnectUrl(item.url);
      link.textContent = item.name;
      link.dataset.connectIndex = String(index);
      link.addEventListener('input', () => {
        footerConnectItems[index].name = link.textContent.trim() || `Connect ${index + 1}`;
        localStorage.setItem(SHARED_PREFIX + `footer-connect-${index}:name`, footerConnectItems[index].name);
        saveFooterConnect();
      });
      link.addEventListener('click', event => {
        if (document.body.classList.contains('editing')) event.preventDefault();
      });
      li.appendChild(link);
      if (isEditorAllowed()) {
        const controls = document.createElement('span');
        controls.className = 'connect-edit-controls';
        const urlInput = document.createElement('input');
        urlInput.type = 'url';
        urlInput.value = item.url === '#' ? '' : item.url;
        urlInput.placeholder = 'https://';
        urlInput.setAttribute('aria-label', `${item.name} 링크`);
        urlInput.addEventListener('change', () => {
          footerConnectItems[index].url = safeConnectUrl(urlInput.value);
          link.href = footerConnectItems[index].url;
          saveFooterConnect();
        });
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '−';
        remove.title = 'Connect 항목 삭제';
        remove.addEventListener('click', () => {
          footerConnectItems.splice(index, 1);
          saveFooterConnect();
          restoreFooterConnect();
          refreshFooterConnectEditor();
        });
        controls.append(urlInput, remove);
        li.appendChild(controls);
      }
      list.appendChild(li);
    });
    const count = document.querySelector('.connect-count');
    if (count) count.textContent = String(footerConnectItems.length);
  }
  function refreshFooterConnectEditor() {
    tagShared();
    restoreShared();
    restoreStyles();
    if (editing) {
      sharedEls.forEach(el => {
        el.contentEditable = 'true';
        el.spellcheck = false;
      });
    }
  }
  function installFooterConnectToolbar() {
    if (!isEditorAllowed()) return;
    if (!bar || bar.querySelector('.connect-add') || !document.querySelector('[data-connect-index]')) return;
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'connect-add';
    add.innerHTML = 'Connect + <span class="connect-count">' + footerConnectItems.length + '</span>';
    add.addEventListener('click', () => {
      footerConnectItems.push({ name: `Connect ${footerConnectItems.length + 1}`, url: '#' });
      saveFooterConnect();
      restoreFooterConnect();
      refreshFooterConnectEditor();
      document.querySelector('.connect-edit-item:last-child a')?.focus();
    });
    bar.insertBefore(add, bar.querySelector('.edit-bake'));
  }

  const ABOUT_HISTORY_KEY = 'arthod-about:history-items';
  const ABOUT_HISTORY_LAYOUT_VERSION_KEY = 'arthod-about:history-layout-version';
  const ABOUT_HISTORY_LEGACY_MIGRATION_KEY = 'arthod-about:history-legacy-migrated';
  const ABOUT_HISTORY_RECOVERY_KEY = 'arthod-about:history-recovered';
  const ABOUT_HISTORY_LAYOUT_VERSION = 'history-list-v2';
  const ABOUT_HISTORY_RECOVERY_VERSION = 'history-recovered-20260710-mediafantagy';
  const ABOUT_HISTORY_RECOVERY_ITEMS = [
    {
      category: 'Exhibitions',
      items: [
        { year: '2025', name: 'Stream Scape', desc: 'Interactive Media Art & Generative Al • 고양콘텐츠사업화 • 고양산업진흥원' },
        { year: '', name: 'OS-1 : 우주광학전송장치', desc: 'Laser Installation • 미래감각 • 고양문화재단' },
        { year: '', name: 'Voyage of Light', desc: 'Light Installation • 제24회 서울억새축제, 빛으로 물들다 • 서부여가공원센터' },
        { year: '', name: 'Infinity Book', desc: 'Public Installation • 제7회 별마당도서관 열린아트공모전 대상작 전시 • (주)신세계프라버티' },
        { year: '2024', name: 'Luminous Melody', desc: 'Interactive Light Installation • 고양콘텐츠사업화 • 고양산업진흥원' },
        { year: '', name: 'OS-1 : 우주광학전송장치', desc: 'Laser Installation • 다원예술 창작산실 • 한국문화예술위원회' },
        { year: '', name: 'Transmission', desc: 'Laser Reflection installation • 국가유산 수원화성 미디어아트 • 수원문화재단' },
        { year: '2023', name: 'Emotion Particle', desc: 'Interactive Media Installation • 미디어아트ON • 남원아트센터' },
        { year: '', name: 'Emotion Cloud', desc: 'Interactive Light Installation • 모든예술31 • 부천문화재단' },
      ],
      note: '',
    },
    {
      category: 'Awards',
      items: [
        { year: '2025', name: '별마당도서관 열린아트공모전 대상', desc: 'Infinity Book • Public Installation' },
        { year: '2024', name: 'Asia Design Prize WINNER 수상', desc: 'Emotion Cloud • Interactive Light Installation' },
      ],
      note: '각 카테고리는 항목을 계속 추가하거나 제목을 바꿔서 사용할 수 있습니다.',
    },
    {
      category: 'Education',
      items: [
        { year: '2025', name: "교육발전특구 '미디어판타GY' 강의", desc: '생성형 AI & 미디어아트 • 일산서구청소년수련관' },
        { year: '', name: '서강대학교 특강', desc: '미디어 아티스트를 위한 프로젝션 맵핑 • 아트&테크놀로지 전공' },
        { year: '', name: '계원예술대학교 출강', desc: '미디어아트 • 미래디자인학부' },
        { year: '2024', name: '문화PD 22기 문화디지털신기술 체험•실습 및 지역간담회 특강', desc: '생성형 AI & 미디어아트 • 한국문화정보원' },
        { year: '2023', name: '프로젝션 맵핑의 시작', desc: '프로젝션 맵핑 • 상상마당 아카데미 • 2023~2026' },
        { year: '', name: '프로젝션 맵핑 아트브릿지 강의', desc: '생성형 AI & 미디어아트 •.서초유스센터 • 2022~2024' },
        { year: '2022', name: '부천아트벙커B39 강의', desc: '미디어파사드 기초 & 심화 • 부천문화재단• 2021~2022' },
        { year: '', name: '창작날개22 강의', desc: '프로젝션 맵핑 • 김포문화재단' },
        { year: '2021', name: 'Class 101 온라인 강의 런칭', desc: '프로젝션 맵핑 & 무대영상' },
      ],
      note: '',
    },
  ];
  function isAboutPage() {
    return PAGE === 'about' && !!document.querySelector('.ab-tl-grid');
  }
  function plainAboutHistoryText(value) {
    const div = document.createElement('div');
    div.innerHTML = String(value || '');
    return (div.textContent || div.innerText || '').trim();
  }
  function normalizeAboutHistory(items) {
    return (items || []).map(group => ({
      category: plainAboutHistoryText(group.category) || 'Category',
      items: (group.items || []).map(item => ({
        year: plainAboutHistoryText(item.year) === 'Year' ? '' : plainAboutHistoryText(item.year),
        name: plainAboutHistoryText(item.name) || 'Title',
        desc: plainAboutHistoryText(item.desc) || 'Description',
      })),
      note: plainAboutHistoryText(group.note),
    })).filter(group => {
      const isPlaceholderCategory = /^Category\s+\d+$/i.test(group.category);
      const onlyPlaceholderItem = group.items.length === 1
        && !group.items[0].year
        && group.items[0].name === '새 내역'
        && group.items[0].desc === '설명을 입력하세요.'
        && !group.note;
      return !(isPlaceholderCategory && onlyPlaceholderItem);
    });
  }
  function removeDeprecatedAboutHistory(items) {
    return normalizeAboutHistory(items).filter(group => {
      const names = (group.items || []).map(item => plainAboutHistoryText(item.name));
      const isOldAwardsGroup = plainAboutHistoryText(group.category) === 'Awards'
        && names.length > 0
        && names.every(name => name === 'Media Art Festival Award' || name === 'Interactive Experience Selection');
      return !isOldAwardsGroup;
    });
  }
  function recoverAboutHistory(items) {
    const normalized = removeDeprecatedAboutHistory(items);
    const recoveryApplied = localStorage.getItem(ABOUT_HISTORY_RECOVERY_KEY) === ABOUT_HISTORY_RECOVERY_VERSION;
    const historyText = JSON.stringify(normalized);
    const missingRecoveredText = !historyText.includes('미디어판타GY') || !historyText.includes('상상마당 아카데미');
    if (!recoveryApplied && missingRecoveredText) {
      localStorage.setItem(ABOUT_HISTORY_RECOVERY_KEY, ABOUT_HISTORY_RECOVERY_VERSION);
      return removeDeprecatedAboutHistory(ABOUT_HISTORY_RECOVERY_ITEMS);
    }
    if (!recoveryApplied && !missingRecoveredText) {
      localStorage.setItem(ABOUT_HISTORY_RECOVERY_KEY, ABOUT_HISTORY_RECOVERY_VERSION);
    }
    return normalized;
  }
  function readAboutHistoryFromDom() {
    return [...document.querySelectorAll('.ab-tl-group')].map(group => ({
      category: group.querySelector('.ab-tl-cat')?.textContent.trim() || 'Category',
      items: [...group.querySelectorAll('.ab-tl-item')].map(item => ({
        year: item.querySelector('.ab-tl-year')?.textContent.trim() || '',
        name: item.querySelector('.ab-tl-name')?.textContent.trim() || 'Title',
        desc: item.querySelector('.ab-tl-desc')?.textContent.trim() || 'Description',
      })),
      note: group.querySelector('.ab-tl-note')?.textContent.trim() || '',
    }));
  }
  function readAboutHistory() {
    const raw = localStorage.getItem(ABOUT_HISTORY_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return recoverAboutHistory(parsed);
      } catch (e) {}
    }
    return recoverAboutHistory(readAboutHistoryFromDom());
  }
  function saveAboutHistory(items) {
    localStorage.setItem(ABOUT_HISTORY_KEY, JSON.stringify(removeDeprecatedAboutHistory(items)));
    localStorage.setItem(ABOUT_HISTORY_LAYOUT_VERSION_KEY, ABOUT_HISTORY_LAYOUT_VERSION);
  }
  function legacyAboutText(slug, index) {
    return localStorage.getItem(TXT_PREFIX + `about:${slug}:${index}`);
  }
  function migrateAboutHistoryLegacyText(items) {
    if (localStorage.getItem(ABOUT_HISTORY_LEGACY_MIGRATION_KEY) === ABOUT_HISTORY_LAYOUT_VERSION) return items;
    let changed = false;
    let flatIndex = 0;
    const migrated = items.map((group, groupIndex) => {
      const nextGroup = { ...group, items: (group.items || []).map(item => ({ ...item })) };
      const cat = legacyAboutText('abtlcat', groupIndex);
      if (cat !== null) { nextGroup.category = plainAboutHistoryText(cat) || nextGroup.category; changed = true; }
      nextGroup.items = nextGroup.items.map(item => {
        const nextItem = { ...item };
        const year = legacyAboutText('abtlyear', flatIndex);
        const name = legacyAboutText('abtlname', flatIndex);
        const desc = legacyAboutText('abtldesc', flatIndex);
        if (year !== null) { nextItem.year = plainAboutHistoryText(year); changed = true; }
        if (name !== null) { nextItem.name = plainAboutHistoryText(name) || nextItem.name; changed = true; }
        if (desc !== null) { nextItem.desc = plainAboutHistoryText(desc) || nextItem.desc; changed = true; }
        flatIndex += 1;
        return nextItem;
      });
      const note = legacyAboutText('abtlnote', groupIndex);
      if (note !== null) { nextGroup.note = plainAboutHistoryText(note); changed = true; }
      return nextGroup;
    });
    localStorage.setItem(ABOUT_HISTORY_LEGACY_MIGRATION_KEY, ABOUT_HISTORY_LAYOUT_VERSION);
    if (changed) saveAboutHistory(migrated);
    return changed ? migrated : items;
  }
  function moveAboutHistoryGroup(groupIndex, delta) {
    const latest = readAboutHistoryFromDom();
    const nextIndex = groupIndex + delta;
    if (nextIndex < 0 || nextIndex >= latest.length) return;
    const [moved] = latest.splice(groupIndex, 1);
    latest.splice(nextIndex, 0, moved);
    saveAboutHistory(latest);
    renderAboutHistory(latest);
    aboutHistoryEditableRefresh();
    toast('History 순서를 변경했습니다');
  }
  function moveAboutHistoryItem(groupIndex, itemIndex, delta) {
    const latest = readAboutHistoryFromDom();
    const group = latest[groupIndex];
    if (!group || !Array.isArray(group.items)) return;
    const nextIndex = itemIndex + delta;
    if (nextIndex < 0 || nextIndex >= group.items.length) return;
    const [moved] = group.items.splice(itemIndex, 1);
    group.items.splice(nextIndex, 0, moved);
    saveAboutHistory(latest);
    renderAboutHistory(latest);
    aboutHistoryEditableRefresh();
    toast('History 항목 순서를 변경했습니다');
  }
  function aboutHistoryEditableRefresh() {
    assignKeys();
    restoreText();
    restoreStyles();
    if (editing) {
      keyed.forEach(el => {
        el.contentEditable = 'true';
        el.spellcheck = false;
      });
      setAboutHistoryEditable(true);
    }
  }
  function aboutHistoryControlsAllowed() {
    return isEditorAllowed();
  }
  function renderAboutHistory(items) {
    const grid = document.querySelector('.ab-tl-grid');
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach((group, groupIndex) => {
      const section = document.createElement('section');
      section.className = 'ab-tl-group r' + (groupIndex % 3 ? ` d${groupIndex % 3}` : '');
      const hasHistoryContent = (group.items || []).length > 0 || !!plainAboutHistoryText(group.note);
      if (!hasHistoryContent) section.classList.add('is-empty');
      const cat = document.createElement('h3');
      cat.className = 'ab-tl-cat';
      cat.dataset.ek = `history-cat-${groupIndex}`;
      cat.dataset.historyManaged = '1';
      cat.dataset.historyStyle = `about-history-${groupIndex}-cat`;
      cat.textContent = group.category || `Category ${groupIndex + 1}`;
      const list = document.createElement('div');
      list.className = 'ab-tl-list';
      (group.items || []).forEach((item, itemIndex) => {
        const row = document.createElement('div');
        row.className = 'ab-tl-item r';
        row.style.setProperty('--r-delay', Math.min(itemIndex * 0.04, 0.24).toFixed(2) + 's');
        row.dataset.historyGroup = String(groupIndex);
        row.dataset.historyItem = String(itemIndex);
        row.innerHTML =
          `<span class="ab-tl-year" data-ek="history-${groupIndex}-${itemIndex}-year"></span>`
          + `<div><div class="ab-tl-name" data-ek="history-${groupIndex}-${itemIndex}-name"></div>`
          + `<p class="ab-tl-desc" data-ek="history-${groupIndex}-${itemIndex}-desc"></p></div>`;
        row.querySelector('.ab-tl-year').textContent = item.year || '';
        row.querySelector('.ab-tl-name').textContent = item.name || 'Title';
        row.querySelector('.ab-tl-desc').textContent = item.desc || 'Description';
        row.querySelectorAll('.ab-tl-year,.ab-tl-name,.ab-tl-desc').forEach(el => { el.dataset.historyManaged = '1'; });
        row.querySelector('.ab-tl-year').dataset.historyStyle = `about-history-${groupIndex}-${itemIndex}-year`;
        row.querySelector('.ab-tl-name').dataset.historyStyle = `about-history-${groupIndex}-${itemIndex}-name`;
        row.querySelector('.ab-tl-desc').dataset.historyStyle = `about-history-${groupIndex}-${itemIndex}-desc`;
        if (aboutHistoryControlsAllowed()) {
          const move = document.createElement('span');
          move.className = 'history-move';
          move.innerHTML = `<button type="button" class="history-up" aria-label="항목 위로">↑</button><button type="button" class="history-down" aria-label="항목 아래로">↓</button>`;
          const del = document.createElement('button');
          del.className = 'history-del';
          del.type = 'button';
          del.setAttribute('aria-label', 'History 항목 삭제');
          del.textContent = '삭제';
          del.addEventListener('click', () => {
            const latest = readAboutHistoryFromDom();
            latest[groupIndex].items.splice(itemIndex, 1);
            saveAboutHistory(latest);
            renderAboutHistory(latest);
            aboutHistoryEditableRefresh();
            toast('History 항목을 삭제했습니다');
          });
          move.querySelector('.history-up').disabled = itemIndex === 0;
          move.querySelector('.history-down').disabled = itemIndex === (group.items || []).length - 1;
          move.querySelector('.history-up').addEventListener('click', () => moveAboutHistoryItem(groupIndex, itemIndex, -1));
          move.querySelector('.history-down').addEventListener('click', () => moveAboutHistoryItem(groupIndex, itemIndex, 1));
          row.append(move, del);
        }
        list.appendChild(row);
      });
      let groupControls = null;
      if (aboutHistoryControlsAllowed()) {
        groupControls = document.createElement('div');
        groupControls.className = 'history-group-controls';
        groupControls.innerHTML =
          `<button type="button" class="history-group-up" aria-label="카테고리 위로">↑</button>`
          + `<button type="button" class="history-group-down" aria-label="카테고리 아래로">↓</button>`;
        groupControls.querySelector('.history-group-up').disabled = groupIndex === 0;
        groupControls.querySelector('.history-group-down').disabled = groupIndex === items.length - 1;
        groupControls.querySelector('.history-group-up').addEventListener('click', () => moveAboutHistoryGroup(groupIndex, -1));
        groupControls.querySelector('.history-group-down').addEventListener('click', () => moveAboutHistoryGroup(groupIndex, 1));
        const add = document.createElement('button');
        add.className = 'history-add-item';
        add.type = 'button';
        add.textContent = '항목 +';
        add.addEventListener('click', () => {
          const latest = readAboutHistoryFromDom();
          latest[groupIndex].items.push({ year: '', name: '새 내역', desc: '설명을 입력하세요.' });
          saveAboutHistory(latest);
          renderAboutHistory(latest);
          aboutHistoryEditableRefresh();
          const last = document.querySelectorAll('.ab-tl-group')[groupIndex]?.querySelector('.ab-tl-item:last-of-type .ab-tl-year');
          last?.focus();
          toast('History 항목을 추가했습니다');
        });
        list.appendChild(add);
      }
      if (group.note) {
        const note = document.createElement('p');
        note.className = 'ab-tl-note r';
        note.dataset.ek = `history-note-${groupIndex}`;
        note.dataset.historyManaged = '1';
        note.dataset.historyStyle = `about-history-${groupIndex}-note`;
        note.textContent = group.note;
        list.appendChild(note);
      }
      section.append(cat);
      if (groupControls) section.append(groupControls);
      section.append(list);
      grid.appendChild(section);
    });
    window.ArthodReveal?.refresh(grid);
  }
  function restoreAboutHistory() {
    if (!isAboutPage()) return;
    const hasHistoryStore = localStorage.getItem(ABOUT_HISTORY_KEY) !== null;
    const items = hasHistoryStore ? readAboutHistory() : migrateAboutHistoryLegacyText(readAboutHistory());
    saveAboutHistory(items);
    renderAboutHistory(items);
  }
  function setAboutHistoryEditable(on) {
    document.querySelectorAll('[data-history-managed="1"]').forEach(el => {
      el.contentEditable = on ? 'true' : 'false';
      if (on) el.spellcheck = false;
      el.oninput = on ? () => saveAboutHistory(readAboutHistoryFromDom()) : null;
      el.onblur = on ? () => saveAboutHistory(readAboutHistoryFromDom()) : null;
    });
  }
  function installAboutHistoryToolbar() {
    if (!bar || !isAboutPage() || bar.querySelector('.history-add-group')) return;
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'history-add-group';
    add.textContent = 'History +';
    add.addEventListener('click', () => {
      const latest = readAboutHistoryFromDom();
      latest.push({
        category: `Category ${latest.length + 1}`,
        items: [{ year: '', name: '새 내역', desc: '설명을 입력하세요.' }],
        note: '',
      });
      saveAboutHistory(latest);
      renderAboutHistory(latest);
      aboutHistoryEditableRefresh();
      document.querySelector('.ab-tl-group:last-child .ab-tl-cat')?.focus();
      toast('History 카테고리를 추가했습니다');
    });
    bar.insertBefore(add, bar.querySelector('.edit-bake'));
  }
  window.addEventListener('pageshow', () => {
    if (!isAboutPage()) return;
    restoreAboutHistory();
    setAboutHistoryEditable(document.body.classList.contains('editing'));
  });

  /* ── 2. 미디어 저장소 (IndexedDB — 사진/영상 Blob) ── */
  const DB_NAME = 'arthod-media';
  let _dbp = null;
  let publicMediaIndex = null;
  let publicMediaBase = '';
  let publicMediaVersion = '';
  function publicMediaRec(key, seen) {
    if (!publicMediaIndex || !key) return null;
    const guard = seen || new Set();
    if (guard.has(key)) return null;
    guard.add(key);
    const info = publicMediaIndex[key];
    if (!info) return null;
    if (info.kind === 'ref') {
      return publicMediaRec(info.refKey, guard);
    }
    if (info.kind === 'embed') {
      return { kind: 'embed', embedUrl: info.embedUrl || info.url || info.src || '' };
    }
    if (info.file) {
      const sep = info.file.indexOf('?') >= 0 ? '&' : '?';
      const posterFile = info.poster || ((info.kind === 'video' && /\.(mp4|mov|webm)$/i.test(info.file))
        ? info.file.replace(/\.(mp4|mov|webm)(\?.*)?$/i, '.jpg')
        : '');
      return {
        kind: info.kind || 'image',
        url: publicMediaBase + info.file + sep + 'v=' + encodeURIComponent(publicMediaVersion || 'public-media'),
        posterUrl: posterFile ? publicMediaBase + posterFile + '?v=' + encodeURIComponent(publicMediaVersion || 'public-media') : '',
      };
    }
    return null;
  }
  function db() {
    if (_dbp) return _dbp;
    _dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('m');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return _dbp;
  }
  async function mediaGet(k) {
    try {
      const d = await db();
      return await new Promise(res => {
        const t = d.transaction('m').objectStore('m').get(k);
        t.onsuccess = () => res(t.result || null);
        t.onerror = () => res(null);
      });
    } catch (e) { return null; }
  }
  async function resolveMediaRec(rec, seen) {
    if (!rec || rec.kind !== 'ref') return rec;
    const guard = seen || new Set();
    if (!rec.refKey || guard.has(rec.refKey)) return null;
    guard.add(rec.refKey);
    return resolveMediaRec((await mediaGet(rec.refKey)) || publicMediaRec(rec.refKey, guard), guard);
  }
  async function mediaResolved(k) {
    return resolveMediaRec((await mediaGet(k)) || publicMediaRec(k));
  }
  async function mediaSet(k, v) {
    try {
      const d = await db();
      return await new Promise((res, rej) => {
        const tx = d.transaction('m', 'readwrite');
        tx.objectStore('m').put(v, k);
        tx.oncomplete = () => {
          window.dispatchEvent(new CustomEvent('arthod:media-updated', { detail: { key: k } }));
          res();
        };
        tx.onerror = () => rej(tx.error);
      });
    } catch (e) { /* ignore */ }
  }
  async function mediaClear() {
    try {
      const d = await db();
      return await new Promise(res => {
        const tx = d.transaction('m', 'readwrite');
        tx.objectStore('m').clear();
        tx.oncomplete = () => res();
      });
    } catch (e) { /* ignore */ }
  }

  async function mediaDelete(k) {
    try {
      const d = await db();
      return await new Promise(res => {
        const tx = d.transaction('m', 'readwrite');
        tx.objectStore('m').delete(k);
        tx.oncomplete = () => {
          window.dispatchEvent(new CustomEvent('arthod:media-updated', { detail: { key: k } }));
          res();
        };
      });
    } catch (e) { /* ignore */ }
  }
  async function mediaAll() {
    try {
      const d = await db();
      return await new Promise(res => {
        const store = d.transaction('m').objectStore('m');
        const kr = store.getAllKeys(); const vr = store.getAll();
        let keys = null, vals = null;
        const done = () => { if (keys && vals) res(keys.map((k, i) => ({ key: k, rec: vals[i] }))); };
        kr.onsuccess = () => { keys = kr.result; done(); };
        vr.onsuccess = () => { vals = vr.result; done(); };
        kr.onerror = vr.onerror = () => res([]);
      });
    } catch (e) { return []; }
  }
  function humanLabel(key) {
    if (key === 'home:hero') return '홈 — 히어로 배경';
    if (key.indexOf('wimg:') === 0) return '작품 ' + key.split(':')[1] + ' — 대표 이미지 (Works 카드·상세 공용)';
    if (key.indexOf('whover:') === 0) {
      const p = key.split(':');
      return '작품 ' + p[1] + ' — Works 디졸브 ' + p[2];
    }
    if (key.indexOf('works:') === 0) { const m = key.match(/id=(\d+)/); return 'Works — 작품 ' + (m ? m[1] : ''); }
    if (key.indexOf('svc:') === 0) return 'Services — ' + (parseInt(key.split(':')[1], 10) + 1) + '번';
    if (key.indexOf('wd:') === 0) {
      const p = key.split(':'); const id = p[1]; const slot = p[2];
      let s = slot;
      if (slot[0] === 's') s = '슬라이드 ' + (parseInt(slot.slice(1), 10) + 1);
      else if (slot === 'c0') s = '대표 이미지';
      else if (slot === 'next') s = '다음 프로젝트 이미지';
      else if (slot[0] === 'g') s = '갤러리 ' + slot.slice(1);
      return '작품 ' + id + ' — ' + s;
    }
    return key;
  }

  /* ── 3. 미디어 슬롯 태깅 (정적 요소) ── */
  function tagMedia() {
    const hero = document.querySelector('.hero-card');
    if (hero && !hero.dataset.media) {
      hero.dataset.media = 'hero';
      hero.dataset.mediaKey = 'home:hero';
    }
    document.querySelectorAll('.port-card').forEach(pc => {
      const inner = pc.querySelector('.card-inner');
      if (inner && !inner.dataset.media) {
        const m = (pc.getAttribute('href') || '').match(/id=(\w+)/);
        inner.dataset.media = 'image';
        // Works 카드 이미지 = 상세 페이지 대표 이미지 (공용 키)
        inner.dataset.mediaKey = m ? ('wimg:' + m[1]) : ('works:' + pc.getAttribute('href'));
      }
    });
    document.querySelectorAll('.svc-entry').forEach((e, i) => {
      if (e.querySelector('.svc-img') && !e.dataset.media) {
        e.dataset.media = 'image';
        e.dataset.mediaKey = 'svc:' + i;
      }
    });
  }

  /* ── 4. 미디어 적용 ── */
  function applyImage(container, url) {
    const mediaKey = container.dataset.mediaKey || '';
    if (mediaKey === 'wimg:07') {
      url = 'https://raw.githubusercontent.com/arthod-studio/arthod-website-backup/main/backup/media/07/whover_07_2.jpg';
    }
    if (mediaKey === 'wimg:08') {
      url = 'https://raw.githubusercontent.com/arthod-studio/arthod-website-backup/main/backup/media/07/wd_07_next.jpg';
    }
    const img = container.querySelector('img');
    if (img) { img.src = url; }
    else {
      const bg = container.querySelector('.card-bg, .svc-img, .whs-slide, .wn-bg');
      if (bg) bg.style.backgroundImage = `url("${url}")`;
      else container.style.backgroundImage = `url("${url}")`;
    }
    const pc = container.closest('.port-card');
    if (pc && !(container.dataset.mediaKey || '').startsWith('whover:')) pc.setAttribute('data-custom-img', '1');
    markCustom(container);
  }
  function recUrl(rec) {
    if (!rec) return '';
    if (rec.url) return rec.url;
    return rec.blob ? URL.createObjectURL(rec.blob) : '';
  }
  // 유튜브/비메오 iframe: 클릭 전엔 썸네일+재생 버튼만 보여주고,
  // 실제 클릭(사용자 제스처)이 발생했을 때만 autoplay+소리 켜진 iframe을 새로 로드한다.
  // → 브라우저 자동재생 정책에 걸리지 않아 소리가 확실히 나온다.
  function embedIdInfo(embedUrl) {
    let m = embedUrl.match(/youtube\.com\/embed\/([\w-]{11})/);
    if (m) return { kind: 'youtube', id: m[1] };
    m = embedUrl.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (m) return { kind: 'vimeo', id: m[1] };
    return null;
  }
  function setYouTubePoster(poster, id) {
    const candidates = [
      `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${id}/sddefault.jpg`,
      `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    ];
    const tryImage = index => {
      const url = candidates[index];
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 320 || index === candidates.length - 1) {
          poster.style.backgroundImage = `url("${url}")`;
        } else {
          tryImage(index + 1);
        }
      };
      img.onerror = () => {
        if (index < candidates.length - 1) tryImage(index + 1);
      };
      img.src = url;
    };
    tryImage(0);
  }
  function ensureMediaPlayStyles() {
    if (document.getElementById('arthod-media-play-style')) return;
    const st = document.createElement('style');
    st.id = 'arthod-media-play-style';
    st.textContent = `
      .media-poster:hover .media-play-btn{background:rgba(0,0,0,.85);transform:scale(1.08)}
      .media-play-btn{
        width:76px;height:76px;border-radius:50%;background:rgba(0,0,0,.62);border:2px solid rgba(255,255,255,.88);
        display:flex;align-items:center;justify-content:center;appearance:none;-webkit-appearance:none;padding:0;margin:0;
        transition:background .2s,transform .2s;box-shadow:0 14px 34px rgba(0,0,0,.28);cursor:pointer;
      }
      .media-play-btn span{
        display:block;width:0;height:0;margin-left:6px;border-top:15px solid transparent;border-bottom:15px solid transparent;border-left:22px solid #fff;
      }
    `;
    document.head.appendChild(st);
  }
  function buildClickToPlay(wrap, embedUrl) {
    ensureMediaPlayStyles();
    const info = embedIdInfo(embedUrl);
    const poster = document.createElement('div');
    poster.className = 'media-poster';
    poster.style.cssText = 'position:absolute;inset:0;z-index:5;cursor:pointer;background:#000 center/cover no-repeat;display:flex;align-items:center;justify-content:center';
    if (info && info.kind === 'youtube') {
      setYouTubePoster(poster, info.id);
    }
    poster.innerHTML = '<button class="media-play-btn" type="button" aria-label="Play video"><span></span></button>';
    let started = false;
    const startPlayback = event => {
      if (event) event.preventDefault();
      if (started) return;
      started = true;
      // 기존에 저장된 embedUrl에 옛 파라미터(autoplay/mute/controls 등)가 섞여 있어도
      // 확실하게 "재생+소리 켜짐" 상태가 되도록 URL을 새로 구성한다.
      const base = embedUrl.split('?')[0];
      const params = new URLSearchParams(embedUrl.split('?')[1] || '');
      params.set('autoplay', '1');
      params.set('mute', '1');
      if (info && info.kind === 'youtube') {
        params.set('controls', '1');
        params.set('muted', '1');
        params.set('cc_load_policy', '0');
        params.set('iv_load_policy', '3');
        params.set('disablekb', '0');
        params.set('fs', '1');
        params.set('enablejsapi', '1');
        params.set('playsinline', '1');
        params.set('origin', location.origin);
      }
      if (info && info.kind === 'vimeo') { params.set('muted', '1'); params.set('background', '0'); }
      const liveUrl = base + '?' + params.toString();
      const ifr = document.createElement('iframe');
      ifr.src = liveUrl;
      ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      ifr.setAttribute('frameborder', '0');
      ifr.setAttribute('allowfullscreen', '');
      ifr.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      wrap.appendChild(ifr);
      if (info && info.kind === 'youtube') {
        const send = (func, args = []) => {
          try {
            ifr.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func,
              args
            }), '*');
          } catch (err) {}
        };
        ifr.addEventListener('load', () => {
          setTimeout(() => {
            send('playVideo');
            send('unloadModule', ['captions']);
            send('unloadModule', ['cc']);
          }, 700);
        }, { once: true });
      }
      poster.remove();
    };
    ['click', 'pointerup', 'touchend'].forEach(evt => {
      poster.addEventListener(evt, startPlayback, { passive: false });
    });
    wrap.appendChild(poster);
  }
  function applyHero(rec) {
    const card = document.querySelector('.hero-card');
    if (!card) return;
    card.querySelectorAll('.hero-user-media').forEach(n => n.remove());
    const ph = card.querySelector('.hero-placeholder');
    if (ph) ph.style.display = 'none';
    if (rec.kind === 'embed') {
      const wrap = document.createElement('div');
      wrap.className = 'hero-user-media';
      wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;z-index:1';
      card.appendChild(wrap);
      buildClickToPlay(wrap, rec.embedUrl);
    } else if (rec.kind === 'video') {
      const url = recUrl(rec);
      if (!url) return;
      const v = document.createElement('video');
      v.className = 'hero-user-media';
      v.src = url;
      v.autoplay = v.muted = v.loop = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;background:#000;z-index:1';
      card.appendChild(v);
      v.play().catch(() => {});
    } else {
      const url = recUrl(rec);
      if (!url) return;
      const d = document.createElement('div');
      d.className = 'hero-user-media';
      d.style.cssText = `position:absolute;inset:0;background:#000 url("${url}") center/contain no-repeat;z-index:1`;
      card.appendChild(d);
    }
    markCustom(card);
  }
  async function applyAllMedia() {
    const els = document.querySelectorAll('[data-media]');
    for (const el of els) {
      const rec = await mediaResolved(el.dataset.mediaKey);
      if (!rec) continue;
      if (el.dataset.media === 'hero') applyHero(rec);
      else if (el.dataset.mediaRich === '1') applyRichMedia(el, rec);
      else {
        const url = recUrl(rec);
        if (url) applyImage(el, url);
      }
      const layout = getLayoutRec(el.dataset.mediaKey || '');
      if (Object.keys(layout).length) applyLayoutRec(el, layout);
    }
  }

  /* ── 5. 파일 선택기 · 영상 링크 ── */
  // 유튜브/비메오 URL → 자동재생·음소거·반복 임베드 URL
  function toEmbedUrl(raw) {
    const u = (raw || '').trim();
    if (!u) return null;
    // YouTube
    let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
    if (m) {
      const id = m[1];
      return 'https://www.youtube.com/embed/' + id +
        '?autoplay=0&mute=0&loop=1&playlist=' + id +
        '&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&cc_load_policy=0&disablekb=0&fs=1&enablejsapi=1';
    }
    // Vimeo
    m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) {
      return 'https://player.vimeo.com/video/' + m[1] +
        '?autoplay=0&muted=0&loop=1&byline=0&title=0&portrait=0';
    }
    return null;
  }

  function openHeroChoice(el) {
    const isHero = el.dataset.media === 'hero';
    const allowVideo = isHero || el.dataset.mediaRich === '1';
    const prev = document.querySelector('.hero-choice');
    if (prev) prev.remove();
    const box = document.createElement('div');
    box.className = 'hero-choice';
    const linkHtml = allowVideo
      ? '<div class="hc-or">또는 영상 링크</div>'
        + '<input class="hc-url" type="text" placeholder="유튜브 / 비메오 링크 붙여넣기" />'
        + '<div class="hc-err"></div>'
        + '<div class="hc-row"><button class="hc-cancel" type="button">취소</button>'
        + '<button class="hc-apply" type="button">링크 적용</button></div>'
      : '<div class="hc-row"><button class="hc-cancel" type="button">취소</button></div>';
    box.innerHTML =
      '<div class="hc-inner">'
      + `<div class="hc-title">${isHero ? '히어로 배경 500' : '미디어'} 설정</div>`
      + `<button class="hc-file" type="button">🖼 파일 업로드 (${allowVideo ? '사진·영상' : '사진'})</button>`
      + '<div class="hc-saved"><div class="hc-saved-title">이미 업로드한 미디어</div><div class="hc-saved-list"><div class="hc-empty">불러오는 중…</div></div></div>'
      + linkHtml
      + '</div>';
    box.querySelector('.hc-title').textContent = (isHero ? '히어로 배경' : (allowVideo ? '사진·영상' : '사진')) + ' 설정';
    document.body.appendChild(box);
    const close = () => box.remove();
    box.addEventListener('click', ev => { if (ev.target === box) close(); });
    box.querySelector('.hc-cancel').addEventListener('click', close);
    box.querySelector('.hc-file').addEventListener('click', () => { close(); pickFile(el); });
    populateSavedMediaChoices(box, el, close);
    const urlInput = box.querySelector('.hc-url');
    if (urlInput) {
      const err = box.querySelector('.hc-err');
      const apply = async () => {
        const embedUrl = toEmbedUrl(urlInput.value);
        if (!embedUrl) { err.textContent = '유튜브 또는 비메오 링크를 인식하지 못했습니다.'; return; }
        const rec = { kind: 'embed', embedUrl, src: urlInput.value.trim() };
        await mediaSet(el.dataset.mediaKey, rec);
        if (isHero) applyHero(rec); else applyRichMedia(el, rec);
        close();
        toast('영상 링크가 적용되었습니다');
        refreshCount();
      };
      box.querySelector('.hc-apply').addEventListener('click', apply);
      urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') apply(); });
    }
  }

  function mediaCompatibleForSlot(el, rec) {
    if (!rec || rec.kind === 'ref') return false;
    if (rec.kind === 'image') return true;
    return el.dataset.media === 'hero' || el.dataset.mediaRich === '1';
  }
  async function populateSavedMediaChoices(box, el, close) {
    const list = box.querySelector('.hc-saved-list');
    const targetKey = el.dataset.mediaKey || '';
    const items = (await mediaAll()).filter(it => it.key !== targetKey && mediaCompatibleForSlot(el, it.rec));
    if (!items.length) {
      list.innerHTML = '<div class="hc-empty">선택할 수 있는 업로드 미디어가 없습니다.</div>';
      return;
    }
    list.innerHTML = '';
    items.forEach(it => {
      const rec = it.rec;
      const isEmbed = rec.kind === 'embed';
      const isVid = rec.kind === 'video';
      const url = isEmbed ? '' : recUrl(rec);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hc-saved-item';
      const thumb = isEmbed
        ? '<span class="hc-saved-thumb hc-saved-link">▶</span>'
        : (isVid ? `<video class="hc-saved-thumb" src="${url}" muted playsinline></video>`
                 : `<span class="hc-saved-thumb" style="background-image:url('${url}')"></span>`);
      btn.innerHTML = thumb
        + `<span class="hc-saved-meta"><span>${humanLabel(it.key)}</span><em>${isEmbed ? '영상 링크' : (isVid ? '영상' : '사진')}</em></span>`;
      btn.addEventListener('click', async () => {
        await applyExistingMedia(el, it.key);
        close();
      });
      list.appendChild(btn);
    });
  }
  async function applyExistingMedia(el, sourceKey) {
    const targetKey = el.dataset.mediaKey || '';
    if (!sourceKey || !targetKey || sourceKey === targetKey) return;
    await mediaSet(targetKey, { kind: 'ref', refKey: sourceKey });
    const rec = await mediaResolved(targetKey);
    if (!rec) return;
    if (el.dataset.media === 'hero') applyHero(rec);
    else if (el.dataset.mediaRich === '1') applyRichMedia(el, rec);
    else {
      const url = recUrl(rec);
      if (url) applyImage(el, url);
    }
    const layout = getLayoutRec(targetKey);
    if (Object.keys(layout).length) applyLayoutRec(el, layout);
    toast('업로드된 미디어를 적용했습니다');
    refreshCount();
  }

  const mobileAutoVideos = new Set();
  let mobileAutoVideoObserver = null;
  let mobileAutoVideoListenersBound = false;
  function tryPlayMobileVideo(video) {
    if (!video || !video.isConnected) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
  }
  function playVisibleMobileVideos() {
    mobileAutoVideos.forEach(video => {
      if (!video.isConnected) {
        mobileAutoVideos.delete(video);
        return;
      }
      const rect = video.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
      if (visible) tryPlayMobileVideo(video);
    });
  }
  function registerMobileAutoVideo(video) {
    mobileAutoVideos.add(video);
    if (!mobileAutoVideoObserver && 'IntersectionObserver' in window) {
      mobileAutoVideoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) tryPlayMobileVideo(entry.target);
        });
      }, { rootMargin: '160px 0px', threshold: 0.05 });
    }
    if (mobileAutoVideoObserver) mobileAutoVideoObserver.observe(video);
    if (!mobileAutoVideoListenersBound) {
      mobileAutoVideoListenersBound = true;
      ['touchstart', 'pointerdown', 'click'].forEach(evt => {
        document.addEventListener(evt, playVisibleMobileVideos, { passive: true });
      });
      window.addEventListener('pageshow', playVisibleMobileVideos);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) playVisibleMobileVideos();
      });
    }
    tryPlayMobileVideo(video);
  }

  // 히어가 아닌 일반 슬롯(예: '작품에 대하여' 위 대표 이미지)에 사진/영상/링크를 적용
  function applyRichMedia(el, rec) {
    el.querySelectorAll(':scope > .rich-media-el').forEach(n => n.remove());
    const img = el.querySelector('img');
    if (img) {
      img.style.display = el.dataset.publicBacked === '1' ? 'none' : 'block';
      img.style.objectFit = 'cover';
    }
    if (rec.kind === 'embed') {
      if (img) img.style.display = 'none';
      const wrap = document.createElement('div');
      wrap.className = 'rich-media-el';
      wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;z-index:1';
      el.insertBefore(wrap, el.firstChild);
      buildClickToPlay(wrap, rec.embedUrl);
    } else if (rec.kind === 'video') {
      const url = recUrl(rec);
      if (!url) return;
      if (img && rec.posterUrl) {
        img.src = rec.posterUrl;
        img.style.display = 'block';
        img.style.objectFit = 'cover';
      }
      const v = document.createElement('video');
      v.className = 'rich-media-el';
      v.src = url;
      if (rec.posterUrl) v.poster = rec.posterUrl;
      v.preload = 'auto';
      v.autoplay = v.muted = v.loop = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;background:#050505;opacity:0;transition:opacity .18s ease';
      const revealVideo = () => {
        v.style.opacity = '1';
        if (img) img.style.display = 'none';
      };
      const showPoster = () => {
        if (img && rec.posterUrl) {
          img.src = rec.posterUrl;
          img.style.display = 'block';
        }
        v.style.opacity = '0';
      };
      v.addEventListener('loadeddata', revealVideo, { once: true });
      v.addEventListener('canplay', revealVideo, { once: true });
      v.addEventListener('error', showPoster);
      v.addEventListener('stalled', showPoster);
      el.insertBefore(v, el.firstChild);
      registerMobileAutoVideo(v);
      if (v.readyState >= 2) revealVideo();
    } else if (img) {
      const url = recUrl(rec);
      if (!url) return;
      img.style.display = 'block';
      img.src = url;
      img.style.objectFit = 'cover';
    }
    markCustom(el);
  }

  function pickFile(el) {
    const allowVideo = el.dataset.media === 'hero' || el.dataset.mediaRich === '1';
    const isHero = el.dataset.media === 'hero';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = allowVideo ? 'image/*,video/*' : 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', async () => {
      const f = input.files && input.files[0];
      input.remove();
      if (!f) return;
      const kind = f.type.startsWith('video') ? 'video' : 'image';
      await mediaSet(el.dataset.mediaKey, { blob: f, kind });
      if (isHero) applyHero({ blob: f, kind });
      else if (el.dataset.mediaRich === '1') applyRichMedia(el, { blob: f, kind });
      else applyImage(el, URL.createObjectURL(f));
      const layout = getLayoutRec(el.dataset.mediaKey || '');
      if (Object.keys(layout).length) applyLayoutRec(el, layout);
      toast(kind === 'video' ? '영상이 교체되었습니다' : '사진이 교체되었습니다');
      refreshCount();
    });
    input.click();
  }

  function openPicker(el) {
    openHeroChoice(el);
  }

  /* ── 5b. 커스텀 표시 · 되돌리기 · 미디어 관리 ── */
  function markCustom(el) {
    if (!isEditorAllowed()) return;
    if (!el) return;
    el.dataset.hasCustom = '1';
    if (el.querySelector(':scope > .media-revert')) return;
    const b = document.createElement('button');
    b.className = 'media-revert';
    b.type = 'button';
    b.textContent = '✕ 되돌리기';
    b.dataset.revertKey = el.dataset.mediaKey || '';
    el.appendChild(b);
  }

  /* 크기 · 위치 조절 핸들 (모든 미디어 슬롯에 부착 — 클릭과 분리된 드래그 전용 핸들) */
  function attachSizeHandle(el) {
    if ((el.dataset.mediaKey || '').startsWith('whover:')) return;
    if (el.dataset.media === 'hero' || el.querySelector(':scope > .size-handle')) return;
    const h = document.createElement('div');
    h.className = 'size-handle';
    h.title = '드래그해서 높이 조절';
    el.appendChild(h);
    let startY = 0, startH = 0;
    const onMove = (e) => {
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dh = y - startY;
      const newH = Math.max(80, startH + dh);
      el.style.height = newH + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      const h2 = el.getBoundingClientRect().height;
      const w2 = el.getBoundingClientRect().width;
      // 고정 px 높이가 아니라 비율(aspect-ratio)로 저장 — 화면 폭이 바뀌어도 비율이 유지되어 반응형이 깨지지 않음
      if (el.dataset.mediaKey && w2 > 0) setLayoutRec(el.dataset.mediaKey, { ar: +(w2 / h2).toFixed(4) });
      toast('사진 크기가 저장되었습니다');
    };
    const onDown = (e) => {
      e.preventDefault(); e.stopPropagation();
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startH = el.getBoundingClientRect().height;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };
    h.addEventListener('mousedown', onDown);
    h.addEventListener('touchstart', onDown, { passive: false });
  }
  function attachPanHandle(el) {
    if ((el.dataset.mediaKey || '').startsWith('whover:')) return;
    if (el.dataset.media === 'hero' || el.querySelector(':scope > .pan-handle')) return;
    const h = document.createElement('div');
    h.className = 'pan-handle';
    h.title = '드래그해서 사진 위치(크롭) 조절';
    h.textContent = '✥';
    el.appendChild(h);
    let startX = 0, startY = 0, curX = 0, curY = 0;
    const onMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = el.getBoundingClientRect();
      const dxPct = ((x - startX) / rect.width) * 100;
      const dyPct = ((y - startY) / rect.height) * 100;
      const nx = Math.min(80, Math.max(-80, curX + dxPct));
      const ny = Math.min(80, Math.max(-80, curY + dyPct));
      applyMediaOffset(el, nx, ny);
      h.dataset.pendingX = String(+nx.toFixed(2));
      h.dataset.pendingY = String(+ny.toFixed(2));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      if (h.dataset.pendingX && h.dataset.pendingY && el.dataset.mediaKey) {
        curX = parseFloat(h.dataset.pendingX);
        curY = parseFloat(h.dataset.pendingY);
        setLayoutRec(el.dataset.mediaKey, { shiftX: curX, shiftY: curY });
        toast('사진 X/Y 위치가 저장되었습니다');
      }
    };
    const onDown = (e) => {
      e.preventDefault(); e.stopPropagation();
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      const rec = getLayoutRec(el.dataset.mediaKey || '');
      curX = parseFloat(rec.shiftX) || 0;
      curY = parseFloat(rec.shiftY) || 0;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };
    h.addEventListener('mousedown', onDown);
    h.addEventListener('touchstart', onDown, { passive: false });
  }
  function attachZoomHandle(el) {
    if ((el.dataset.mediaKey || '').startsWith('whover:')) return;
    if (el.dataset.media === 'hero' || el.querySelector(':scope > .zoom-handle')) return;
    const h = document.createElement('div');
    h.className = 'zoom-handle';
    h.title = '위/아래로 드래그해서 이미지 확대/축소';
    h.textContent = '+';
    el.appendChild(h);
    let startY = 0, startZoom = 1;
    const onMove = (e) => {
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const next = Math.max(1, Math.min(3, startZoom + ((startY - y) / 120)));
      const zoom = +next.toFixed(2);
      applyMediaZoom(el, zoom);
      h.dataset.pending = String(zoom);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      if (h.dataset.pending && el.dataset.mediaKey) {
        setLayoutRec(el.dataset.mediaKey, { zoom: parseFloat(h.dataset.pending) });
        toast('크롭 확대값이 저장되었습니다');
      }
    };
    const onDown = (e) => {
      e.preventDefault(); e.stopPropagation();
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startZoom = parseFloat(getLayoutRec(el.dataset.mediaKey || '').zoom) || 1;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };
    h.addEventListener('mousedown', onDown);
    h.addEventListener('touchstart', onDown, { passive: false });
  }
  function attachMediaHandles() {
    if (!isEditorAllowed()) return;
    document.querySelectorAll('[data-media]').forEach(el => { attachSizeHandle(el); attachPanHandle(el); attachZoomHandle(el); });
  }
  function stripPublicEditChrome() {
    document.querySelectorAll('.media-revert,.size-handle,.pan-handle,.zoom-handle,.svc-edit-actions,.service-count-tools,.connect-edit-controls,.connect-add').forEach(el => el.remove());
    document.querySelectorAll('[data-has-custom]').forEach(el => el.removeAttribute('data-has-custom'));
    document.body.classList.remove('editing');
    document.documentElement.classList.add('public-view');
  }
  async function revertSlot(key) {
    await mediaDelete(key);
    toast('되돌렸습니다');
    setTimeout(() => location.reload(), 300);
  }

  let panel = null;
  function buildManager() {
    panel = document.createElement('div');
    panel.className = 'media-mgr';
    panel.innerHTML =
      '<div class="mm-head"><span>📁 업로드한 사진·영상</span><button class="mm-close" type="button">✕</button></div>'
      + '<div class="mm-note"></div><div class="mm-list"></div>';
    document.body.appendChild(panel);
    panel.querySelector('.mm-close').addEventListener('click', () => panel.classList.remove('open'));
  }
  async function refreshCount() {
    const items = await mediaAll();
    const c = document.querySelector('.mm-count');
    if (c) c.textContent = items.length ? '(' + items.length + ')' : '';
  }
  async function openManager() {
    panel.classList.add('open');
    const list = panel.querySelector('.mm-list');
    const note = panel.querySelector('.mm-note');
    list.innerHTML = '<div class="mm-empty">불러오는 중…</div>';
    const items = await mediaAll();
    if (!items.length) {
      list.innerHTML = '<div class="mm-empty">아직 업로드한 미디어가 없습니다.<br>사진·영상 영역을 클릭해 올려보세요.</div>';
      note.textContent = '';
      return;
    }
    const total = items.reduce((s, it) => s + ((it.rec && it.rec.blob && it.rec.blob.size) || 0), 0);
    const embeds = items.filter(it => it.rec && it.rec.kind === 'embed').length;
    note.textContent = items.length + '개 · 약 ' + (total / 1048576).toFixed(1) + 'MB 저장됨'
      + (embeds ? ' · 링크 ' + embeds + '개' : '');
    list.innerHTML = '';
    items.forEach(it => {
      const isEmbed = it.rec.kind === 'embed';
      const isVid = it.rec.kind === 'video';
      const isRef = it.rec.kind === 'ref';
      const url = (isEmbed || isRef) ? '' : URL.createObjectURL(it.rec.blob);
      const row = document.createElement('div');
      row.className = 'mm-row';
      const thumb = isRef
        ? `<div class="mm-thumb mm-thumb-link">↗</div>`
        : isEmbed
        ? `<div class="mm-thumb mm-thumb-link">▶</div>`
        : (isVid ? `<video class="mm-thumb" src="${url}" muted playsinline></video>`
                 : `<div class="mm-thumb" style="background:url('${url}') center/cover"></div>`);
      const sub = isRef
        ? `기존 미디어 참조 · ${humanLabel(it.rec.refKey || '')}`
        : isEmbed
        ? `영상 링크 · ${(it.rec.src || '').replace(/^https?:\/\//, '').slice(0, 28)}`
        : `${isVid ? '영상' : '사진'} · ${(it.rec.blob.size / 1024).toFixed(0)}KB`;
      row.innerHTML =
        thumb
        + `<div class="mm-meta"><div class="mm-label">${humanLabel(it.key)}</div>`
        + `<div class="mm-sub">${sub}</div></div>`
        + `<button class="mm-del" type="button" data-k="${it.key}">삭제</button>`;
      list.appendChild(row);
    });
    list.querySelectorAll('.mm-del').forEach(b => b.addEventListener('click', async () => {
      await mediaDelete(b.dataset.k);
      toast('삭제했습니다');
      setTimeout(() => location.reload(), 300);
    }));
  }

  /* ── 5c. GitHub 백업 (작품별 사진·텍스트를 사용자 저장소로 커밋) ──
     클라이언트에서 GitHub REST API로 커밋합니다.
     필요한 것: Fine-grained Personal Access Token (Contents: Read/Write),
     저장소(owner/repo), 브랜치. 토큰은 이 브라우저에만 저장됩니다. */
  const GH_CFG = 'arthod-gh:cfg';
  const GH_DEFAULT_CFG = { owner: 'arthod-studio', repo: 'arthod-website-backup', branch: 'main' };
  function ghCfg() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(GH_CFG)) || {}; } catch (e) {}
    return Object.assign({}, GH_DEFAULT_CFG, saved);
  }
  function ghSaveCfg(c) { localStorage.setItem(GH_CFG, JSON.stringify(c)); }
  function b64utf8(str) { return btoa(unescape(encodeURIComponent(str))); }
  function blobToB64(blob) {
    return new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
  }
  const SITE_BACKUP_FILES = [
    'index.html', 'about.html', 'works.html', 'work.html', 'services.html', 'contact.html',
    'style.css', 'main.js', 'support.js', 'CNAME', 'robots.txt', 'sitemap.xml', 'logo.png',
    'assets/about-logo.mp4',
    'assets/video/arthod-art-method-logo-motion.mp4',
    'assets/img/arthod-logo-original-black.png',
    'assets/fonts/Adam-Bold.ttf',
    'assets/fonts/Adam-Light.ttf',
    'assets/fonts/Adam-Medium.ttf'
  ];
  async function fetchFileAsB64(path) {
    const r = await fetch(new URL(path, location.href).href, { cache: 'no-store' });
    if (!r.ok) throw new Error(path + ' → ' + r.status);
    return blobToB64(await r.blob());
  }
  async function ghBackupSiteSnapshot(cfg, onStatus) {
    const status = onStatus || (() => {});
    const saved = [];
    const skipped = [];
    status('웹사이트 전체 파일 스냅샷 저장 중…');
    for (const file of SITE_BACKUP_FILES) {
      try {
        await ghPut(cfg, `backup/site/${file}`, await fetchFileAsB64(file), `backup site: ${file}`);
        saved.push(file);
      } catch (e) {
        skipped.push({ file, error: e.message });
      }
    }
    const manifest = {
      savedAt: new Date().toISOString(),
      page: location.pathname.split('/').pop() || 'index.html',
      files: saved,
      skipped
    };
    await ghPut(cfg, 'backup/site-manifest.json', b64utf8(JSON.stringify(manifest, null, 2)), 'backup: site snapshot manifest');
    return { files: saved.length, skipped };
  }
  function extFor(rec) {
    const t = (rec.blob && rec.blob.type) || '';
    if (t.indexOf('png') >= 0) return 'png';
    if (t.indexOf('webp') >= 0) return 'webp';
    if (t.indexOf('gif') >= 0) return 'gif';
    if (t.indexOf('mp4') >= 0) return 'mp4';
    if (t.indexOf('webm') >= 0) return 'webm';
    if (t.indexOf('quicktime') >= 0 || t.indexOf('mov') >= 0) return 'mov';
    return rec.kind === 'video' ? 'mp4' : 'jpg';
  }
  function safeName(k) { return k.replace(/[^a-z0-9]+/gi, '_'); }
  function workIdOf(key) {
    if (key === 'home:hero') return 'home';
    let m = key.match(/id=(\w+)/); if (m) return m[1];
    m = key.match(/^wd:(\w+):/); if (m) return m[1];
    m = key.match(/^wimg:(\w+)/); if (m) return m[1];
    m = key.match(/^whover:(\w+):/); if (m) return m[1];
    if (key.indexOf('svc:') === 0) return 'services';
    return 'misc';
  }
  async function ghReq(path, opt, token) {
    return fetch('https://api.github.com' + path, Object.assign({
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
    }, opt || {}));
  }
  async function ghGetSha(cfg, path) {
    const r = await ghReq(`/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`, {}, cfg.token);
    if (r.status === 200) { const j = await r.json(); return j.sha; }
    return null;
  }
  async function ghPut(cfg, path, contentB64, msg) {
    const sha = await ghGetSha(cfg, path);
    const body = { message: msg, content: contentB64, branch: cfg.branch };
    if (sha) body.sha = sha;
    const r = await ghReq(`/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, { method: 'PUT', body: JSON.stringify(body) }, cfg.token);
    if (!r.ok) throw new Error('PUT ' + path + ' → ' + r.status + ' ' + (await r.text()).slice(0, 120));
    return r.json();
  }

  // 전체 텍스트 + 미디어를 작품별로 백업
  async function ghBackup(cfg, onStatus) {
    const status = onStatus || (() => {});
    status('백업할 수정 내용을 읽는 중…');
    // 1) 텍스트·스타일·레이아웃 오버라이드 수집
    const text = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k === 'arthod-about-recent-count' || k === 'arthod-workcount:works' || k === 'arthod-works:custom-posts' || k === FOOTER_CONNECT_KEY
        || k === ABOUT_HISTORY_KEY || k === ABOUT_HISTORY_LAYOUT_VERSION_KEY || k === ABOUT_HISTORY_LEGACY_MIGRATION_KEY || k === ABOUT_HISTORY_RECOVERY_KEY
        || k.indexOf('arthod-edit:') === 0 || k.indexOf('arthod-proj:') === 0 || k.indexOf('arthod-style:') === 0
        || k.indexOf('arthod-layout:') === 0 || k.indexOf('arthod-gallerylayout:') === 0 || k.indexOf('arthod-galleryitems:') === 0
        || k.indexOf('arthod-sliderorder:') === 0 || k.indexOf('arthod-cardorder:') === 0) {
        text[k] = localStorage.getItem(k);
      }
    }
    // 2) 미디어 수집 (작품별로 그룹화 + 전체 인덱스)
    const items = await mediaAll();
    status(`미디어 ${items.length}개 확인 완료. 업로드를 시작합니다…`);
    const perWork = {};
    const mediaIndex = {};
    let done = 0;
    for (const it of items) {
      const wid = workIdOf(it.key);
      perWork[wid] = perWork[wid] || { images: [], videos: [], embeds: [], refs: [] };
      if (it.rec.kind === 'embed') {
        perWork[wid].embeds.push({ key: it.key, url: it.rec.src || it.rec.embedUrl });
        mediaIndex[it.key] = { kind: 'embed', embedUrl: it.rec.embedUrl };
      } else if (it.rec.kind === 'ref') {
        perWork[wid].refs.push({ key: it.key, refKey: it.rec.refKey });
        mediaIndex[it.key] = { kind: 'ref', refKey: it.rec.refKey };
      } else {
        const ext = extFor(it.rec);
        const file = `backup/media/${wid}/${safeName(it.key)}.${ext}`;
        status(`이미지 업로드 중… (${++done}/${items.length})`);
        await ghPut(cfg, file, await blobToB64(it.rec.blob), `backup: ${it.key}`);
        (it.rec.kind === 'video' ? perWork[wid].videos : perWork[wid].images).push({ key: it.key, file });
        mediaIndex[it.key] = { kind: it.rec.kind, file };
      }
    }
    // 3) 작품별 매니페스트 + 전체 콘텐츠 JSON
    status('작품별 매니페스트 저장 중…');
    for (const wid of Object.keys(perWork)) {
      const manifest = { work: wid, savedAt: new Date().toISOString(), media: perWork[wid],
        text: Object.fromEntries(Object.entries(text).filter(([k]) => k.indexOf(':' + wid + ':') >= 0 || k.indexOf('id=' + wid) >= 0)) };
      await ghPut(cfg, `backup/works/${wid}.json`, b64utf8(JSON.stringify(manifest, null, 2)), `backup: work ${wid}`);
    }
    status('전체 콘텐츠 저장 중…');
    const all = { savedAt: new Date().toISOString(), text, mediaIndex, works: Object.keys(perWork) };
    await ghPut(cfg, 'backup/content.json', b64utf8(JSON.stringify(all, null, 2)), 'backup: full content');
    const site = await ghBackupSiteSnapshot(cfg, status);
    return { works: Object.keys(perWork).length, media: items.length, siteFiles: site.files, skippedSiteFiles: site.skipped };
  }

  let ghPanel = null, ghBusy = false;
  function buildGhPanel() {
    ghPanel = document.createElement('div');
    ghPanel.className = 'gh-panel';
    const c = ghCfg();
    ghPanel.innerHTML =
      '<div class="mm-head"><span>☁ GitHub 백업</span><button class="gh-close" type="button">✕</button></div>'
      + '<div class="gh-body">'
      + '<label class="gh-l">저장소 <span>owner/repo</span></label>'
      + `<input class="gh-repo" type="text" placeholder="${GH_DEFAULT_CFG.owner}/${GH_DEFAULT_CFG.repo}" value="${((c.owner&&c.repo)?c.owner+'/'+c.repo:'')}"/>`
      + '<label class="gh-l">브랜치</label>'
      + `<input class="gh-branch" type="text" placeholder="main" value="${c.branch||'main'}"/>`
      + '<label class="gh-l">Access Token <span>Contents: Read/Write</span></label>'
      + `<input class="gh-token" type="password" placeholder="github_pat_..." value="${c.token||''}"/>`
      + '<label class="gh-auto"><input class="gh-autochk" type="checkbox" '+(c.auto?'checked':'')+'/> 저장할 때마다 자동 백업</label>'
      + '<div class="gh-status"></div>'
      + '<div class="gh-row"><button class="gh-savecfg" type="button">설정 저장</button>'
      + '<button class="gh-now" type="button">지금 백업</button></div>'
      + '<div class="gh-hint">토큰은 이 브라우저에만 저장됩니다. GitHub → Settings → Developer settings → Fine-grained tokens 에서 해당 저장소의 <b>Contents: Read and write</b> 권한으로 발급하세요.</div>'
      + '</div>';
    document.body.appendChild(ghPanel);
    ghPanel.querySelector('.gh-close').addEventListener('click', () => ghPanel.classList.remove('open'));
    const readForm = () => {
      const rp = (ghPanel.querySelector('.gh-repo').value || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
      const [owner, repo] = rp.split('/');
      return { owner: (owner||'').trim(), repo: (repo||'').trim(),
        branch: (ghPanel.querySelector('.gh-branch').value || 'main').trim(),
        token: (ghPanel.querySelector('.gh-token').value || '').trim(),
        auto: ghPanel.querySelector('.gh-autochk').checked };
    };
    const setStatus = (m, err) => { const s = ghPanel.querySelector('.gh-status'); s.textContent = m; s.className = 'gh-status' + (err ? ' err' : ''); };
    ghPanel.querySelector('.gh-savecfg').addEventListener('click', () => {
      const cfg = readForm();
      if (!cfg.owner || !cfg.repo) return setStatus('저장소를 owner/repo 형식으로 입력하세요.', true);
      ghSaveCfg(cfg); setStatus('설정이 저장되었습니다.');
    });
    const nowBtn = ghPanel.querySelector('.gh-now');
    const setBusy = (busy) => {
      nowBtn.disabled = busy;
      nowBtn.textContent = busy ? '백업 중…' : '지금 백업';
    };
    nowBtn.addEventListener('click', async () => {
      if (ghBusy) return;
      const cfg = readForm();
      if (!cfg.owner || !cfg.repo || !cfg.token) return setStatus('저장소와 토큰을 모두 입력하세요.', true);
      ghSaveCfg(cfg); ghBusy = true; setBusy(true); setStatus('백업 시작… 창을 닫지 말고 기다려주세요.');
      try {
        const r = await ghBackup(cfg, m => setStatus(m));
        const skipped = r.skippedSiteFiles && r.skippedSiteFiles.length ? ` · 누락 ${r.skippedSiteFiles.length}개` : '';
        setStatus(`완료 ✓  ${new Date().toLocaleTimeString()} · 작품 ${r.works}개 · 미디어 ${r.media}개 · 사이트 파일 ${r.siteFiles || 0}개 백업${skipped}`);
        toast('GitHub 백업 완료');
      } catch (e) {
        setStatus('실패: ' + e.message, true);
      } finally { ghBusy = false; setBusy(false); }
    });
  }
  function openGhPanel() { if (!ghPanel) buildGhPanel(); ghPanel.classList.add('open'); }

  /* ── 코드에 반영: 작은 미디어(≤4MB)를 프로젝트 파일로 내려받아 저장하도록 안내 ── */
  let bakePanel;
  function buildBakePanel() {
    bakePanel = document.createElement('div');
    bakePanel.className = 'bake-panel';
    bakePanel.innerHTML =
      '<div class="bake-head"><span>💾 코드에 반영</span><button class="bake-close" type="button">✕</button></div>'
      + '<div class="bake-body">'
      + '지금 올려둔 사진·영상을 실제 사이트 파일로 내려받습니다.<br><br>'
      + '<b>4MB 이하</b> 파일은 자동으로 묶어 하나의 파일로 다운로드되며, 그 파일을 채팅창에 첨부해 주시면 제가 사이트에 영구 반영합니다.<br><br>'
      + '너무 큰 파일은 목록에 따로 표시되니, 원본 파일을 직접 첨부해 주세요.'
      + '<div class="bake-status"></div>'
      + '</div>'
      + '<div class="bake-body" style="padding-top:0"><button class="bake-go" type="button">내보내기 파일 만들기</button></div>';
    document.body.appendChild(bakePanel);
    bakePanel.querySelector('.bake-close').addEventListener('click', () => bakePanel.classList.remove('open'));
    bakePanel.querySelector('.bake-go').addEventListener('click', runBakeExport);
  }
  function openBakePanel() { if (!bakePanel) buildBakePanel(); bakePanel.classList.add('open'); }
  async function runBakeExport() {
    const statusEl = bakePanel.querySelector('.bake-status');
    statusEl.className = 'bake-status';
    statusEl.textContent = '준비 중…';
    try {
      const LIMIT = 4 * 1024 * 1024;
      const items = await mediaAll();
      const text = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k === 'arthod-about-recent-count' || k === 'arthod-workcount:works' || k === 'arthod-works:custom-posts' || k === FOOTER_CONNECT_KEY || k === ABOUT_HISTORY_KEY || k === ABOUT_HISTORY_LAYOUT_VERSION_KEY || k === ABOUT_HISTORY_LEGACY_MIGRATION_KEY || k === ABOUT_HISTORY_RECOVERY_KEY || k.indexOf('arthod-edit:') === 0 || k.indexOf('arthod-proj:') === 0 || k.indexOf('arthod-style:') === 0 || k.indexOf('arthod-layout:') === 0 || k.indexOf('arthod-gallerylayout:') === 0 || k.indexOf('arthod-galleryitems:') === 0 || k.indexOf('arthod-sliderorder:') === 0 || k.indexOf('arthod-cardorder:') === 0) {
          text[k] = localStorage.getItem(k);
        }
      }
      const included = [];
      const skipped = [];
      const manifest = { savedAt: new Date().toISOString(), text, media: [] };
      const zipParts = []; // we build a simple JSON bundle (base64 media) instead of a real zip for simplicity
      for (const it of items) {
        if (it.rec.kind === 'embed') {
          manifest.media.push({ key: it.key, kind: 'embed', embedUrl: it.rec.embedUrl, src: it.rec.src });
          continue;
        }
        if (!it.rec.blob) continue;
        if (it.rec.blob.size > LIMIT) { skipped.push(it.key + ' (' + (it.rec.blob.size / 1048576).toFixed(1) + 'MB)'); continue; }
        const b64 = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(it.rec.blob); });
        manifest.media.push({ key: it.key, kind: it.rec.kind, mime: it.rec.blob.type, b64 });
        included.push(it.key);
      }
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arthod-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      let msg = `✅ 내보내기 완료: ${included.length}개 미디어 포함\n`;
      if (skipped.length) msg += `\n⚠ 용량 초과로 제외됨(직접 첨부 필요):\n- ` + skipped.join('\n- ');
      msg += `\n\n다운로드된 arthod-export.json 파일을 채팅창에 첨부해 주세요.`;
      statusEl.textContent = msg;
    } catch (e) {
      statusEl.className = 'bake-status err';
      statusEl.textContent = '실패: ' + e.message;
    }
  }
  // 저장 시 자동 백업
  async function autoBackupIfEnabled() {
    const cfg = ghCfg();
    if (!cfg.auto || !cfg.owner || !cfg.repo || !cfg.token || ghBusy) return;
    ghBusy = true;
    try { const r = await ghBackup(cfg, () => {}); toast(`GitHub 자동 백업 완료 (미디어 ${r.media}개 · 사이트 ${r.siteFiles || 0}개)`); }
    catch (e) { toast('자동 백업 실패 — 설정 확인'); }
    finally { ghBusy = false; }
  }

  /* ── 5c. 미디어 레이아웃 (크기 · 위치) 오버라이드 ── */
  const LAYOUT_PREFIX = 'arthod-layout:';
  function getLayoutRec(key) { try { return JSON.parse(localStorage.getItem(LAYOUT_PREFIX + key)) || {}; } catch (e) { return {}; } }
  function setLayoutRec(key, patch) {
    const rec = Object.assign(getLayoutRec(key), patch);
    localStorage.setItem(LAYOUT_PREFIX + key, JSON.stringify(rec));
    return rec;
  }
  function applyLayoutRec(el, rec) {
    if (!rec) return;
    if (rec.ar) { el.style.aspectRatio = String(rec.ar); el.style.height = 'auto'; }
    else if (rec.h) el.style.setProperty('--user-h', rec.h + 'px'), el.style.height = rec.h + 'px'; // \uad6c\ubc84\uc804 \ud638\ud658(\uc608\uc804 \uc800\uc7a5\uac12)
    if (rec.pos) applyMediaPosition(el, rec.pos);
    applyMediaTransform(el, rec);
  }
  function mediaVisualTarget(el) {
    return el.querySelector(':scope > video.rich-media-el, :scope > .rich-media-el video, :scope > img, img, .card-bg, .svc-img, .whs-slide, .wn-bg') || el;
  }
  function applyMediaPosition(el, pos) {
    const target = mediaVisualTarget(el);
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO') target.style.objectPosition = pos;
    else target.style.backgroundPosition = pos;
  }
  function applyMediaZoom(el, zoom) {
    const rec = Object.assign(getLayoutRec(el.dataset.mediaKey || ''), { zoom });
    applyMediaTransform(el, rec);
  }
  function applyMediaOffset(el, shiftX, shiftY) {
    const rec = Object.assign(getLayoutRec(el.dataset.mediaKey || ''), { shiftX, shiftY });
    applyMediaTransform(el, rec);
  }
  function applyMediaTransform(el, rec) {
    const z = Math.max(1, Math.min(3, parseFloat(rec.zoom) || 1));
    const x = Math.max(-80, Math.min(80, parseFloat(rec.shiftX) || 0));
    const y = Math.max(-80, Math.min(80, parseFloat(rec.shiftY) || 0));
    const target = mediaVisualTarget(el);
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
      target.style.transformOrigin = 'center center';
      target.style.transform = (z === 1 && x === 0 && y === 0) ? '' : `translate(${x}%, ${y}%) scale(${z})`;
      target.style.willChange = (z === 1 && x === 0 && y === 0) ? '' : 'transform';
    } else {
      target.style.backgroundSize = z === 1 ? 'cover' : `${Math.round(z * 100)}% auto`;
      if (x || y) target.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
    }
  }
  function restoreLayouts() {
    document.querySelectorAll('[data-media]').forEach(el => {
      const key = el.dataset.mediaKey; if (!key) return;
      const rec = getLayoutRec(key);
      if (Object.keys(rec).length) applyLayoutRec(el, rec);
    });
  }

  /* ── 6. 편집 UI ── */
  let editing = false;
  let btn, bar, toastEl;
  const EDITOR_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
  const EDITOR_ALLOWED =
    location.protocol === 'file:' ||
    EDITOR_HOSTS.has(location.hostname) ||
    location.hostname.endsWith('.local');

  function isEditorAllowed() {
    return EDITOR_ALLOWED;
  }

  /* 텍스트 스타일 툴바 — 폰트·크기·굵기·정렬·색상 */
  let textToolbar = null, ttTarget = null;
  const COLOR_OPTIONS = ['', '#c81e14', '#111111', '#6b6b6b', '#ffffff'];
  function buildTextToolbar() {
    textToolbar = document.createElement('div');
    textToolbar.className = 'text-toolbar';
    const fontOpts = FONT_OPTIONS.map(f => `<option value="${f.value}">${f.label}</option>`).join('');
    textToolbar.innerHTML =
      `<select class="tt-font">${fontOpts}</select>`
      + '<button class="tt-size-m" type="button">A-</button>'
      + '<input class="tt-size-input" type="number" min="9" max="200" title="폰트 크기(px)">'
      + '<button class="tt-size-p" type="button">A+</button>'
      + '<button class="tt-bold" type="button"><b>B</b></button>'
      + '<button class="tt-italic" type="button"><i>I</i></button>'
      + '<button class="tt-align" data-a="left" type="button">≡</button>'
      + '<button class="tt-align" data-a="center" type="button">≣</button>'
      + '<button class="tt-align" data-a="right" type="button">≤</button>'
      + COLOR_OPTIONS.map(c => `<button class="tt-color" type="button" data-c="${c}" style="background:${c || 'conic-gradient(from 0deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)'}"></button>`).join('');
    document.body.appendChild(textToolbar);
    textToolbar.querySelector('.tt-font').addEventListener('change', (e) => { if (ttTarget) setStyleRec(ttTarget, { font: e.target.value || null }); });
    textToolbar.querySelector('.tt-size-m').addEventListener('click', () => bumpSize(-2));
    textToolbar.querySelector('.tt-size-p').addEventListener('click', () => bumpSize(2));
    const sizeInput = textToolbar.querySelector('.tt-size-input');
    const commitSize = () => {
      if (!ttTarget) return;
      const n = parseInt(sizeInput.value, 10);
      if (!isNaN(n) && n > 0) setStyleRec(ttTarget, { size: Math.max(9, Math.min(200, n)) });
    };
    sizeInput.addEventListener('change', commitSize);
    sizeInput.addEventListener('keydown', e => { if (e.key === 'Enter') { commitSize(); e.preventDefault(); } });
    sizeInput.addEventListener('mousedown', e => e.stopPropagation());
    sizeInput.addEventListener('click', e => e.stopPropagation());
    textToolbar.querySelector('.tt-bold').addEventListener('click', () => {
      if (!ttTarget) return;
      // 드래그로 일부 텍스트만 선택했다면 그 부분만 볼드 처리
      if (hasRealSelectionIn(ttTarget)) {
        document.execCommand('bold');
        saveTextEl(ttTarget);
        return;
      }
      const cur = getStyleRec(ttTarget).weight;
      setStyleRec(ttTarget, { weight: cur === '700' ? null : '700' });
      textToolbar.querySelector('.tt-bold').classList.toggle('on', !cur);
    });
    textToolbar.querySelector('.tt-italic').addEventListener('click', () => {
      if (!ttTarget) return;
      if (hasRealSelectionIn(ttTarget)) {
        document.execCommand('italic');
        saveTextEl(ttTarget);
        return;
      }
      const cur = getStyleRec(ttTarget).italic;
      setStyleRec(ttTarget, { italic: !cur });
      textToolbar.querySelector('.tt-italic').classList.toggle('on', !cur);
    });
    textToolbar.querySelectorAll('.tt-align').forEach(b => b.addEventListener('click', () => {
      if (!ttTarget) return;
      setStyleRec(ttTarget, { align: b.dataset.a });
      textToolbar.querySelectorAll('.tt-align').forEach(x => x.classList.toggle('on', x === b));
    }));
    textToolbar.querySelectorAll('.tt-color').forEach(b => b.addEventListener('click', () => {
      if (!ttTarget) return;
      setStyleRec(ttTarget, { color: b.dataset.c || null });
      textToolbar.querySelectorAll('.tt-color').forEach(x => x.classList.toggle('on', x === b));
    }));
    textToolbar.addEventListener('mousedown', e => e.preventDefault()); // 포커스 유지
  }
  function bumpSize(delta) {
    if (!ttTarget) return;
    const cs = getComputedStyle(ttTarget);
    const cur = getStyleRec(ttTarget).size || parseFloat(cs.fontSize);
    const next = Math.max(9, Math.round(cur + delta));
    setStyleRec(ttTarget, { size: next });
    const sizeInput = textToolbar.querySelector('.tt-size-input');
    if (sizeInput) sizeInput.value = next;
  }
  // 실제로 텍스트 일부가 드래그 선택돼 있는지 확인 (커서만 있는 경우는 제외)
  function hasRealSelectionIn(el) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    return el.contains(range.commonAncestorContainer);
  }
  function saveTextEl(el) {
    if (el.dataset.historyManaged === '1') {
      saveAboutHistory(readAboutHistoryFromDom());
      return;
    }
    if (el.dataset.editKey) localStorage.setItem(TXT_PREFIX + el.dataset.editKey, el.innerHTML);
  }
  function showTextToolbar(el) {
    ttTarget = el;
    if (!textToolbar) buildTextToolbar();
    const rec = getStyleRec(el);
    textToolbar.querySelector('.tt-font').value = rec.font || '';
    textToolbar.querySelector('.tt-size-input').value = Math.round(rec.size || parseFloat(getComputedStyle(el).fontSize));
    textToolbar.querySelector('.tt-bold').classList.toggle('on', rec.weight === '700');
    textToolbar.querySelector('.tt-italic').classList.toggle('on', !!rec.italic);
    textToolbar.querySelectorAll('.tt-align').forEach(x => x.classList.toggle('on', x.dataset.a === rec.align));
    textToolbar.querySelectorAll('.tt-color').forEach(x => x.classList.toggle('on', (x.dataset.c || null) === (rec.color || null)));
    const r = el.getBoundingClientRect();
    textToolbar.style.display = 'flex';
    const top = r.top + window.scrollY - textToolbar.offsetHeight - 10;
    textToolbar.style.top = Math.max(8, top) + 'px';
    textToolbar.style.left = Math.min(window.innerWidth - textToolbar.offsetWidth - 12, Math.max(12, r.left + window.scrollX)) + 'px';
  }
  function hideTextToolbar() { if (textToolbar) textToolbar.style.display = 'none'; ttTarget = null; }
  function onEditFocusIn(e) {
    const el = e.target;
    if (el && el.getAttribute && el.getAttribute('contenteditable') === 'true') showTextToolbar(el);
  }
  function onEditFocusOut(e) {
    setTimeout(() => {
      if (textToolbar && textToolbar.contains(document.activeElement)) return;
      const ae = document.activeElement;
      if (ae && ae.getAttribute && ae.getAttribute('contenteditable') === 'true') return;
      hideTextToolbar();
    }, 120);
  }
  function onEditInput(e) {
    const el = e.target && e.target.closest && e.target.closest('[contenteditable="true"]');
    if (!el) return;
    if (el.dataset.shared) {
      localStorage.setItem(SHARED_PREFIX + el.dataset.shared, el.textContent.trim());
      applyMirrors();
      return;
    }
    saveTextEl(el);
  }

  function buildUI() {
    if (!isEditorAllowed()) {
      stripPublicEditChrome();
      document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.contentEditable = 'false';
        el.removeAttribute('spellcheck');
      });
      if (!document.getElementById('public-edit-chrome-guard')) {
        const guard = document.createElement('style');
        guard.id = 'public-edit-chrome-guard';
        guard.textContent = `
          .public-view .media-revert,
          .public-view .size-handle,
          .public-view .pan-handle,
          .public-view .zoom-handle,
          .public-view .svc-edit-actions,
          .public-view .service-count-tools,
          .public-view .connect-edit-controls,
          .public-view .connect-add{display:none!important}
        `;
        document.head.appendChild(guard);
      }
      return;
    }
    btn = document.createElement('button');
    btn.className = 'edit-btn';
    btn.innerHTML = '<span class="edit-dot"></span><span class="edit-label">편집 모드</span>';
    document.body.appendChild(btn);

    bar = document.createElement('div');
    bar.className = 'edit-bar';
    bar.innerHTML =
      '<span style="display:flex;align-items:center;gap:7px"><span style="font-size:14px">✏️</span>'
      + '텍스트·사진·영상을 클릭해 수정하세요</span>'
      + '<button class="edit-mgr" type="button">📁 내 미디어 <span class="mm-count"></span></button>'
      + '<button class="edit-gh" type="button">☁ 백업</button>'
      + '<button class="edit-bake" type="button">💾 코드에 반영</button>'
      + '<button class="edit-reset" type="button">초기화</button>'
      + '<button class="edit-save" type="button">저장 완료</button>';
    document.body.appendChild(bar);
    installFooterConnectToolbar();
    installAboutHistoryToolbar();

    const style = document.createElement('style');
    style.textContent = `
      body.editing [data-media]{outline:2px dashed rgba(0,110,230,.55);outline-offset:-2px;cursor:pointer!important;position:relative}
      .size-handle{display:none}
      .pan-handle{display:none}
      .zoom-handle{display:none}
      body.editing [data-media] > .size-handle{
        display:flex;position:absolute;left:50%;bottom:6px;transform:translateX(-50%);z-index:63;
        width:34px;height:14px;border-radius:7px;background:rgba(0,90,220,.92);cursor:ns-resize;
        align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.25);
      }
      body.editing [data-media] > .size-handle::after{content:'⋮⋮';color:#fff;font-size:9px;letter-spacing:-1px;transform:rotate(90deg)}
      body.editing [data-media] > .pan-handle{
        display:flex;position:absolute;top:14px;left:14px;z-index:63;width:30px;height:30px;border-radius:50%;
        background:rgba(0,90,220,.92);color:#fff;align-items:center;justify-content:center;font-size:13px;
        cursor:move;box-shadow:0 3px 10px rgba(0,0,0,.25);
      }
      body.editing [data-media] > .zoom-handle{
        display:flex;position:absolute;top:54px;left:14px;z-index:63;width:30px;height:30px;border-radius:50%;
        background:rgba(17,17,17,.86);color:#fff;align-items:center;justify-content:center;font-size:14px;font-weight:800;
        cursor:ns-resize;box-shadow:0 3px 10px rgba(0,0,0,.25);
      }
      body.editing [data-media="hero"] > .size-handle,body.editing [data-media="hero"] > .pan-handle,body.editing [data-media="hero"] > .zoom-handle{display:none}
      .text-toolbar{
        position:absolute;display:none;align-items:center;gap:4px;z-index:1100;
        background:#1b1a18;border-radius:9px;padding:6px 7px;box-shadow:0 10px 28px rgba(0,0,0,.35);
      }
      .text-toolbar select.tt-font{
        font-size:11px;background:#2a2926;color:#fff;border:1px solid #3c3b38;border-radius:5px;padding:5px 6px;
        font-family:inherit;max-width:96px;
      }
      .text-toolbar input.tt-size-input{
        width:40px;font-size:12px;text-align:center;background:#2a2926;color:#fff;border:1px solid #3c3b38;
        border-radius:5px;padding:5px 2px;font-family:inherit;-moz-appearance:textfield;
      }
      .text-toolbar input.tt-size-input::-webkit-outer-spin-button,
      .text-toolbar input.tt-size-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
      .text-toolbar button{
        font-size:12px;font-weight:700;color:#fff;background:#2a2926;border:1px solid #3c3b38;border-radius:5px;
        padding:5px 8px;cursor:pointer;line-height:1;
      }
      .text-toolbar button:hover{background:#3a3936}
      .text-toolbar button.on{background:#c81e14;border-color:#c81e14}
      .text-toolbar button.tt-color{width:20px;height:20px;padding:0;border-radius:50%;border:1px solid #4a4945}
      .text-toolbar button.tt-color.on{outline:2px solid #fff;outline-offset:1px}
      body.editing [data-media]:hover{outline-color:rgba(0,110,230,.95);outline-style:solid}
      body.editing [data-media]::after{
        content:'교체 ↑';position:absolute;top:14px;right:14px;z-index:60;
        font:600 11px/1 var(--font-mono,ui-monospace,monospace);letter-spacing:.04em;color:#fff;
        background:rgba(0,90,220,.92);padding:7px 11px;border-radius:5px;pointer-events:none;
        box-shadow:0 4px 14px rgba(0,0,0,.25);
      }
      body.editing [data-media="hero"]::after{content:'사진·영상 교체 ↑'}
      body.editing [data-media][data-has-custom]::after{content:'교체 ↑'}
      body.editing [data-media="hero"][data-has-custom]::after{content:'사진·영상 교체 ↑'}
      body.editing [contenteditable="true"]:empty::before{content:'텍스트 입력';color:var(--ink-4,#aaa)}
      body.editing .ab-tl-year[contenteditable="true"]:empty::before{content:''}
      .media-revert{position:absolute;right:14px;bottom:14px;z-index:62;display:none;align-items:center;gap:6px;
        font:600 11px/1 var(--font-mono,ui-monospace,monospace);color:#fff;background:rgba(200,30,20,.92);
        padding:7px 11px;border-radius:5px;cursor:pointer;border:none;box-shadow:0 4px 14px rgba(0,0,0,.25)}
      body.editing [data-media][data-has-custom] > .media-revert{display:inline-flex}
      .edit-mgr{font-size:12px;font-weight:500;color:var(--ink-2,#333);background:none;border:1px solid var(--border,#e8e6e2);
        padding:6px 12px;border-radius:4px;cursor:pointer;transition:border-color .2s}
      .edit-mgr:hover{border-color:var(--ink,#111)}
      .mm-count{color:var(--ink-3,#888);font-weight:600}
      .media-mgr{position:fixed;right:24px;bottom:88px;z-index:1001;width:340px;max-height:62vh;
        background:#fff;border:1px solid var(--border,#e8e6e2);border-radius:12px;
        box-shadow:0 14px 44px rgba(0,0,0,.24);display:none;flex-direction:column;overflow:hidden}
      .media-mgr.open{display:flex}
      .mm-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;
        border-bottom:1px solid var(--border,#eee);font-size:13px;font-weight:700;color:var(--ink,#111)}
      .mm-close{cursor:pointer;border:none;background:none;font-size:14px;color:var(--ink-3,#888);line-height:1}
      .mm-note{padding:9px 16px;font-size:11px;color:var(--ink-3,#888);border-bottom:1px solid var(--border,#f0f0f0)}
      .mm-list{overflow-y:auto;padding:8px}
      .mm-empty{padding:28px 16px;text-align:center;font-size:13px;color:var(--ink-3,#999);line-height:1.7}
      .mm-row{display:flex;align-items:center;gap:12px;padding:8px;border-radius:8px}
      .mm-row:hover{background:var(--bg-warm,#f7f6f3)}
      .mm-thumb{width:54px;height:40px;border-radius:6px;flex-shrink:0;object-fit:cover;background:#ddd}
      .mm-meta{flex:1;min-width:0}
      .mm-label{font-size:13px;font-weight:600;color:var(--ink,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .mm-sub{font-size:11px;color:var(--ink-4,#aaa);margin-top:2px}
      .mm-del{flex-shrink:0;font-size:11px;font-weight:600;color:#c81e14;background:none;
        border:1px solid rgba(200,30,20,.3);padding:6px 12px;border-radius:5px;cursor:pointer}
      .mm-del:hover{background:rgba(200,30,20,.08)}
      .mm-thumb-link{display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;
        background:linear-gradient(135deg,#c81e14,#7a1410)}
      .media-poster:hover .media-play-btn{background:rgba(0,0,0,.85);transform:scale(1.08)}
      .media-play-btn{
        width:76px;height:76px;border-radius:50%;background:rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.85);
        color:#fff;font-size:26px;display:flex;align-items:center;justify-content:center;padding-left:5px;
        transition:background .2s,transform .2s;
      }
      .edit-gh{font-size:12px;font-weight:500;color:var(--ink-2,#333);background:none;border:1px solid var(--border,#e8e6e2);
        padding:6px 12px;border-radius:4px;cursor:pointer;transition:border-color .2s}
      .edit-gh:hover{border-color:var(--ink,#111)}
      .edit-bake{font-size:12px;font-weight:500;color:var(--ink-2,#333);background:none;border:1px solid var(--border,#e8e6e2);
        padding:6px 12px;border-radius:4px;cursor:pointer;transition:border-color .2s}
      .edit-bake:hover{border-color:var(--ink,#111)}
      .bake-panel{position:fixed;right:24px;bottom:88px;z-index:1003;width:340px;max-height:70vh;
        background:#fff;border:1px solid var(--border,#e8e6e2);border-radius:12px;
        box-shadow:0 14px 44px rgba(0,0,0,.24);display:none;flex-direction:column;overflow:hidden}
      .bake-panel.open{display:flex}
      .bake-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border,#eee);font-size:13px;font-weight:700}
      .bake-close{cursor:pointer;border:none;background:none;font-size:14px;color:var(--ink-3,#888)}
      .bake-body{padding:14px 16px;font-size:12px;color:var(--ink-3,#666);line-height:1.7;overflow-y:auto}
      .bake-status{margin-top:10px;font-size:12px;color:var(--ink-2,#333);white-space:pre-wrap;word-break:break-word}
      .bake-status.err{color:#c81e14}
      .bake-go{width:100%;margin-top:12px;padding:11px;font-size:13px;font-weight:700;color:#fff;background:var(--ink,#111);border:none;border-radius:8px;cursor:pointer}
      .bake-go:hover{opacity:.85}
      .gh-panel{position:fixed;right:24px;bottom:88px;z-index:1002;width:340px;
        background:#fff;border:1px solid var(--border,#e8e6e2);border-radius:12px;
        box-shadow:0 14px 44px rgba(0,0,0,.24);display:none;flex-direction:column;overflow:hidden}
      .gh-panel.open{display:flex}
      .gh-close{cursor:pointer;border:none;background:none;font-size:14px;color:var(--ink-3,#888);line-height:1}
      .gh-body{padding:14px 16px;display:flex;flex-direction:column;gap:7px}
      .gh-l{font-size:11px;font-weight:600;color:var(--ink-2,#333);margin-top:6px}
      .gh-l span{font-weight:400;color:var(--ink-4,#aaa)}
      .gh-panel input[type=text],.gh-panel input[type=password]{width:100%;padding:9px 11px;font-size:12px;
        color:var(--ink,#111);border:1px solid var(--border,#e0ded9);border-radius:7px;outline:none;box-sizing:border-box;font-family:inherit}
      .gh-panel input:focus{border-color:var(--ink,#111)}
      .gh-auto{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--ink-2,#333);margin-top:8px;cursor:pointer}
      .gh-status{min-height:16px;font-size:11px;color:var(--ink-3,#666);margin-top:4px;word-break:break-word}
      .gh-status.err{color:#c81e14}
      .gh-row{display:flex;gap:8px;margin-top:8px}
      .gh-savecfg,.gh-now{flex:1;padding:10px;font-size:12px;font-weight:600;border-radius:7px;cursor:pointer}
      .gh-savecfg{background:none;border:1px solid var(--border,#e0ded9);color:var(--ink-2,#333)}
      .gh-savecfg:hover{border-color:var(--ink,#111)}
      .gh-now{background:var(--ink,#111);border:none;color:#fff}
      .gh-now:hover{opacity:.85}
      .gh-now:disabled{opacity:.55;cursor:wait}
      .gh-hint{font-size:10px;line-height:1.6;color:var(--ink-4,#aaa);margin-top:10px}
      .hero-choice{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;
        background:rgba(15,14,12,.5);backdrop-filter:blur(3px)}
      .hero-choice .hc-inner{width:min(90vw,420px);background:#fff;border-radius:14px;padding:26px;
        box-shadow:0 24px 70px rgba(0,0,0,.35);font-family:inherit}
      .hc-title{font-size:16px;font-weight:700;color:var(--ink,#111);margin-bottom:18px}
      .hc-file{width:100%;padding:14px;font-size:13px;font-weight:600;color:#fff;background:var(--ink,#111);
        border:none;border-radius:8px;cursor:pointer;transition:opacity .2s}
      .hc-file:hover{opacity:.85}
      .hc-saved{margin-top:16px;border:1px solid var(--border,#e0ded9);border-radius:10px;overflow:hidden}
      .hc-saved-title{padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink-3,#777);
        background:var(--bg-warm,#f7f6f3);letter-spacing:.05em;text-transform:uppercase}
      .hc-saved-list{max-height:220px;overflow:auto;background:#fff}
      .hc-saved-item{width:100%;display:flex;align-items:center;gap:10px;padding:9px 11px;border:none;
        border-top:1px solid var(--border,#e0ded9);cursor:pointer;text-align:left;background:#fff}
      .hc-saved-item:hover{background:var(--bg-warm,#f7f6f3)}
      .hc-saved-thumb{width:52px;height:38px;flex-shrink:0;border-radius:5px;background:#ddd center/cover no-repeat;
        object-fit:cover;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff}
      .hc-saved-link{background:var(--ink,#111)}
      .hc-saved-meta{display:flex;flex-direction:column;gap:2px;min-width:0}
      .hc-saved-meta span{font-size:12px;font-weight:600;color:var(--ink,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .hc-saved-meta em{font-style:normal;font-size:11px;color:var(--ink-3,#777)}
      .hc-empty{padding:14px 12px;font-size:12px;color:var(--ink-3,#777);text-align:center}
      .hc-or{text-align:center;font-size:11px;color:var(--ink-4,#aaa);margin:16px 0 10px;
        letter-spacing:.06em;text-transform:uppercase}
      .hc-url{width:100%;padding:12px 14px;font-size:13px;color:var(--ink,#111);border:1px solid var(--border,#e0ded9);
        border-radius:8px;outline:none;box-sizing:border-box;font-family:inherit}
      .hc-url:focus{border-color:var(--ink,#111)}
      .hc-err{min-height:16px;font-size:11px;color:#c81e14;margin:6px 2px 0}
      .hc-row{display:flex;gap:8px;margin-top:14px}
      .hc-cancel,.hc-apply{flex:1;padding:11px;font-size:13px;font-weight:600;border-radius:8px;cursor:pointer}
      .hc-cancel{background:none;border:1px solid var(--border,#e0ded9);color:var(--ink-2,#333)}
      .hc-cancel:hover{border-color:var(--ink,#111)}
      .hc-apply{background:var(--accent,#c81e14);border:none;color:#fff}
      .hc-apply:hover{opacity:.88}
      #ed-toast{
        position:fixed;left:50%;bottom:84px;transform:translateX(-50%) translateY(10px);
        z-index:1000;background:var(--ink,#111);color:#fff;font-size:13px;font-weight:500;
        padding:11px 22px;border-radius:40px;box-shadow:0 6px 24px rgba(0,0,0,.22);
        opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;letter-spacing:.02em;
      }
      #ed-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
      .connect-edit-controls{display:none}
      body.editing .connect-edit-item{display:grid;grid-template-columns:minmax(86px,auto) minmax(130px,220px);align-items:center;gap:10px;margin-bottom:7px}
      body.editing .connect-edit-controls{display:flex;align-items:center;gap:5px}
      body.editing .connect-edit-controls input{width:100%;min-width:0;padding:5px 7px;border:1px solid rgba(255,255,255,.28);border-radius:3px;background:rgba(255,255,255,.08);color:inherit;font:11px/1.2 inherit;outline:none}
      body.editing .connect-edit-controls button{width:24px;height:24px;flex:0 0 24px;border:1px solid rgba(255,255,255,.28);border-radius:3px;background:transparent;color:inherit;cursor:pointer}
      .connect-add{font-size:12px;font-weight:600;color:var(--ink-2,#333);background:none;border:1px solid var(--border,#e8e6e2);padding:6px 10px;border-radius:4px;cursor:pointer}
      .history-add-group{font-size:12px;font-weight:600;color:var(--ink-2,#333);background:none;border:1px solid var(--border,#e8e6e2);padding:6px 10px;border-radius:4px;cursor:pointer}
      .history-add-item,.history-del,.history-move,.history-group-controls{display:none}
      body.editing .history-add-item{display:inline-flex;margin-top:22px;padding:7px 12px;border:1px solid var(--border,#e8e6e2);border-radius:4px;background:#fff;color:var(--ink,#111);font:600 12px/1 var(--font-mono,ui-monospace,monospace);cursor:pointer}
      body.editing .ab-tl-group{position:relative}
      body.editing .history-group-controls{display:flex;position:absolute;left:0;top:calc(clamp(32px,5vw,64px) + 68px);gap:4px}
      body.editing .history-group-controls button,
      body.editing .history-move button{width:27px;height:27px;border:1px solid var(--border,#e8e6e2);border-radius:4px;background:#fff;color:var(--ink,#111);font:700 13px/1 var(--font-mono,ui-monospace,monospace);cursor:pointer}
      body.editing .history-group-controls button:disabled,
      body.editing .history-move button:disabled{opacity:.25;cursor:not-allowed}
      body.editing .ab-tl-item{position:relative;padding-right:116px}
      body.editing .history-move{display:flex;position:absolute;right:47px;top:0;gap:4px}
      body.editing .history-del{display:inline-flex;position:absolute;right:0;top:0;padding:7px 9px;border:1px solid rgba(200,30,20,.28);border-radius:4px;background:#fff;color:#c81e14;font:600 11px/1 var(--font-mono,ui-monospace,monospace);cursor:pointer}
      body.editing .ab-tl-item + .ab-tl-item .history-move,
      body.editing .ab-tl-item + .ab-tl-item .history-del{top:24px}
      body.editing .ab-tl-name,
      body.editing .ab-tl-desc{min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:keep-all}
      @media(max-width:760px){
        body.editing .ab-tl-item{padding-right:0;padding-bottom:58px}
        body.editing .history-move{right:47px;top:auto;bottom:16px}
        body.editing .history-del{right:0;top:auto;bottom:16px}
        body.editing .ab-tl-item + .ab-tl-item .history-move,
        body.editing .ab-tl-item + .ab-tl-item .history-del{top:auto}
      }
      @media(max-width:420px){
        body.editing .history-group-controls{position:static;margin:-12px 0 18px}
      }
    `;
    document.head.appendChild(style);

    btn.addEventListener('click', () => setEdit(!editing));
    bar.querySelector('.edit-save').addEventListener('click', () => setEdit(false));
    bar.querySelector('.edit-reset').addEventListener('click', async () => {
      if (!confirm('모든 수정 내용(텍스트·사진·영상)을 초기화할까요?')) return;
      keyed.forEach(el => localStorage.removeItem(TXT_PREFIX + el.dataset.editKey));
      localStorage.removeItem(ABOUT_HISTORY_KEY);
      localStorage.removeItem(ABOUT_HISTORY_LEGACY_MIGRATION_KEY);
      localStorage.removeItem(ABOUT_HISTORY_RECOVERY_KEY);
      await mediaClear();
      location.reload();
    });
    bar.querySelector('.edit-mgr').addEventListener('click', openManager);
    bar.querySelector('.edit-gh').addEventListener('click', openGhPanel);
    bar.querySelector('.edit-bake').addEventListener('click', openBakePanel);
    buildManager();
  }

  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.id = 'ed-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 1700);
  }

  function setEdit(on) {
    editing = on;
    btn.classList.toggle('on', on);
    bar.classList.toggle('on', on);
    document.body.classList.toggle('editing', on);
    btn.querySelector('.edit-label').textContent = on ? '편집 종료' : '편집 모드';
    keyed.forEach(el => {
      el.contentEditable = on ? 'true' : 'false';
      if (on) el.spellcheck = false;
    });
    sharedEls.forEach(el => {
      el.contentEditable = on ? 'true' : 'false';
      if (on) el.spellcheck = false;
    });
    setAboutHistoryEditable(on);
    if (on) {
      document.addEventListener('click', onEditClick, true);
      document.addEventListener('keydown', onEditKeydown, true);
      document.addEventListener('input', onEditInput, true);
      document.addEventListener('focusin', onEditFocusIn);
      document.addEventListener('focusout', onEditFocusOut);
      attachMediaHandles();
    } else {
      document.removeEventListener('click', onEditClick, true);
      document.removeEventListener('keydown', onEditKeydown, true);
      document.removeEventListener('input', onEditInput, true);
      document.removeEventListener('focusin', onEditFocusIn);
      document.removeEventListener('focusout', onEditFocusOut);
      hideTextToolbar();
      if (isAboutPage()) saveAboutHistory(readAboutHistoryFromDom());
      saveText();
      saveShared();
      applyMirrors();
      toast('저장되었습니다');
      autoBackupIfEnabled();
    }
  }

  function onEditClick(e) {
    if (e.target.closest('.svc-edit-actions, .service-count-tools, .works-count-tools, .works-add-post, .card-reorder, .history-group-controls, .history-move, .history-del, .history-add-item, .history-add-group, .connect-edit-controls, .connect-add')) {
      return;
    }
    const ce = e.target.closest('[contenteditable="true"]');
    if (ce) {
      const a = e.target.closest('a');
      if (a) e.preventDefault();
      e.stopPropagation();
      return;
    }    const rev = e.target.closest('.media-revert');
    if (rev) {
      e.preventDefault();
      e.stopPropagation();
      revertSlot(rev.dataset.revertKey);
      return;
    }
    if (e.target.closest('.size-handle, .pan-handle, .zoom-handle')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const nextMedia = e.target.closest('.work-next[data-media]');
    if (nextMedia) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      openPicker(nextMedia);
      return;
    }
    const media = e.target.closest('[data-media]');
    if (media) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      openPicker(media);
      return;
    }
    // 편집 중 카드/다음작품 링크 영역 클릭 → 페이지 이동 차단
    if (e.target.closest('.port-card, .work-next')) {
      e.preventDefault();
    }
  }

  // 편집 중 링크·버튼 활성화 키(Enter/Space)로 인한 예기치 이동·창 열림 방지
  function onEditKeydown(e) {
    if (!editing) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const ae = document.activeElement;
    if (!ae) return;
    // 편집 중인 텍스트 입력은 그대로 둘 (줄바꿈·공백 입력 가능)
    if (ae.getAttribute && ae.getAttribute('contenteditable') === 'true') return;
    // 링크·메뉴버튼에 포칊스가 있으면 활성화 차단
    if (ae.closest && ae.closest('a[href], .nav-toggle')) {
      e.preventDefault();
    }
  }

  // 줄바꿈: contenteditable 안에서 Enter → <br>
  document.addEventListener('keydown', e => {
    if (editing && e.key === 'Enter' && document.activeElement &&
        document.activeElement.getAttribute('contenteditable') === 'true') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  });

  // 백스페이스 뒤로가기 방지: 편집 가능한 요소 밖에서의 Backspace는 무시
  function isEditableTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return !el.disabled && !el.readOnly;
    return el.isContentEditable;
  }
  document.addEventListener('keydown', e => {
    if ((e.key === 'Backspace' || e.key === 'Delete') && !isEditableTarget(e.target)) {
      e.preventDefault();
    }
  }, true);

  /* ── 퍼블릭 저장소 자동 동기화 ──────────────────────────────
     사이트가 열릴 때마다 GitHub 퍼블릭 백업 저장소의 최신 콘텐츠를 가져와,
     새 게시본이면 로컬의 오래된 값까지 갱신한다 → "저장하면 모두에게 반영"을 구현.
     같은 게시본 안에서 사용자가 편집 중인 로컬 값은 덮어쓰지 않는다. */
  const PUBLIC_SOURCE = { owner: 'arthod-studio', repo: 'arthod-website-backup', branch: 'main' };
  const PUBLIC_SYNC_VERSION = 'public-sync-25-detail-mobile-video-fallback';
  const PUBLIC_SYNC_KEY = 'arthod-public-sync:savedAt';
  const PUBLIC_SYNC_VERSION_KEY = 'arthod-public-sync:version';
  async function syncFromPublicSource() {
    if (!PUBLIC_SOURCE.owner || !PUBLIC_SOURCE.repo) return false;
    let changed = false;
    try {
      const base = `https://raw.githubusercontent.com/${PUBLIC_SOURCE.owner}/${PUBLIC_SOURCE.repo}/${PUBLIC_SOURCE.branch}/`;
      const cacheBust = '?v=' + encodeURIComponent(PUBLIC_SYNC_VERSION);
      const r = await fetch(base + 'backup/content.json' + cacheBust, { cache: 'reload' });
      if (!r.ok) return false;
      const data = await r.json();
      publicMediaBase = base;
      publicMediaVersion = (data.savedAt || PUBLIC_SYNC_VERSION);
      if (data.mediaIndex) {
        publicMediaIndex = data.mediaIndex;
        changed = true;
      }
      const lastSyncedAt = localStorage.getItem(PUBLIC_SYNC_KEY);
      const hasNewPublicVersion =
        localStorage.getItem(PUBLIC_SYNC_VERSION_KEY) !== PUBLIC_SYNC_VERSION ||
        (!!data.savedAt && data.savedAt !== lastSyncedAt);
      if (data.text) {
        Object.entries(data.text).forEach(([k, v]) => {
          if (k === ABOUT_HISTORY_KEY && localStorage.getItem(ABOUT_HISTORY_KEY) !== null) return;
          if (hasNewPublicVersion || localStorage.getItem(k) === null) {
            localStorage.setItem(k, v);
            changed = true;
          }
        });
      }
      if (data.savedAt) localStorage.setItem(PUBLIC_SYNC_KEY, data.savedAt);
      localStorage.setItem(PUBLIC_SYNC_VERSION_KEY, PUBLIC_SYNC_VERSION);
      if (data.mediaIndex) {
        const currentWorkId = (() => {
          if (PAGE === 'work') {
            const pid = new URLSearchParams(location.search).get('id');
            return pid ? pid.padStart(2, '0') : '';
          }
          const m = PAGE.match(/^work(\w+)/);
          return m ? m[1].padStart(2, '0') : '';
        })();
        const currentWorkMediaPrefix = currentWorkId ? ('wd:' + currentWorkId + ':') : '';
        async function syncMediaEntry(key, info) {
          const existing = await mediaGet(key);
          if (existing && !hasNewPublicVersion) return false;
          if (info.kind === 'embed') {
            await mediaSet(key, { kind: 'embed', embedUrl: info.embedUrl });
            return true;
          }
          if (info.kind === 'ref') {
            await mediaSet(key, { kind: 'ref', refKey: info.refKey });
            return true;
          }
          if (info.file) {
            try {
              const mr = await fetch(base + info.file + cacheBust, { cache: 'reload' });
              if (mr.ok) {
                const blob = await mr.blob();
                const posterFile = info.poster || ((info.kind === 'video' && /\.(mp4|mov|webm)$/i.test(info.file))
                  ? info.file.replace(/\.(mp4|mov|webm)(\?.*)?$/i, '.jpg')
                  : '');
                await mediaSet(key, {
                  kind: info.kind,
                  blob,
                  posterUrl: posterFile ? base + posterFile + cacheBust : '',
                });
                return true;
              }
            } catch (e) { /* 개별 파일 실패는 무시 */ }
          }
          return false;
        }
        const priorityKeys = currentWorkMediaPrefix
          ? Object.keys(data.mediaIndex)
              .filter(key => key.indexOf(currentWorkMediaPrefix) === 0 || key === 'wimg:' + currentWorkId || key.indexOf('whover:' + currentWorkId + ':') === 0)
              .sort((a, b) => {
                const rank = key => key.endsWith(':c0') ? 0 : (key === 'wimg:' + currentWorkId ? 1 : key.includes(':next') ? 2 : 3);
                return rank(a) - rank(b);
              })
          : [];
        priorityKeys.forEach(key => {
          syncMediaEntry(key, data.mediaIndex[key]).catch(() => {});
        });
        (async () => {
          let mediaChanged = false;
          for (const [key, info] of Object.entries(data.mediaIndex)) {
            if (priorityKeys.includes(key)) continue;
            if (await syncMediaEntry(key, info)) mediaChanged = true;
          }
          if (mediaChanged) window.dispatchEvent(new CustomEvent('arthod:public-sync'));
        })();
      }
    } catch (e) { /* 오프라인/네트워크 오류 시 조용히 무시 */ }
    return changed;
  }

  /* ── 7. 초기화 ── */
  function revealBootingPage() {
    document.body.classList.remove('work-detail-booting');
    document.body.classList.add('work-detail-ready');
    const workPage = document.getElementById('work-page');
    if (workPage) {
      workPage.style.opacity = '1';
      workPage.style.visibility = 'visible';
    }
    window.dispatchEvent(new CustomEvent('arthod:editor-ready'));
  }

  async function init() {
    db(); // warm-start IndexedDB
    const publicSyncPromise = syncFromPublicSource(); // 방문자마다 최신 게시본을 반영하되 화면 표시는 막지 않는다.
    restoreFooterConnect();
    restoreAboutHistory();
    migrateLegacyProjectTitles();
    tagShared();
    assignKeys();
    restoreText();
    normalizeContactFormFields();
    restoreShared();
    restoreStyles();
    applyMirrors();
    tagMedia();
    restoreLayouts();
    attachMediaHandles();
    buildUI();
    revealBootingPage();
    applyAllMedia().then(() => {
      refreshCount();
      revealBootingPage();
    }).catch(revealBootingPage);
    publicSyncPromise.then(changed => {
      if (changed) applyAllMedia().then(refreshCount).catch(() => {});
    }).catch(() => {});
    let mediaApplyTimer = null;
    const scheduleMediaApply = () => {
      clearTimeout(mediaApplyTimer);
      mediaApplyTimer = setTimeout(() => applyAllMedia().then(refreshCount).catch(() => {}), 40);
    };
    window.addEventListener('arthod:media-updated', scheduleMediaApply);
    window.addEventListener('arthod:public-sync', scheduleMediaApply);
    // 콜드 스타트 / works.html 기본 이미지 루프와의 경합 방지: 여러 번 재적용 (idempotent)
    setTimeout(() => applyAllMedia(), 250);
    setTimeout(() => applyAllMedia(), 800);
    window.addEventListener('load', () => applyAllMedia().then(refreshCount));
    // work.html 등 동적으로 슬라이드를 재구성하는 페이지가 미디어 시스템을 재연결할 수 있도록 노출
    window.ArthodEditor = {
      reapplyMedia: () => {
        tagMedia();
        attachMediaHandles();
        applyAllMedia();
        restoreLayouts();
      },
      refreshEditable: () => {
        restoreAboutHistory();
        assignKeys();
        restoreText();
        normalizeContactFormFields();
        restoreStyles();
        tagMedia();
        attachMediaHandles();
        if (editing) {
          keyed.forEach(el => {
            el.contentEditable = 'true';
            el.spellcheck = false;
          });
          setAboutHistoryEditable(true);
        }
        applyAllMedia();
      },
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
