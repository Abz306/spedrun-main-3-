// Colour theme: dark (default) | cherry | light.
// Loaded synchronously in <head> so the saved theme is on <html> before first paint,
// then it injects the switch into the nav once the DOM exists (every page has the same nav).
(function () {
  var KEY = 'relayai-theme';
  var ORDER = ['dark', 'cherry', 'light'];

  function apply(name) {
    if (ORDER.indexOf(name) < 0) name = 'dark';
    document.documentElement.setAttribute('data-theme', name);
    try { localStorage.setItem(KEY, name); } catch (e) {}
    var sw = document.querySelector('.theme-switch');
    if (!sw) return;
    sw.style.setProperty('--i', ORDER.indexOf(name));
    sw.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.themeSet === name));
    });
  }

  var saved = 'dark';
  try { saved = localStorage.getItem(KEY) || 'dark'; } catch (e) {}
  apply(saved);   // runs before the body exists: sets the attribute, skips the (absent) switch

  var ICON = {
    dark: '<path d="M14.5 9.6A5.6 5.6 0 0 1 6.9 2 6.6 6.6 0 1 0 14.5 9.6Z"/>',
    cherry: '<path d="M8 2.4C8 4.6 6.7 6.3 5.5 8.2M8 2.4c0 2.2 1.3 3.9 2.5 5.8"/><path d="M8 2.4c1.5-1 3-.8 3.7 0-.7 1-2.3 1.2-3.7 0Z"/><circle cx="5.2" cy="10.9" r="2.6"/><circle cx="10.8" cy="10.9" r="2.6"/>',
    light: '<circle cx="8" cy="8" r="3.3"/><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1"/>'
  };
  var LABEL = { dark: 'Dark', cherry: 'Cherry', light: 'Light' };

  function inject() {
    var nav = document.querySelector('header nav');
    if (!nav || nav.querySelector('.theme-switch')) return;
    var links = nav.querySelector('.nav-links');

    var sw = document.createElement('div');
    sw.className = 'theme-switch';
    sw.setAttribute('role', 'radiogroup');
    sw.setAttribute('aria-label', 'Colour theme');
    sw.innerHTML = '<span class="ts-thumb" aria-hidden="true"></span>' + ORDER.map(function (n) {
      return '<button type="button" role="radio" data-theme-set="' + n + '" title="' + LABEL[n] +
        '" aria-label="' + LABEL[n] + ' theme" aria-checked="false">' +
        '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" ' +
        'stroke-linecap="round" stroke-linejoin="round">' + ICON[n] + '</svg></button>';
    }).join('');

    sw.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-theme-set]');
      if (b) apply(b.dataset.themeSet);
    });

    // sits inside the right-hand link group, ahead of "How it works"
    if (links) links.insertBefore(sw, links.firstChild); else nav.appendChild(sw);
    apply(document.documentElement.getAttribute('data-theme'));
  }

  // The hamburger was never a menu: each page wired it to a different jump (scroll to the CTA,
  // go to Discord, go to /signup), so on a phone there was no way to reach the nav at all.
  // One shared toggle instead.
  function wireNav() {
    var nav = document.querySelector('header nav');
    var links = nav && nav.querySelector('.nav-links');
    var btn = document.querySelector('.nav-toggle');
    if (!links || !btn) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-expanded', String(links.classList.toggle('open')));
    });
    links.addEventListener('click', function (e) {
      if (!e.target.closest('a')) return;
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function boot() { inject(); wireNav(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
