/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html.
 *
 * Notes on non-authorable chrome (from captured DOM):
 * - a.skip-link           : skip-to-content link, sibling of .navbar (top of body)
 * - div.navbar            : global header / mega-menu nav, sibling of <main>
 * - footer.footer         : global site footer, sibling of <main>
 * - div.breadcrumbs       : breadcrumb trail INSIDE the article section (rc2,
 *                           columns-article block). Because it lives inside a
 *                           block that a parser extracts, it must be removed in
 *                           beforeTransform so it is gone before block parsing.
 *
 * ⚠️ Do NOT remove <header> generically: the hero intro is
 * <header class="section secondary-section"> inside <main> and is an
 * authorable block (columns-intro).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Breadcrumbs live inside the article block (rc2) — remove before parsing
    // so they are not captured as authorable content.
    // Found in cleaned.html: <div class="breadcrumbs"> ... </div>
    WebImporter.DOMUtils.remove(element, ['.breadcrumbs']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome — not authorable page content.
    // Found in cleaned.html: <a class="skip-link">, <div class="navbar">,
    // <footer class="footer inverse-footer">.
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      'footer.footer',
    ]);
  }
}
