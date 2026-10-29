(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Tema persistente: localStorage como primera opción y cookie como respaldo.
  const readSavedTheme = () => {
    try {
      const stored = localStorage.getItem('siam-theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (_) {}
    try {
      const match = document.cookie.match(/(?:^|;\s*)siam-theme=(dark|light)(?:;|$)/);
      if (match) return match[1];
    } catch (_) {}
    const preloaded = document.documentElement.dataset.siamTheme;
    return preloaded === 'dark' || preloaded === 'light' ? preloaded : 'light';
  };
  const saveTheme = (theme) => {
    try { localStorage.setItem('siam-theme', theme); } catch (_) {}
    try {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `siam-theme=${theme}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    } catch (_) {}
  };
  const applyTheme = (theme) => {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.siamTheme = validTheme;
    document.body.classList.toggle('theme-dark', validTheme === 'dark');
    const toggle = $('#theme-toggle');
    if (toggle) {
      toggle.textContent = validTheme === 'dark' ? '☼' : '◐';
      toggle.setAttribute('aria-label', validTheme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro');
      toggle.title = validTheme === 'dark' ? 'Tema claro' : 'Tema oscuro';
    }
  };
  const initialTheme = readSavedTheme();
  applyTheme(initialTheme);
  saveTheme(initialTheme);
  $('#theme-toggle')?.addEventListener('click', () => {
    const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });
  window.addEventListener('storage', event => {
    if (event.key === 'siam-theme' && (event.newValue === 'dark' || event.newValue === 'light')) applyTheme(event.newValue);
  });

  // Menú móvil accesible.
  const menuButton = $('#menu-toggle');
  const navLinks = $('#nav-links');
  menuButton?.addEventListener('click', () => {
    const opened = navLinks?.classList.toggle('is-open') || false;
    menuButton.setAttribute('aria-expanded', String(opened));
    menuButton.setAttribute('aria-label', opened ? 'Cerrar menú' : 'Abrir menú');
    menuButton.textContent = opened ? '×' : '☰';
  });
  $$('#nav-links a').forEach(link => link.addEventListener('click', () => {
    navLinks?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) { menuButton.textContent = '☰'; menuButton.setAttribute('aria-label', 'Abrir menú'); }
  }));

  // Aparición suave, desactivada cuando el usuario ha pedido movimiento reducido.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    $$('.reveal').forEach(el => observer.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('is-visible'));

  // Cuenta atrás para el inicio del viaje.
  const countdown = $('[data-countdown]');
  if (countdown) {
    const target = new Date(2027, 3, 1, 10, 0, 0).getTime();
    const parts = { days: $('#days'), hours: $('#hours'), mins: $('#mins'), secs: $('#secs') };
    const updateCountdown = () => {
      let distance = Math.max(0, target - Date.now());
      const values = {
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        mins: Math.floor((distance % 3600000) / 60000),
        secs: Math.floor((distance % 60000) / 1000)
      };
      Object.entries(values).forEach(([key, value]) => { if (parts[key]) parts[key].textContent = String(value).padStart(2, '0'); });
      if (distance === 0) countdown.setAttribute('aria-label', 'La fecha objetivo del proyecto ya ha llegado');
    };
    updateCountdown(); window.setInterval(updateCountdown, 1000);
  }

  // Checklist de preparación y actualización del progreso.
  const checklist = $('[data-checklist]');
  if (checklist) {
    const key = `siam-checklist-${checklist.dataset.checklist}`;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) { saved = {}; }
    const boxes = $$('input[type="checkbox"][data-task]', checklist);
    const fill = $('#progress-fill'); const count = $('#progress-count');
    const renderProgress = () => {
      const done = boxes.filter(box => box.checked).length;
      const pct = boxes.length ? Math.round(done / boxes.length * 100) : 0;
      if (fill) fill.style.width = `${pct}%`;
      if (count) count.textContent = `${done} de ${boxes.length} completadas · ${pct}%`;
      try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(boxes.map(box => [box.dataset.task, box.checked])))); } catch (_) {}
    };
    boxes.forEach(box => { box.checked = Boolean(saved[box.dataset.task]); box.addEventListener('change', renderProgress); });
    renderProgress();
    $('#reset-checklist')?.addEventListener('click', () => { boxes.forEach(box => { box.checked = false; }); renderProgress(); });
  }

  // Catálogo de artículos y cálculo del importe.
  const productInputs = $$('[data-price][data-product]');
  const currency = value => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const summaryTotal = $('#cart-total');
  const cartCount = $('#cart-count');
  const dialog = $('#order-dialog');
  const orderList = $('#order-lines');
  const dialogTotal = $('#dialog-total');
  const orderMessage = $('#order-message');
  const getOrder = () => productInputs.map(input => {
    const quantity = Math.max(0, Math.min(10, Number.parseInt(input.value || '0', 10) || 0));
    input.value = quantity;
    const price = Number(input.dataset.price);
    return { name: input.dataset.product, quantity, price, subtotal: quantity * price };
  }).filter(item => item.quantity > 0);
  const renderOrder = () => {
    const order = getOrder();
    const total = order.reduce((sum, item) => sum + item.subtotal, 0);
    const items = order.reduce((sum, item) => sum + item.quantity, 0);
    if (summaryTotal) summaryTotal.textContent = currency(total);
    if (cartCount) cartCount.textContent = `${items} ${items === 1 ? 'artículo' : 'artículos'}`;
    if (orderList) {
      orderList.replaceChildren();
      if (!order.length) {
        const li = document.createElement('li'); li.textContent = 'Aún no has seleccionado artículos.'; orderList.append(li);
      } else order.forEach(item => {
        const li = document.createElement('li');
        const left = document.createElement('span'); left.textContent = `${item.name} × ${item.quantity}`;
        const right = document.createElement('strong'); right.textContent = currency(item.subtotal);
        li.append(left, right); orderList.append(li);
      });
    }
    if (dialogTotal) dialogTotal.textContent = currency(total);
    return { order, total, items };
  };
  productInputs.forEach(input => input.addEventListener('input', renderOrder));
  if (productInputs.length) renderOrder();
  $('#review-order')?.addEventListener('click', () => {
    const result = renderOrder();
    if (!result.items) { if (orderMessage) orderMessage.textContent = 'Elige al menos un artículo para revisar el resumen.'; }
    else if (orderMessage) orderMessage.textContent = '';
    if (dialog?.showModal) dialog.showModal();
  });
  $('#close-order')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  const makeOrderText = () => {
    const result = renderOrder();
    const lines = result.order.map(item => `- ${item.name}: ${item.quantity} × ${currency(item.price)} = ${currency(item.subtotal)}`);
    return [`SIAM / 27 — SELECCIÓN DE ARTÍCULOS`, ...lines, `TOTAL: ${currency(result.total)}`].join('\n');
  };
  $('#copy-order')?.addEventListener('click', async () => {
    const text = makeOrderText();
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select();
        const ok = document.execCommand('copy'); area.remove(); if (!ok) throw new Error('Copia no disponible');
      }
      if (orderMessage) orderMessage.textContent = 'Resumen copiado.';
    } catch (_) { if (orderMessage) orderMessage.textContent = 'No se pudo copiar automáticamente. Selecciona el resumen y cópialo manualmente.'; }
  });
  const proposalLink = $('#diary-proposal-link');
  const proposalFormUrl = window.SIAM_CONFIG?.diaryProposalFormUrl?.trim();
  if (proposalLink && proposalFormUrl && /^https:\/\//i.test(proposalFormUrl)) {
    proposalLink.href = proposalFormUrl;
  }

  const continueForm = $('#continue-form');
  const orderFormUrl = window.SIAM_CONFIG?.orderFormUrl?.trim();
  if (continueForm && orderFormUrl && /^https:\/\//i.test(orderFormUrl)) {
    continueForm.hidden = false;
    continueForm.addEventListener('click', () => window.open(orderFormUrl, '_blank', 'noopener,noreferrer'));
  }

  // Buscador de la bitácora: filtra ideas por texto y categoría.
  const diarySearch = $('#diary-search'); const diaryCategory = $('#diary-category'); const diaryCards = $$('.diary-card');
  const filterDiary = () => {
    const term = (diarySearch?.value || '').trim().toLocaleLowerCase('es');
    const category = diaryCategory?.value || 'all'; let shown = 0;
    diaryCards.forEach(card => {
      const matchesText = card.textContent.toLocaleLowerCase('es').includes(term);
      const matchesCategory = category === 'all' || card.dataset.category === category;
      card.hidden = !(matchesText && matchesCategory); if (!card.hidden) shown++;
    });
    const empty = $('#diary-empty'); if (empty) empty.hidden = shown > 0;
    const count = $('#diary-results'); if (count) count.textContent = `${shown} ${shown === 1 ? 'idea visible' : 'ideas visibles'}`;
  };
  diarySearch?.addEventListener('input', filterDiary); diaryCategory?.addEventListener('change', filterDiary); filterDiary();

  // Notas personales de la bitácora.
  const note = $('#trip-note'); const noteStatus = $('#note-status'); const noteKey = 'siam-personal-note';
  if (note) { try { note.value = localStorage.getItem(noteKey) || ''; } catch (_) {} }
  $('#save-note')?.addEventListener('click', () => {
    try { localStorage.setItem(noteKey, note?.value || ''); if (noteStatus) noteStatus.textContent = 'Nota guardada.'; }
    catch (_) { if (noteStatus) noteStatus.textContent = 'El navegador no permite guardar. Copia el texto para no perderlo.'; }
  });
  $('#clear-note')?.addEventListener('click', () => {
    if (note) note.value = '';
    try { localStorage.removeItem(noteKey); } catch (_) {}
    if (noteStatus) noteStatus.textContent = 'Nota borrada.';
  });
  $('#download-note')?.addEventListener('click', () => {
    const blob = new Blob([note?.value || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mis-notas-siam-2027.txt'; document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    if (noteStatus) noteStatus.textContent = 'Archivo de texto preparado.';
  });

  // Mapa Leaflet: inicializar tras los scripts defer. Si un CDN falla, la lista queda accesible.
  const initRouteMap = () => {
    const mapNode = $('#route-map');
    if (!mapNode) return;
    if (window.L) {
      const map = L.map(mapNode, { scrollWheelZoom: false }).setView([16.7, 100.1], 5);
      // La clave pública de CARTO Basemaps se configura en js/config.js.
      // En GitHub Pages el código es público: utiliza una clave restringida por Referer.
      const cartoApiKey = String(window.SIAM_CONFIG?.cartoBasemapsApiKey || '').trim();
      const cartoTileUrl = `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${cartoApiKey ? `?key=${encodeURIComponent(cartoApiKey)}` : ''}`;
      L.tileLayer(cartoTileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd', maxZoom: 19
      }).addTo(map);
      const stops = [
        { name: 'Bangkok', detail: 'Templos, canales y primera base del viaje', coords: [13.7563, 100.5018] },
        { name: 'Damnoen Saduak', detail: 'Mercado flotante y canales tradicionales', coords: [13.5197, 99.9578] },
        { name: 'Chiang Mai', detail: 'Segunda base del viaje', coords: [18.7883, 98.9853] },
        { name: 'Doi Inthanon', detail: 'Senderos, cascadas y vistas de montaña', coords: [18.5883, 98.4867] },
        { name: 'Doi Suthep', detail: 'Templo en las colinas de Chiang Mai', coords: [18.8049, 98.9216] }
      ];
      stops.forEach(stop => {
        const marker = L.circleMarker(stop.coords, { radius: 8, color: '#f5f0e5', weight: 3, fillColor: '#e96543', fillOpacity: 1 }).addTo(map);
        marker.bindPopup(`<strong>${stop.name}</strong><br>${stop.detail}`);
      });
      map.fitBounds(stops.map(stop => stop.coords), { padding: [28, 28] });
    } else {
      mapNode.innerHTML = '<div class="map-fallback"><strong>Mapa no disponible ahora mismo.</strong><p>Consulta los destinos y las etapas en la guía de esta misma página.</p></div>';
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRouteMap, { once: true });
  else initRouteMap();
})();
