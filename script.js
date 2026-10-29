// When the personal Yugor Lab homepage is ready, paste its URL here.
const PERSONAL_SITE_URL = "";
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
const currentSection = document.getElementById('currentSection');
const sidebar = document.getElementById('sidebar');
const mobileMenu = document.getElementById('mobileMenu');
const menuBackdrop = document.getElementById('menuBackdrop');
const toast = document.getElementById('toast');
const textSizeSlider = document.getElementById('textSizeSlider');
const textSizeValue = document.getElementById('textSizeValue');

const TEXT_SIZE_STORAGE_KEY = 'dottoreArchiveTextSize';

function applyReadingTextSize(value, persist = true) {
  const numeric = Math.max(90, Math.min(150, Number(value) || 100));
  document.documentElement.style.setProperty('--reader-scale', String(numeric / 100));
  if (textSizeSlider) textSizeSlider.value = String(numeric);
  if (textSizeValue) textSizeValue.textContent = `${numeric}%`;

  if (persist) {
    try {
      localStorage.setItem(TEXT_SIZE_STORAGE_KEY, String(numeric));
    } catch (_) {
      /* Local files/private browsing may block storage; scaling still works. */
    }
  }
}

let initialTextSize = 100;
try {
  const savedTextSize = Number(localStorage.getItem(TEXT_SIZE_STORAGE_KEY));
  if (savedTextSize >= 90 && savedTextSize <= 150) initialTextSize = savedTextSize;
} catch (_) {}

applyReadingTextSize(initialTextSize, false);

if (textSizeSlider) {
  textSizeSlider.addEventListener('input', (event) => {
    applyReadingTextSize(event.target.value);
  });
}

const translations = window.DA_LANG || {};

function tr(key, lang = getContentLanguage(currentLang)) {
  const table = translations[lang] || translations.en || {};
  const fallback = translations.en || {};
  return table[key] ?? fallback[key] ?? key;
}

function trf(key, vars = {}, lang = getContentLanguage(currentLang)) {
  return tr(key, lang).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
}



let currentLang = 'en';

function setMobileMenu(open) {
  if (window.innerWidth > 760) open = false;
  sidebar.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  mobileMenu.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-label', open ? tr('aria.closeMenu') : tr('aria.openMenu'));
  mobileMenu.textContent = open ? '×' : '☰';
  menuBackdrop.setAttribute('aria-hidden', String(!open));
}

function jumpTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (window.innerWidth <= 760) setMobileMenu(false);
}

navLinks.forEach(link => link.addEventListener('click', () => jumpTo(link.dataset.target)));
document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => jumpTo(btn.dataset.jump)));

mobileMenu.addEventListener('click', () => {
  setMobileMenu(!sidebar.classList.contains('open'));
});

menuBackdrop.addEventListener('click', () => setMobileMenu(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) {
    setMobileMenu(false);
    mobileMenu.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760 && sidebar.classList.contains('open')) {
    setMobileMenu(false);
  }
});

function getContentLanguage(lang = currentLang) {
  return lang === 'tyv' ? 'en' : lang;
}

function setActiveSection(id) {
  if (!id) return;
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.target === id));
  currentSection.textContent = tr(`section.${id}`);
}

// Scroll spy based on a fixed reading line rather than intersection percentages.
// This stays reliable even when sections have very different heights on phone/desktop.
let scrollSpyFrame = null;
function updateActiveSection() {
  scrollSpyFrame = null;
  const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 80;
  const probeLine = Math.min(window.innerHeight * 0.34, topbarHeight + 96);
  let active = sections[0];

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= probeLine) active = section;
    else break;
  }

  // When the page is at the very bottom, always mark the final section.
  const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
  if (nearBottom && sections.length) active = sections[sections.length - 1];
  setActiveSection(active?.id);
}

function scheduleScrollSpy() {
  if (scrollSpyFrame !== null) return;
  scrollSpyFrame = requestAnimationFrame(updateActiveSection);
}

