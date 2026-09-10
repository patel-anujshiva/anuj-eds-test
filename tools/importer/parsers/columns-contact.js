/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact. Base: columns.
 * Source structure: a `.grid-layout` with two direct child columns —
 *   left column: heading (h2) + intro paragraph ("Let's connect")
 *   right column: `.contact-items` list of label/value pairs (Email / Phone / Address)
 * Output: columns block with one content row of 2 cells (left, right).
 * Generated: 2026-09-09
 */
export default function parse(element, { document }) {
  // The two visual columns are the direct children of the grid-layout element.
  const columns = Array.from(element.querySelectorAll(':scope > div'));

  // Left column: heading + intro paragraph.
  const leftSource = columns[0];
  // Right column: structured contact list (prefer the dedicated container).
  const rightSource = columns[1] || null;

  const leftCell = [];
  if (leftSource) {
    const heading = leftSource.querySelector('h1, h2, h3, [class*="heading"]');
    if (heading) leftCell.push(heading);
    // Intro paragraph(s).
    const paras = Array.from(leftSource.querySelectorAll('p'));
    leftCell.push(...paras);
  }

  const rightCell = [];
  if (rightSource) {
    // Preserve the full contact list structure (labels + values as links/paragraphs).
    const contactItems = rightSource.querySelector('.contact-items') || rightSource;
    rightCell.push(contactItems);
  }

  // Empty-block guard: nothing meaningful to emit.
  if (!leftCell.length && !rightCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single content row, two columns. Pad short cells to keep the row even.
  cells.push([
    leftCell.length ? leftCell : '',
    rightCell.length ? rightCell : '',
  ]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
