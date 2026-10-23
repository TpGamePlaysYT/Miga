const STORAGE_KEY = 'miga:saved:v1';
const toast = document.querySelector('[data-toast]');
let toastTimer;
function announce(message) {
  clearTimeout(toastTimer);
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 4500);
}
let saved = new Set();
let storageAvailable = true;
try {
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(raw))
    saved = new Set(raw.filter((s) => typeof s === 'string' && /^[a-z0-9-]+$/.test(s)));
} catch {
  storageAvailable = false;
}
function syncSaved() {
  document.querySelectorAll('[data-save]').forEach((button) => {
    const active = saved.has(button.dataset.save);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute(
      'aria-label',
      `${active ? 'Quitar de guardados:' : 'Guardar'} ${button.dataset.label}`,
    );
    const text = button.querySelector('[data-save-text]');
    if (text) text.textContent = active ? 'Guardado en tu colección' : 'Guardar para después';
  });
  document.querySelectorAll('[data-saved-count]').forEach((el) => {
    el.textContent = String(saved.size);
  });
}
document.querySelectorAll('[data-save]').forEach((button) =>
  button.addEventListener('click', () => {
    const slug = button.dataset.save;
    if (saved.has(slug)) saved.delete(slug);
    else saved.add(slug);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));
      storageAvailable = true;
    } catch {
      storageAvailable = false;
    }
    syncSaved();
    filterCatalog();
    announce(
      storageAvailable
        ? saved.has(slug)
          ? 'Idea guardada. Vuelve a ella cuando quieras.'
          : 'Idea eliminada de tus guardados.'
        : 'El navegador no permite guardar. Este cambio durará solo en esta página.',
    );
  }),
);
syncSaved();
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  try {
    const raw = JSON.parse(event.newValue || '[]');
    saved = new Set(
      Array.isArray(raw) ? raw.filter((s) => typeof s === 'string' && /^[a-z0-9-]+$/.test(s)) : [],
    );
  } catch {
    saved = new Set();
  }
  syncSaved();
  filterCatalog();
});
const menuButton = document.querySelector('.mobile-menu');
const mobileNav = document.querySelector('#mobile-nav');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Cerrar menú' : 'Abrir menú');
  mobileNav.hidden = !expanded;
});
mobileNav?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  }),
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !mobileNav?.hidden) {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    menuButton.focus();
  }
});

document.querySelectorAll('[data-copy]').forEach((button) =>
  button.addEventListener('click', async () => {
    const el = document.getElementById(button.dataset.copy);
    const text = el?.textContent || '';
    let success = false;
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.cssText = 'position:fixed;top:0;left:-9999px';
      document.body.append(area);
      area.select();
      try {
        success = document.execCommand('copy');
      } catch {
        /* Select the original text below. */
      }
      area.remove();
      button.focus();
    }
    if (success) {
      const label = button.querySelector('span');
      label.textContent = '¡Prompt copiado!';
      button.classList.add('copied');
      announce('Prompt copiado. Ahora dale tu toque.');
      setTimeout(() => {
        label.textContent = 'Copiar prompt';
        button.classList.remove('copied');
      }, 3000);
    } else {
      const range = document.createRange();
      range.selectNodeContents(el);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      el.focus();
      announce(
        'No se pudo copiar automáticamente. Seleccionamos el texto: usa Copiar en tu navegador.',
      );
    }
  }),
);

document.querySelectorAll('[data-video-src]').forEach((button) =>
  button.addEventListener('click', () => {
    const player = button.closest('[data-player]');
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.poster = button.dataset.videoPoster;
    video.setAttribute(
      'aria-label',
      button.getAttribute('aria-label').replace('Reproducir ', 'Video: '),
    );
    video.src = button.dataset.videoSrc;
    video.addEventListener('error', () => {
      announce('No se pudo cargar el video. Comprueba tu conexión o inténtalo de nuevo.');
    });
    player.querySelector('[data-poster]').hidden = true;
    button.hidden = true;
    player.append(video);
    video.play().catch(() => announce('Pulsa reproducir en los controles del video.'));
  }),
);

