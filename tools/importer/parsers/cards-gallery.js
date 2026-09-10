/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-gallery. Base: cards.
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-09-08
 *
 * Structure (from library-description): Cards block, 2 columns. First row = block name.
 * Each subsequent row is one card: cell 1 = image (mandatory), cell 2 = text (optional).
 * This is a photo gallery — each card is image-only, so the text cell is padded empty
 * to keep every row at the required 2-column width.
 */
export default function parse(element, { document }) {
  // Each direct child wrapper is one card in the gallery
  const cardEls = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];

  cardEls.forEach((card) => {
    const img = card.querySelector('img');
    if (!img) return;
    // Image in cell 1, empty text cell 2 (gallery cards have no text)
    cells.push([img, '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gallery', cells });
  element.replaceWith(block);
}
