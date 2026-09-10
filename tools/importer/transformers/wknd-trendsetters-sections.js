/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters section breaks + section metadata.
 * Uses payload.template.sections (7 sections for about-us).
 * Section selectors come from page-templates.json (DOM-verified in page analysis).
 *
 * Breaks (<hr>) expected: sections.length - 1 = 6.
 * Section Metadata blocks expected: 2 (rc3 and rc5 have style "secondary").
 *
 * Both hooks are used: breaks are inserted in beforeTransform while every
 * section element still exists (before parsers replace them); Section Metadata
 * is anchored in afterTransform to the marker <hr> (or original element).
 * See references/generate-import-transformer.md "Why both hooks".
 *
 * The cleanup transformer only removes specific wrapper selectors, never bare
 * <hr>, so the markers inserted here survive cleanup.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break needed
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