const catalog = document.querySelector('[data-catalog]');
const search = catalog?.querySelector('#search');
const sort = catalog?.querySelector('#sort');
const cards = [...(catalog?.querySelectorAll('[data-card]') || [])];
cards.forEach((card, i) => {
  card.dataset.order = String(i);
});
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
let type = 'all';
let category = 'all';
function readURL() {
  if (!catalog) return;
  const params = new URLSearchParams(location.search);
  type = ['image', 'video'].includes(params.get('type')) ? params.get('type') : 'all';
  const categories = [...catalog.querySelectorAll('button[data-category]')].map(
    (el) => el.dataset.category,
  );
  category = categories.includes(params.get('category')) ? params.get('category') : 'all';
  search.value = params.get('q') || '';
  sort.value = ['az', 'za'].includes(params.get('sort')) ? params.get('sort') : 'editorial';
}
function updateURL() {
  const url = new URL(location.href);
  for (const [key, value] of [
    ['q', search.value.trim()],
    ['type', type === 'all' ? '' : type],
    ['category', category === 'all' ? '' : category],
    ['sort', sort.value === 'editorial' ? '' : sort.value],
  ]) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null, '', url);
}
function filterCatalog() {
  if (!catalog) return;
  const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  let count = 0;
  cards.forEach((card) => {
    const visible =
      (catalog.dataset.savedOnly !== 'true' || saved.has(card.dataset.slug)) &&
      (type === 'all' || card.dataset.type === type) &&
      (category === 'all' || card.dataset.category === category) &&
      terms.every((term) => normalize(card.dataset.search).includes(term));
    card.hidden = !visible;
    if (visible) count++;
  });
  const grid = catalog.querySelector('.prompt-grid');
  [...cards]
    .sort((a, b) =>
      sort.value === 'editorial'
        ? Number(a.dataset.order) - Number(b.dataset.order)
        : a.dataset.title.localeCompare(b.dataset.title, 'es') * (sort.value === 'za' ? -1 : 1),
    )
    .forEach((card) => grid.append(card));
  catalog
    .querySelectorAll('[data-type-filter]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.typeFilter === type)),
    );
  catalog
    .querySelectorAll('button[data-category]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.category === category)),
    );
  catalog.querySelector('[data-results]').textContent =
    `${count} ${count === 1 ? 'idea' : 'ideas'} ${catalog.dataset.savedOnly === 'true' ? 'en tu colección' : 'para empezar'}`;
  const filtered = Boolean(
    terms.length || type !== 'all' || category !== 'all' || sort.value !== 'editorial',
  );
  catalog.querySelector('[data-clear]').hidden = !filtered;
  const empty = catalog.querySelector('[data-empty]');
  empty.hidden = count > 0;
  if (!count) {
    const isSaved = catalog.dataset.savedOnly === 'true';
    empty.querySelector('[data-empty-title]').textContent = filtered
      ? 'No encontramos esa combinación'
      : isSaved
        ? 'Tu próxima idea merece un lugar aquí'
        : 'Las primeras migas están en el horno';
    empty.querySelector('[data-empty-description]').textContent = filtered
      ? 'Prueba con otras palabras o limpia los filtros para descubrir más ideas.'
      : isSaved
        ? 'Toca el marcador de una ficha para guardarla. Los guardados son locales a este navegador; las fichas retiradas no aparecen aquí.'
        : 'Estamos preparando y probando los primeros prompts. Aquí aparecerán cuando tengamos sus resultados reales.';
  }
}
if (catalog) {
  readURL();
  filterCatalog();
  search.addEventListener('input', () => {
    updateURL();
    filterCatalog();
  });
  catalog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    updateURL();
    filterCatalog();
  });
  sort.addEventListener('change', () => {
    updateURL();
    filterCatalog();
  });
  catalog.querySelectorAll('[data-type-filter]').forEach((button) =>
    button.addEventListener('click', () => {
      type = button.dataset.typeFilter;
      updateURL();
      filterCatalog();
    }),
  );
  catalog.querySelectorAll('button[data-category]').forEach((button) =>
    button.addEventListener('click', () => {
      category = button.dataset.category;
      updateURL();
      filterCatalog();
    }),
  );
  catalog.querySelector('[data-clear]').addEventListener('click', () => {
    search.value = '';
    type = 'all';
    category = 'all';
    sort.value = 'editorial';
    updateURL();
    filterCatalog();
    search.focus();
  });
  window.addEventListener('popstate', () => {
    readURL();
    filterCatalog();
  });
  document.addEventListener('keydown', (e) => {
    if (
      e.key === '/' &&
      !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) &&
      !document.activeElement?.isContentEditable
    ) {
      e.preventDefault();
      search.focus();
    }
  });
}
