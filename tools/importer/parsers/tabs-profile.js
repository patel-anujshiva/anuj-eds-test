/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-profile. Base: tabs.
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-09-08
 *
 * Structure (from library-description): Tabs block, 2 columns. First row = block name.
 * Each subsequent row is one tab: cell 1 = tab label (mandatory), cell 2 = tab content.
 * Source has a `.tabs-content` with `.tab-pane` panels and a `.tab-menu` with buttons.
 * The tab label (person name) comes from the matching menu button; the content comes
 * from the corresponding pane (image + name/role + quote).
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane'));
  const menuButtons = Array.from(element.querySelectorAll('.tab-menu > .tab-menu-link, .tab-menu button'));

  const cells = [];

  panes.forEach((pane, i) => {
    // Tab label: prefer the person's name from the matching menu button
    let label = '';
    const btn = menuButtons[i];
    if (btn) {
      const name = btn.querySelector('strong');
      label = name ? name.textContent.trim() : btn.textContent.trim();
    }
    if (!label) {
      // Fallback to the name inside the pane itself
      const paneName = pane.querySelector('strong');
      label = paneName ? paneName.textContent.trim() : `Tab ${i + 1}`;
    }

    // Tab content: the inner grid/content of the pane
    const content = pane.querySelector(':scope > div') || pane;
    cells.push([label, content]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-profile', cells });
  element.replaceWith(block);
}