window.addEventListener('scroll', scheduleScrollSpy, { passive: true });
window.addEventListener('resize', scheduleScrollSpy, { passive: true });
window.addEventListener('load', updateActiveSection);
updateActiveSection();

const segmentData = window.DA_DATA.segmentData;

const segmentButtons = [...document.querySelectorAll('.segment-btn')];
const segmentNumber = document.getElementById('segmentNumber');
const segmentImage = document.getElementById('segmentImage');
const segmentImageLabel = document.getElementById('segmentImageLabel');
const segmentTitle = document.getElementById('segmentTitle');
const segmentDescription = document.getElementById('segmentDescription');
const segmentStatus = document.getElementById('segmentStatus');

segmentButtons.forEach(btn => btn.addEventListener('click', () => {
  const data = segmentData[btn.dataset.segment];
  segmentButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const padded = String(btn.dataset.segment).padStart(2, '0');
  segmentNumber.textContent = padded;
  segmentTitle.textContent = data.title;
  segmentDescription.textContent = tr(data.textKey);
  segmentStatus.textContent = tr(data.statusKey);
  segmentImage.src = data.image;
  segmentImage.alt = tr(data.altKey);
  segmentImageLabel.textContent = data.label;
}));


const langButtons = [...document.querySelectorAll('.lang-btn')];
const languageControl = document.getElementById('languageControl');
const languageTrigger = document.getElementById('languageTrigger');
const languagePopover = document.getElementById('languagePopover');
const languageCurrent = document.getElementById('languageCurrent');

function openLanguageMenu() {
  if (!languagePopover || !languageTrigger) return;
  languagePopover.hidden = false;
  languageTrigger.setAttribute('aria-expanded', 'true');
}

function closeLanguageMenu(returnFocus = false) {
  if (!languagePopover || !languageTrigger) return;
  languagePopover.hidden = true;
  languageTrigger.setAttribute('aria-expanded', 'false');
  if (returnFocus) languageTrigger.focus();
}

function toggleLanguageMenu() {
  if (!languagePopover || !languageTrigger) return;
  if (languagePopover.hidden) openLanguageMenu();
  else closeLanguageMenu();
}

languageTrigger?.addEventListener('click', toggleLanguageMenu);

document.addEventListener('click', event => {
  if (!languageControl?.contains(event.target)) closeLanguageMenu();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && languagePopover && !languagePopover.hidden) {
    closeLanguageMenu(true);
  }
});

