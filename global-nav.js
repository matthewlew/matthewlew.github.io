(function() {
  /* The hub widget is a dark island on every page, so it declares
     .mode-dark.emph-plain on itself and paints from One Token.
     It previously hardcoded DM Sans, Bricolage Grotesque, Space Mono, #111 and
     a vermilion #C8391B — none of which the system still contains. */
  const style = document.createElement('style');
  style.innerHTML = `
    .lew-hub-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      font-family: var(--th-ui);
    }
    .lew-hub-menu {
      display: flex;
      flex-direction: column;
      gap: 2px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px) scale(0.95);
      transform-origin: bottom right;
      transition: all var(--dur-slow, 320ms) var(--ease-decelerate, cubic-bezier(.22,1,.36,1));
      background: var(--background);
      padding: 6px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-lg);
    }
    .lew-hub-widget:hover .lew-hub-menu {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    .lew-hub-menu-title {
      font-family: var(--th-mono);
      font-size: var(--text-caption);
      text-transform: uppercase;
      letter-spacing: var(--tracking-widest);
      color: var(--text-subdued);
      padding: 8px 12px 4px;
      margin-bottom: 4px;
    }
    .lew-hub-menu a {
      color: var(--text-subdued);
      text-decoration: none;
      font-size: var(--size-3);
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      transition: color var(--dur-fast, 120ms), background var(--dur-fast, 120ms);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .lew-hub-menu a:hover {
      color: var(--text);
      background: var(--bg-hover);
    }
    .lew-hub-menu a.active {
      color: var(--text);
      background: var(--bg-pressed);
      font-weight: var(--weight-medium);
    }
    .lew-hub-menu a:focus-visible { outline: 2px solid var(--text-accent); outline-offset: -2px; }
    .lew-hub-fab {
      width: 52px;
      height: 52px;
      border-radius: var(--pill);
      background: var(--background);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--th-display);
      font-weight: var(--weight-medium);
      font-size: var(--size-4);
      letter-spacing: var(--tracking-tight);
      cursor: pointer;
      box-shadow: var(--shadow-base);
      transition: transform var(--dur-slow, 320ms) var(--ease-decelerate, cubic-bezier(.22,1,.36,1));
      border: 1px solid var(--border);
    }
    /* The accent is the theme's accent — green — not a colour of the widget's own. */
    .lew-hub-fab .accent { color: var(--text-accent); }
    .lew-hub-widget:hover .lew-hub-fab { transform: scale(0.92); }

    @media (max-width: 600px) {
      .lew-hub-widget { bottom: 16px; right: 16px; }
      .lew-hub-menu { margin-bottom: -4px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .lew-hub-menu, .lew-hub-fab { transition: none; }
    }

    /* ---- Docked mode ----
       A page that owns a nav of its own (the design-system showcase has a
       sidebar AND a bottom bar on mobile) can host these links instead of
       having a fixed button land on top of its own controls. Same links, same
       markup, no floating layer: the widget stops being positioned and the
       menu stops being a hover popover. */
    .lew-hub-widget--docked {
      position: static;
      display: block;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .lew-hub-widget--docked .lew-hub-fab { display: none; }
    /* Match the host nav's own group labels rather than the island's title. */
    .lew-hub-widget--docked .lew-hub-menu-title { font-size: 10px; letter-spacing: 0.1em; padding: 6px 12px; }
    .lew-hub-widget--docked .lew-hub-menu a { padding: 8px 12px; font-size: 13px; }
    .lew-hub-widget--docked .lew-hub-menu {
      opacity: 1;
      pointer-events: auto;
      transform: none;
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
    }
  `;
  document.head.appendChild(style);

  // A docked slot inherits the host page's theme and mode; the floating
  // island does not, so only the floating one declares its own.
  const slot = document.getElementById('lew-hub-slot');
  const widget = document.createElement('div');
  widget.className = slot
    ? 'lew-hub-widget lew-hub-widget--docked'
    : 'lew-hub-widget mode-dark emph-plain';

  const menu = document.createElement('div');
  menu.className = 'lew-hub-menu';
  
  const title = document.createElement('div');
  title.className = 'lew-hub-menu-title';
  title.innerText = 'Projects';
  menu.appendChild(title);

  const currentPath = window.location.pathname;
  
  const links = [
    { label: 'Home', path: '/' },
    { label: 'Design System', path: '/design-system/' },
    { label: 'One Token', path: '/one-token/' },
    { label: 'Palette', path: '/palette/' }
  ];

  links.forEach(link => {
    const a = document.createElement('a');
    a.href = link.path;
    a.innerHTML = `<span>${link.label}</span>`;
    
    let isActive = false;
    if (link.path === '/') {
      isActive = (currentPath === '' || currentPath === '/index.html' || currentPath === '/');
    } else {
      isActive = currentPath.startsWith(link.path);
    }
    
    if (isActive) {
      a.className = 'active';
      a.innerHTML += `<span aria-hidden="true" style="color: var(--text-accent); font-size: 10px;">●</span>`;
    }

    menu.appendChild(a);
  });

  const fab = document.createElement('div');
  fab.className = 'lew-hub-fab';
  fab.innerHTML = 'Lew<span class="accent">.</span>';

  widget.appendChild(menu);
  widget.appendChild(fab);

  // Fallback for touch devices (hover might stick or act as click). Docked mode
  // has no hover state to rescue and no fab to press.
  if (!slot) fab.addEventListener('click', () => {
    const isVisible = menu.style.opacity === '1';
    menu.style.opacity = isVisible ? '' : '1';
    menu.style.pointerEvents = isVisible ? '' : 'auto';
    menu.style.transform = isVisible ? '' : 'translateY(0) scale(1)';
  });

  (slot || document.body).appendChild(widget);
})();
