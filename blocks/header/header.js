// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment as plain HTML.
 * Metadata-independent dual-fetch: /content first (localhost / aem up),
 * then site root (DA/EDS production). Do NOT derive from getMetadata('nav').
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

/** Close every open section/dropdown. */
function closeAllSections(navSections) {
  navSections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((d) => {
    d.setAttribute('aria-expanded', 'false');
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (navSections) closeAllSections(navSections);
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
}

export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Assign brand / sections / tools to the three top-level fragment sections.
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: keep the logo + label link.
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) brandLink.classList.add('nav-brand-link');
  }

  // Sections: flag items that contain a nested <ul> as dropdowns/megamenus.
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
      const submenu = navSection.querySelector(':scope > ul');
      if (submenu) {
        navSection.classList.add('nav-drop');
        // A megamenu is a dropdown whose submenu has grouped columns (nested <ul>).
        if (submenu.querySelector(':scope > li > ul')) {
          navSection.classList.add('nav-megamenu');
          // Promote each column's group label <p> to a semantic <h3> heading.
          submenu.querySelectorAll(':scope > li > p').forEach((groupP) => {
            const h = document.createElement('h3');
            h.className = 'nav-megamenu-heading';
            h.textContent = groupP.textContent.trim();
            groupP.replaceWith(h);
          });
        }
        navSection.setAttribute('aria-expanded', 'false');
        // Promote the label <p> to a focusable, semantic trigger button so the
        // dropdown is keyboard-accessible and discoverable as a real control.
        const labelP = navSection.querySelector(':scope > p');
        let label = labelP;
        if (labelP) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'nav-drop-toggle';
          btn.setAttribute('aria-haspopup', 'true');
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = labelP.textContent.trim();
          labelP.replaceWith(btn);
          label = btn;
        }
        if (label) {
          label.addEventListener('click', () => {
            if (!isDesktop.matches) {
              const open = navSection.getAttribute('aria-expanded') === 'true';
              closeAllSections(navSections);
              navSection.setAttribute('aria-expanded', open ? 'false' : 'true');
              label.setAttribute('aria-expanded', open ? 'false' : 'true');
            }
          });
        }
        navSection.addEventListener('mouseenter', () => {
          if (isDesktop.matches) {
            navSection.setAttribute('aria-expanded', 'true');
            if (label) label.setAttribute('aria-expanded', 'true');
          }
        });
        navSection.addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            navSection.setAttribute('aria-expanded', 'false');
            if (label) label.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  }

  // Tools: style the Subscribe link as a CTA button.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll('a').forEach((a) => a.classList.add('nav-cta'));
  }

  // Hamburger for mobile.
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Prevent mobile nav state leaking across the breakpoint on resize.
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, navSections, isDesktop.matches);
    if (navSections) closeAllSections(navSections);
  });

  // Close open sections on Escape.
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && navSections) closeAllSections(navSections);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
