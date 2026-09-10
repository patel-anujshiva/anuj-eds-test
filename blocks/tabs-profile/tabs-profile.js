// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  const rows = [...block.children];

  const content = document.createElement('div');
  content.className = 'tabs-profile-content';

  const menu = document.createElement('div');
  menu.className = 'tabs-profile-menu';
  menu.setAttribute('role', 'tablist');

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const contentCell = cells[1] || cells[0];

    const paragraphs = [...contentCell.querySelectorAll(':scope > p')];
    const picture = contentCell.querySelector('picture');
    const strong = contentCell.querySelector('strong');

    // Name: prefer the bold name in the content, fall back to the label cell.
    const name = (strong?.textContent || labelCell?.textContent || `Profile ${i + 1}`).trim();
    const id = toClassName(name) || `profile-${i}`;

    // Paragraphs that are neither the image nor the bold name = [role, quote].
    const textParas = paragraphs.filter((p) => !p.querySelector('picture') && !p.querySelector('strong'));
    const roleText = textParas[0]?.textContent.trim() || '';
    const quotePara = textParas[1] || textParas[0];

    // --- Build panel ---
    const panel = document.createElement('div');
    panel.className = 'tabs-profile-panel';
    panel.id = `tabpanel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    if (i > 0) panel.setAttribute('aria-hidden', 'true');

    const imageWrap = document.createElement('div');
    imageWrap.className = 'tabs-profile-image';
    if (picture) imageWrap.append(picture);

    const textWrap = document.createElement('div');
    textWrap.className = 'tabs-profile-text';

    const nameEl = document.createElement('div');
    nameEl.className = 'tabs-profile-name';
    nameEl.textContent = name;

    const roleEl = document.createElement('div');
    roleEl.className = 'tabs-profile-role';
    roleEl.textContent = roleText;

    textWrap.append(nameEl, roleEl);

    if (quotePara) {
      const quoteEl = document.createElement('p');
      quoteEl.className = 'tabs-profile-quote';
      quoteEl.textContent = quotePara.textContent.trim();
      textWrap.append(quoteEl);
    }

    panel.append(imageWrap, textWrap);
    content.append(panel);

    // --- Build tab menu button ---
    const button = document.createElement('button');
    button.className = 'tabs-profile-tab';
    button.id = `tab-${id}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

    const avatar = document.createElement('div');
    avatar.className = 'tabs-profile-avatar';
    const srcImg = picture?.querySelector('img');
    if (srcImg) {
      const avatarImg = document.createElement('img');
      avatarImg.src = srcImg.getAttribute('src');
      avatarImg.alt = name;
      avatarImg.loading = 'lazy';
      avatar.append(avatarImg);
    }

    const labels = document.createElement('div');
    labels.className = 'tabs-profile-tab-labels';
    const tabName = document.createElement('div');
    tabName.className = 'tabs-profile-tab-name';
    tabName.textContent = name;
    const tabRole = document.createElement('div');
    tabRole.className = 'tabs-profile-tab-role';
    tabRole.textContent = roleText;
    labels.append(tabName, tabRole);

    button.append(avatar, labels);

    button.addEventListener('click', () => {
      content.querySelectorAll('[role=tabpanel]').forEach((p) => p.setAttribute('aria-hidden', 'true'));
      menu.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', 'false'));
      panel.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-selected', 'true');
    });

    menu.append(button);

    row.remove();
  });

  block.append(content, menu);
}
