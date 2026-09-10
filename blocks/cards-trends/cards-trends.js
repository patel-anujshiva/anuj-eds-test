import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-trends-card-image';
      else div.className = 'cards-trends-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Enhance each card: turn a leading category paragraph into a tag pill,
  // keep the title + description, and make the whole card clickable.
  ul.querySelectorAll('li').forEach((li) => {
    const body = li.querySelector('.cards-trends-card-body');
    if (!body) return;

    const paras = [...body.querySelectorAll('p')];
    // The link paragraph (if any) provides the destination for the whole card.
    const linkP = paras.find((p) => p.querySelector('a'));
    const href = linkP ? linkP.querySelector('a').getAttribute('href') : null;

    // First non-link paragraph before the heading is treated as the category tag.
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const isBeforeHeading = (p) => {
      if (!heading) return true;
      const pos = p.compareDocumentPosition(heading);
      // eslint-disable-next-line no-bitwise
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    };
    const tagP = paras.find((p) => p !== linkP && isBeforeHeading(p));
    if (tagP && tagP.textContent.trim()) {
      const tag = document.createElement('span');
      tag.className = 'cards-trends-tag';
      tag.textContent = tagP.textContent.trim();
      tagP.replaceWith(tag);
    }

    // Remove a redundant standalone title-link paragraph (whole card becomes the link).
    if (linkP) linkP.remove();

    // Wrap the card contents in a single anchor so the whole card is clickable.
    if (href) {
      const anchor = document.createElement('a');
      anchor.className = 'cards-trends-card-link';
      anchor.href = href;
      while (li.firstChild) anchor.append(li.firstChild);
      li.append(anchor);
    }
  });

  block.textContent = '';
  block.append(ul);
}
