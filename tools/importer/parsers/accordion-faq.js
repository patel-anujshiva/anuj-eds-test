/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-09-08
 *
 * Structure (from library-description): Accordion block, 2 columns. First row = block name.
 * Each subsequent row is one accordion item: cell 1 = title (question), cell 2 = content (answer).
 * Source: `.faq-list` of `<details.faq-item>` with `<summary.faq-question>` (question text in a
 * span, plus a decorative icon) and a `.faq-answer` body.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > details.faq-item, :scope > details, .faq-item'));

  const cells = [];

  items.forEach((item) => {
    // Title: the question text (span inside summary), ignoring the decorative icon
    const summary = item.querySelector('summary, .faq-question');
    let title = '';
    if (summary) {
      const span = summary.querySelector('span');
      title = span ? span.textContent.trim() : summary.textContent.trim();
    }

    // Content: the answer body
    const answer = item.querySelector('.faq-answer') || item.querySelector(':scope > div');

    if (!title && !answer) return;
    cells.push([title, answer || '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