function applyLanguage(lang) {
  currentLang = lang;
  const sourceLang = getContentLanguage(lang);
  document.documentElement.lang = sourceLang;
  document.body.classList.toggle('teyvat-mode', lang === 'tyv');

  document.querySelectorAll('[data-l10n]').forEach(el => {
    const key = el.dataset.l10n;
    el.textContent = tr(key, sourceLang);
  });
  document.querySelectorAll('[data-l10n-alt]').forEach(el => {
    const key = el.dataset.l10nAlt;
    el.alt = tr(key, sourceLang);
  });
  document.querySelectorAll('[data-l10n-placeholder]').forEach(el => {
    const key = el.dataset.l10nPlaceholder;
    el.placeholder = tr(key, sourceLang);
  });

  langButtons.forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', String(active));
    const meta = btn.querySelector('.language-option-meta');
    if (meta) meta.textContent = active ? tr('language.selected', sourceLang) : '';
  });

  const activeLangButton = langButtons.find(btn => btn.dataset.lang === lang);
  if (languageCurrent) languageCurrent.textContent = activeLangButton?.dataset.short || lang.toUpperCase();
  if (languageTrigger) {
    languageTrigger.title = tr('language.triggerTitle', sourceLang);
    languageTrigger.setAttribute('aria-label', trf('language.triggerAria', {
      code: activeLangButton?.dataset.short || lang.toUpperCase()
    }, sourceLang));
  }

  const searchButton = document.getElementById('searchTrigger');
  if (searchButton) {
    searchButton.title = tr('search.open', sourceLang);
    searchButton.setAttribute('aria-label', tr('search.open', sourceLang));
  }
  const searchCloser = document.getElementById('searchClose');
  if (searchCloser) searchCloser.setAttribute('aria-label', tr('search.close', sourceLang));

  const activeNav = document.querySelector('.nav-link.active');
  const activeSection = activeNav?.dataset.target || 'overview';
  currentSection.textContent = tr(`section.${activeSection}`, sourceLang);
  if (typeof updateActiveSection === 'function') updateActiveSection();

  const activeSegmentButton = document.querySelector('.segment-btn.active');
  const segmentKey = activeSegmentButton?.dataset.segment || '8';
  const data = segmentData[segmentKey];
  if (data) {
    segmentDescription.textContent = tr(data.textKey, sourceLang);
    segmentStatus.textContent = tr(data.statusKey, sourceLang);
    segmentImage.alt = tr(data.altKey, sourceLang);
  }

  document.getElementById('mobileMenu').setAttribute('aria-label', tr('aria.openMenu', sourceLang));
  if (textSizeSlider) {
    textSizeSlider.setAttribute('aria-label', tr('aria.textSize', sourceLang));
  }
  if (typeof mediaRecords !== 'undefined' && mediaRecords[activeMediaId]) {
    audioRecordDescription.textContent = tr(mediaRecords[activeMediaId].descriptionKey, sourceLang);
  }
}

langButtons.forEach(btn => btn.addEventListener('click', () => {
  applyLanguage(btn.dataset.lang);
  closeLanguageMenu();
}));

const mediaRecords = window.DA_DATA.mediaRecords;

let activeMediaId = 'lazzo';
const mediaPlayer = document.getElementById('officialMediaPlayer');
const audioRecordCode = document.getElementById('audioRecordCode');
const audioRecordTitle = document.getElementById('audioRecordTitle');
const audioRecordDescription = document.getElementById('audioRecordDescription');
const audioRecordSource = document.getElementById('audioRecordSource');
const audioRecordCredit = document.getElementById('audioRecordCredit');

function loadMedia(id, scrollToAudio = false) {
  const item = mediaRecords[id];
  if (!item) return;
  activeMediaId = id;
  mediaPlayer.src = `https://www.youtube-nocookie.com/embed/${item.videoId}?rel=0`;
  audioRecordCode.textContent = `${tr('media.recordLabel')} · ${item.code}`;
  audioRecordTitle.textContent = tr(item.titleKey);
  audioRecordDescription.textContent = tr(item.descriptionKey);
  audioRecordSource.href = `https://www.youtube.com/watch?v=${item.videoId}`;
  audioRecordCredit.textContent = trf('media.credit', { year: item.year });
  document.querySelectorAll('.audio-entry').forEach(btn => btn.classList.toggle('active', btn.dataset.audioId === id));
  document.querySelectorAll('[data-media-card]').forEach(card => card.classList.toggle('active', card.dataset.mediaCard === id));
  if (scrollToAudio) jumpTo('audio');
}

document.querySelectorAll('.audio-entry').forEach(btn => btn.addEventListener('click', () => loadMedia(btn.dataset.audioId)));
document.querySelectorAll('[data-load-media]').forEach(btn => btn.addEventListener('click', () => loadMedia(btn.dataset.loadMedia, true)));


// Client-side full-text search across the currently rendered archive.
const searchOverlay = document.getElementById('archiveSearchOverlay');
const searchTrigger = document.getElementById('searchTrigger');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('archiveSearchInput');
const searchResults = document.getElementById('archiveSearchResults');
let searchReturnFocus = null;

