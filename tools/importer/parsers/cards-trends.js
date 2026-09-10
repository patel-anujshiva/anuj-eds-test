/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-trends. Base: cards.
 * Source: https://wknd-trendsetters.site/fashion-trends-young-adults
 * Generated: 2026-09-09
 *
 * Structure (from library-description): Cards block, 2 columns. First row = block name.
 * Each subsequent row is one card: cell 1 = image (mandatory), cell 2 = text content
 * (category tag, heading title, description, and a CTA link to the article).
 *
 * Source: each card is an `<a.trend-card.card-link>` whole-card link wrapping an image
 * (`.trend-card-image img`) and a body (`.trend-card-body` with `.tag`, `h3`, and a
 * description `<p>`).
 *
 * ⚠️ CRITICAL — do NOT anchor extraction on the per-card `<a>`:
 * All 8 cards share the SAME `href="/fashion-trends-young-adults"` and are adjacent
 * siblings. Before this parser runs, helix `PageImporter.preProcess()` calls
 * `DOMUtils.reviewInlineElement(document, 'a')`, which MERGES consecutive sibling
 * `<a>` elements that have the same href into a single `<a>`. That collapses the 8
 * whole-card links into ONE anchor (containing all 8 `.trend-card-body` blocks)
 * before we see the DOM — so `:scope > a` would return only 1 element and produce a
 * single card row. (The parser validator / isolated transform runs do NOT invoke
 * preProcess, which is why they showed all 8 while the real import showed 1.)
 *
 * Fix: anchor on `.trend-card-body` (one per card, unaffected by the anchor merge)
 * and resolve each card's image/tag/heading/description/href relative to that body.
 */
export default function parse(element, { document }) {
  // One `.trend-card-body` per card — survives the pre-parse anchor merge.
  let cardBodies = Array.from(element.querySelectorAll('.trend-card-body'));

  // Fallback for generic/custom markup with no `.trend-card-body`: treat each
  // direct-child anchor (or child element) as a card root.
  let bodyMode = true;
  if (cardBodies.length === 0) {
    cardBodies = Array.from(
      element.querySelectorAll(':scope > a.trend-card, :scope > a.card-link, :scope > a, :scope > div'),
    );
    bodyMode = false;
  }

  const cells = [];

  cardBodies.forEach((body) => {
    // Resolve the card image.
    let img = null;
    if (bodyMode) {
      // Image lives in a sibling `.trend-card-image` (image div precedes the body).
      const prev = body.previousElementSibling;
      const imageWrap = prev && prev.matches && prev.matches('.trend-card-image, [class*="image"]')
        ? prev
        : null;
      if (imageWrap) img = imageWrap.querySelector('img');
    }
    // Fallback / non-body mode: image is anywhere inside the card root.
    if (!img) img = body.querySelector('img');

    const tag = body.querySelector('.tag, [class*="tag"]');
    const heading = body.querySelector('h1, h2, h3, h4, [class*="heading"]');
    const description = body.querySelector('p, [class*="paragraph"], [class*="description"]');

    // The card's own href — from the (possibly merged) enclosing anchor, or the
    // card root itself when it is the anchor.
    const anchor = body.closest('a') || (body.tagName === 'A' ? body : null);
    const href = anchor ? anchor.getAttribute('href') : null;

    const textCell = [];
    if (tag) textCell.push(tag);
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);

    // Preserve the article URL as a CTA. Each row's CTA sits in its own table cell
    // (never an adjacent sibling of another anchor), so it is NOT subject to the
    // anchor-merge collapse.
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-trends', cells });
  element.replaceWith(block);
}
