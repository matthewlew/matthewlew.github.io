(function() {
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
      font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    }
    .lew-hub-menu {
      display: flex;
      flex-direction: column;
      gap: 2px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px) scale(0.95);
      transform-origin: bottom right;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      background: #111;
      padding: 6px;
      border-radius: 12px;
      border: 1px solid #2A2A28;
      box-shadow: 0 12px 32px rgba(0,0,0,0.2);
    }
    .lew-hub-widget:hover .lew-hub-menu {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    .lew-hub-menu-title {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6E6E6C;
      padding: 8px 12px 4px;
      margin-bottom: 4px;
    }
    .lew-hub-menu a {
      color: #B5B5B2;
      text-decoration: none;
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 8px;
      white-space: nowrap;
      transition: color 0.15s, background 0.15s;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .lew-hub-menu a:hover {
      color: #fff;
      background: #222;
    }
    .lew-hub-menu a.active {
      color: #fff;
      background: rgba(200, 57, 27, 0.15);
      font-weight: 500;
    }
    .lew-hub-fab {
      width: 52px;
      height: 52px;
      border-radius: 26px;
      background: #111;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Bricolage Grotesque', 'DM Sans', sans-serif;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: -0.02em;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s;
      border: 1px solid #2A2A28;
    }
    .lew-hub-fab .accent { color: #C8391B; }
    .lew-hub-widget:hover .lew-hub-fab {
      transform: scale(0.92);
      background: #0A0A0A;
    }
    
    @media (max-width: 600px) {
      .lew-hub-widget { bottom: 16px; right: 16px; }
      .lew-hub-menu { margin-bottom: -4px; }
    }
  `;
  document.head.appendChild(style);

  const widget = document.createElement('div');
  widget.className = 'lew-hub-widget';

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
    a.innerHTML = \`<span>\${link.label}</span>\`;
    
    let isActive = false;
    if (link.path === '/') {
      isActive = (currentPath === '' || currentPath === '/index.html' || currentPath === '/');
    } else {
      isActive = currentPath.startsWith(link.path);
    }
    
    if (isActive) {
      a.className = 'active';
      a.innerHTML += \`<span style="color: #C8391B; font-size: 10px;">●</span>\`;
    }

    menu.appendChild(a);
  });

  const fab = document.createElement('div');
  fab.className = 'lew-hub-fab';
  fab.innerHTML = 'Lew<span class="accent">.</span>';

  widget.appendChild(menu);
  widget.appendChild(fab);

  // Fallback for touch devices (hover might stick or act as click)
  fab.addEventListener('click', () => {
    const isVisible = menu.style.opacity === '1';
    menu.style.opacity = isVisible ? '' : '1';
    menu.style.pointerEvents = isVisible ? '' : 'auto';
    menu.style.transform = isVisible ? '' : 'translateY(0) scale(1)';
  });

  document.body.appendChild(widget);
})();