function normalizeSearchText(value) {
  return String(value || '').toLocaleLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ё/g, 'е').replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}' -]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function elementSearchText(el) {
  const raw = el.tagName === 'DETAILS'
    ? (el.textContent || '')
    : (el.innerText || el.textContent || '');
  return raw.replace(/\s+/g, ' ').trim();
}

function searchCandidates() {
  const selectors = [
    '.hero-copy', '.zandik-main', '.specimen-card', '.early-record', '.lore-record', '.timeline > article',
    '.analysis-card', '.theory-card', '.fit-card', '.relationship-card',
    '.scene-study', '.webttore-record', '.remote-source-card', '.audio-entry',
    '.archive-grid > *', '.relationship-card'
  ].join(',');
  const nodes = [...document.querySelectorAll(selectors)].filter(el => el.closest('main'));
  const seen = new Set();
  return nodes.filter(el => {
    if (seen.has(el)) return false;
    seen.add(el);
    const text = elementSearchText(el);
    return text.length >= 24 && !el.closest('[hidden]');
  }).map((el, index) => {
    if (!el.id) el.id = `archive-search-result-${index + 1}`;
    const heading = el.querySelector('h2,h3,h4,h5,h6,.relation-name,.lore-record-label,.audio-entry-title');
    const section = el.closest('main section[id]');
    return {
      el,
      id: el.id,
      title: (heading?.innerText || heading?.textContent || section?.querySelector('h2,h3')?.innerText || section?.id || tr('search.section')).trim(),
      section: section ? (section.querySelector('.section-heading h3, h2, h3')?.innerText || section.id).trim() : '',
      text: elementSearchText(el)
    };
  });
}

function renderSearchResults() {
  const sourceLang = getContentLanguage(currentLang);
  const query = normalizeSearchText(searchInput.value);
  if (!query) {
    searchResults.innerHTML = `<p class="search-empty">${escapeSearchHtml(tr('search.start', sourceLang))}</p>`;
    return;
  }
  const terms = query.split(' ').filter(Boolean);
  const matches = searchCandidates().map(item => {
    const titleHaystack = normalizeSearchText(item.title);
    const bodyHaystack = normalizeSearchText(`${item.title} ${item.section} ${item.text}`);
    const titleHits = terms.reduce((s, t) => s + (titleHaystack.includes(t) ? 1 : 0), 0);
    const bodyHits = terms.reduce((s, t) => s + (bodyHaystack.includes(t) ? 1 : 0), 0);
    return { ...item, titleHits, bodyHits };
  }).filter(item => item.bodyHits > 0)
    .sort((a, b) =>
      b.titleHits - a.titleHits ||
      b.bodyHits - a.bodyHits ||
      a.title.localeCompare(b.title)
    )
    .slice(0, 30);

  if (!matches.length) {
    searchResults.innerHTML = `<p class="search-empty">${escapeSearchHtml(tr('search.noResults', sourceLang))}</p>`;
    return;
  }

  const countText = tr('search.resultsCount', sourceLang).replace('{count}', String(matches.length));
  const jumpLabel = tr('search.jump', sourceLang);

  searchResults.innerHTML =
    `<p class="search-results-count">${escapeSearchHtml(countText)}</p>` +
    matches.map(item => {
      const rawSnippet = makeSearchSnippet(item.text, terms);
      const snippetHtml = highlightSearchTerms(rawSnippet, terms);
      const aria = `${jumpLabel}: ${item.title}`;
      return `<button class="search-result" type="button" aria-label="${escapeSearchHtml(aria)}" data-search-target="${escapeSearchHtml(item.id)}"><span class="search-result-title">${escapeSearchHtml(item.title)}</span><span class="search-result-meta">${escapeSearchHtml(item.section)}</span><span class="search-result-snippet">${snippetHtml}</span></button>`;
    }).join('');

  searchResults.scrollTop = 0;
}

