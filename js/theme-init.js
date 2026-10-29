// Lee la preferencia antes de cargar el CSS para evitar que el tema parpadee.
(() => {
  let theme = '';
  try {
    const stored = localStorage.getItem('siam-theme');
    if (stored === 'dark' || stored === 'light') theme = stored;
  } catch (_) {}
  if (!theme) {
    try {
      const match = document.cookie.match(/(?:^|;\s*)siam-theme=(dark|light)(?:;|$)/);
      if (match) theme = match[1];
    } catch (_) {}
  }
  if (theme) document.documentElement.dataset.siamTheme = theme;
})();
