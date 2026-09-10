/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-intro. Base: columns.
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-09-08
 *
 * Structure (from library-description): Columns block. First row = block name.
 * Second row defines the columns. Source has two direct-child columns:
 *   - Column 1: heading (h1) + subheading (p) + button group (CTAs)
 *   - Column 2: a stack of images
 */
export default function parse(element, { document }) {
  // Direct children of the grid-layout are the visual columns
  const columns = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];

  if (columns.length >= 2) {
    // Text column: heading, subheading, buttons
    const textCol = columns[0];
    // Media column: images
    const mediaCol = columns[1];
    cells.push([textCol, mediaCol]);
  } else {
    // Fallback: extract content pieces individually if column wrappers vary
    const heading = element.querySelector('h1, h2, [class*="heading"]');
    const subheading = element.querySelector('p, [class*="subheading"]');
    const buttons = element.querySelector('.button-group');
    const images = Array.from(element.querySelectorAll('img'));

    const textCell = [];
    if (heading) textCell.push(heading);
    if (subheading) textCell.push(subheading);
    if (buttons) textCell.push(buttons);

    if (textCell.length === 0 && images.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    cells.push([textCell, images.length ? images : '']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-intro', cells });
  element.replaceWith(block);
}
