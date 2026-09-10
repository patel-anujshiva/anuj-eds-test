/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay. Base: hero.
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-09-08
 *
 * Structure (from library-description): Hero block, 1 column, 3 rows.
 *   Row 1: block name.
 *   Row 2 (single cell): background image (optional).
 *   Row 3 (single cell): title (heading) + subheading + CTA (optional).
 * Source: a relative-positioned card with an overlay cover-image and a `.card-body`
 * holding the heading, subheading paragraph, and a button group.
 */
export default function parse(element, { document }) {
  const bgImage = element.querySelector('img.cover-image, img[class*="overlay"], img');
  const heading = element.querySelector('h1, h2, [class*="h1-heading"], [class*="heading"]');
  const subheading = element.querySelector('p, .subheading, [class*="subheading"]');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  if (!heading && !subheading && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (only if present)
  if (bgImage) cells.push([bgImage]);

  // Row 3: content — all elements in a single cell (1-column block)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay', cells });
  element.replaceWith(block);
}
