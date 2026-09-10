/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-article. Base: columns.
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-09-08
 *
 * Structure (from library-description): Columns block. First row = block name.
 * Second row defines the columns. Source has two direct-child columns:
 *   - Column 1: article cover image
 *   - Column 2: breadcrumbs + heading (h2) + byline/meta
 */
export default function parse(element, { document }) {
  const columns = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];

  if (columns.length >= 2) {
    cells.push([columns[0], columns[1]]);
  } else {
    // Fallback: reassemble from individual pieces
    const image = element.querySelector('img.cover-image, img');
    const breadcrumbs = element.querySelector('.breadcrumbs');
    const heading = element.querySelector('h1, h2, [class*="heading"]');

    const contentCell = [];
    if (breadcrumbs) contentCell.push(breadcrumbs);
    if (heading) contentCell.push(heading);

    if (!image && contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    cells.push([image || '', contentCell.length ? contentCell : '']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-article', cells });
  element.replaceWith(block);
}
