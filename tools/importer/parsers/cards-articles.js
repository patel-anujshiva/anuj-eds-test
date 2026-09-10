/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-articles. Base: cards.
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-09-08
 *
 * Structure (from library-description): Cards block, 2 columns. First row = block name.
 * Each subsequent row is one card: cell 1 = image (mandatory), cell 2 = text content
 * (meta tag/date, heading title, and a CTA link to the article).
 * Source: each card is an `<a.article-card>` wrapping an image + a body (meta + h3).
 */
export default function parse(element, { document }) {
  const cardLinks = Array.from(element.querySelectorAll(':scope > a.article-card, :scope > a.card-link, :scope > a'));

  const cells = [];

  cardLinks.forEach((card) => {
    const img = card.querySelector('img');
    const meta = card.querySelector('.article-card-meta');
    const heading = card.querySelector('h1, h2, h3, h4, [class*="heading"]');
    const href = card.getAttribute('href');

    const textCell = [];
    if (meta) textCell.push(meta);
    if (heading) textCell.push(heading);

    // Preserve the card link as a CTA
    if (href) {
      const cta = document.createElement('a');
      cta.href = href;
      cta.textContent = heading ? heading.textContent.trim() : 'Read more';
      textCell.push(cta);
    }

    if (!img && textCell.length === 0) return;
    cells.push([img || '', textCell.length ? textCell : '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-articles', cells });
  element.replaceWith(block);
}
