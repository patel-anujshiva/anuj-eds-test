import { createOptimizedPicture } from '../../scripts/aem.js';

// Matches a trailing date portion like "May 12", "Sept. 3", "December 5, 2024".
const DATE_RE = /\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t)?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\.?\s+\d{1,2}(,?\s*\d{4})?\b/i;

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-articles-card-image';
      else div.className = 'cards-articles-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Enhance each card: build category pill + date meta row, make whole card clickable.
  ul.querySelectorAll('li').forEach((li) => {
    const body = li.querySelector('.cards-articles-card-body');
    if (!body) return;
    const paras = [...body.querySelectorAll('p')];
    const linkP = paras.find((p) => p.querySelector('a'));
    const href = linkP ? linkP.querySelector('a').getAttribute('href') : null;
    const metaP = paras.find((p) => !p.querySelector('a'));

    if (metaP) {
      const text = metaP.textContent.trim();
      const meta = document.createElement('div');
      meta.className = 'cards-articles-card-meta';
      const dateMatch = text.match(DATE_RE);
      if (dateMatch) {
        const category = text.slice(0, dateMatch.index).trim();
        if (category) {
          const cat = document.createElement('span');
          cat.className = 'cards-articles-tag';
          cat.textContent = category;
          meta.append(cat);
        }
        const date = document.createElement('span');
        date.className = 'cards-articles-date';
        date.textContent = dateMatch[0].trim();
        meta.append(date);
      } else if (text) {
        const cat = document.createElement('span');
        cat.className = 'cards-articles-tag';
        cat.textContent = text;
        meta.append(cat);
      }
      metaP.replaceWith(meta);
    }

    // Remove the redundant title link paragraph (whole card becomes the link).
    if (linkP) linkP.remove();

    // Wrap the card contents in a single anchor so the whole card is clickable.
    if (href) {
      const anchor = document.createElement('a');
      anchor.className = 'cards-articles-card-link';
      anchor.href = href;
      while (li.firstChild) anchor.append(li.firstChild);
      li.append(anchor);
    }
  });

  block.textContent = '';
  block.append(ul);
}