function highlightSearchTerms(text, terms) {
  const safeTerms = (terms || []).filter(Boolean);
  if (!safeTerms.length) return escapeSearchHtml(text);
  const pattern = safeTerms
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|');
  if (!pattern) return escapeSearchHtml(text);
  const re = new RegExp(`(${pattern})`, 'gi');
  return String(text || '').split(re).map((part, i) =>
    (i % 2 === 1)
      ? `<mark>${escapeSearchHtml(part)}</mark>`
      : escapeSearchHtml(part)
  ).join('');
}

function escapeSearchHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function makeSearchSnippet(text, terms) {
  const safeTerms = (terms || []).filter(Boolean);
  if (!safeTerms.length) {
    return text.slice(0, 190) + (text.length > 190 ? '…' : '');
  }
  const lowerText = text.toLowerCase();
  let bestIndex = -1;
  for (const t of safeTerms) {
    const idx = lowerText.indexOf(t.toLowerCase());
    if (idx >= 0 && (bestIndex < 0 || idx < bestIndex)) bestIndex = idx;
  }
  if (bestIndex < 0) {
    return text.slice(0, 190) + (text.length > 190 ? '…' : '');
  }
  if (text.length <= 190) return text;
  const start = Math.max(0, Math.min(text.length - 170, bestIndex - 65));
  return (start > 0 ? '…' : '') +
    text.slice(start, start + 170).trim() +
    (start + 170 < text.length ? '…' : '');
}

function openArchiveSearch() {
  searchReturnFocus = document.activeElement;
  closeLanguageMenu();
  setMobileMenu(false);
  searchOverlay.hidden = false;
  searchOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('search-open');
  searchInput.value = '';
  renderSearchResults();
  requestAnimationFrame(() => searchInput.focus());
}
function closeArchiveSearch() {
  searchOverlay.hidden = true;
  searchOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('search-open');
  if (searchReturnFocus && typeof searchReturnFocus.focus === 'function') searchReturnFocus.focus();
}
searchTrigger?.addEventListener('click', openArchiveSearch);
searchClose?.addEventListener('click', closeArchiveSearch);
let searchDebounce;
searchInput?.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(renderSearchResults, 120);
});
searchOverlay?.addEventListener('click', event => {
  if (event.target === searchOverlay) closeArchiveSearch();
  const result = event.target.closest('[data-search-target]');
  if (!result) return;
  const target = document.getElementById(result.dataset.searchTarget);
  closeArchiveSearch();
  if (!target) return;
  let opener = target.closest('details');
  while (opener) {
    opener.open = true;
    opener = opener.parentElement?.closest('details');
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.add('search-result-focus');
  window.setTimeout(() => target.classList.remove('search-result-focus'), 1400);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && searchOverlay && !searchOverlay.hidden) {
    closeArchiveSearch();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (searchOverlay.hidden) openArchiveSearch(); else searchInput.focus();
  }
  if (event.key === 'Enter' && searchOverlay && !searchOverlay.hidden && document.activeElement === searchInput) {
    searchResults.querySelector('[data-search-target]')?.click();
  }
});

applyLanguage('en');
loadMedia('lazzo');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.getElementById('glitchToggle').addEventListener('click', () => {
  document.body.classList.add('glitching');
  showToast(tr('toast.signalInterference'));
  setTimeout(() => document.body.classList.remove('glitching'), 800);
});

document.getElementById('themePulse').addEventListener('click', () => {
  document.body.classList.toggle('pulse');
  showToast(document.body.classList.contains('pulse') ? tr('toast.researchEnhanced') : tr('toast.researchStandard'));
});


function updateAuthorSite() {
  const link = document.getElementById('authorSite');
  const pending = document.getElementById('authorSitePending');
  if (!link || !pending) return;
  if (PERSONAL_SITE_URL && /^https?:\/\//i.test(PERSONAL_SITE_URL)) {
    link.href = PERSONAL_SITE_URL;
    link.hidden = false;
    pending.hidden = true;
  } else {
    link.hidden = true;
    pending.hidden = false;
  }
}
updateAuthorSite();
