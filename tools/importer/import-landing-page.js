/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsIntroParser from './parsers/columns-intro.js';
import columnsArticleParser from './parsers/columns-article.js';
import cardsGalleryParser from './parsers/cards-gallery.js';
import tabsProfileParser from './parsers/tabs-profile.js';
import cardsArticlesParser from './parsers/cards-articles.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import heroOverlayParser from './parsers/hero-overlay.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "landing-page",
  "description": "Marketing landing/home layout: hero intro followed by stacked feature and content sections",
  "urls": [
    "https://wknd-trendsetters.site/",
    "https://wknd-trendsetters.site/fashion-trends-of-the-season",
    "https://wknd-trendsetters.site/fashion-trends-young-adults"
  ],
  "blocks": [
    {
      "name": "columns-intro",
      "instances": [
        "#main-content > header.section.secondary-section > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl"
      ]
    },
    {
      "name": "columns-article",
      "instances": [
        "#main-content > section.section:nth-of-type(1) > div.container > div.grid-layout.tablet-1-column.grid-gap-lg"
      ]
    },
    {
      "name": "cards-gallery",
      "instances": [
        "#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm",
        "#main-content > section.section > div.container > div.grid-layout.desktop-3-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm",
        "#main-content > section.section.secondary-section > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm"
      ]
    },
    {
      "name": "tabs-profile",
      "instances": [
        "#main-content > section.section:nth-of-type(3) > div.container > div.tabs-wrapper"
      ]
    },
    {
      "name": "cards-articles",
      "instances": [
        "#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-md",
        "#trends > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-md"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "#main-content > section.section:nth-of-type(5) > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl > div.faq-list"
      ]
    },
    {
      "name": "hero-overlay",
      "instances": [
        "#main-content > section.section.inverse-section > div.container > div.grid-layout.desktop-1-column"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc1",
      "name": "Hero intro",
      "selector": [
        "#main-content > header.section.secondary-section"
      ],
      "style": null,
      "blocks": [
        "columns-intro"
      ],
      "defaultContent": []
    },
    {
      "id": "rc2",
      "name": "Article header",
      "selector": [
        "#main-content > section.section:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [
        "columns-article"
      ],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "Photo gallery",
      "selector": [
        "#main-content > section.section.secondary-section:nth-of-type(2)"
      ],
      "style": "secondary",
      "blocks": [
        "cards-gallery"
      ],
      "defaultContent": [
        "#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.utility-text-align-center.utility-margin-bottom-8rem"
      ]
    },
    {
      "id": "rc4",
      "name": "Tabbed profiles",
      "selector": [
        "#main-content > section.section:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "tabs-profile"
      ],
      "defaultContent": []
    },
    {
      "id": "rc5",
      "name": "Latest articles",
      "selector": [
        "#main-content > section.section.secondary-section:nth-of-type(4)"
      ],
      "style": "secondary",
      "blocks": [
        "cards-articles"
      ],
      "defaultContent": [
        "#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.utility-text-align-center"
      ]
    },
    {
      "id": "rc6",
      "name": "FAQ",
      "selector": [
        "#main-content > section.section:nth-of-type(5)"
      ],
      "style": null,
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": [
        "#main-content > section.section:nth-of-type(5) > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl > div:nth-of-type(1)"
      ]
    },
    {
      "id": "rc7",
      "name": "Closing CTA banner",
      "selector": [
        "#main-content > section.section.inverse-section"
      ],
      "style": null,
      "blocks": [
        "hero-overlay"
      ],
      "defaultContent": []
    }
  ]
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'columns-intro': columnsIntroParser,
  'columns-article': columnsArticleParser,
  'cards-gallery': cardsGalleryParser,
  'tabs-profile': tabsProfileParser,
  'cards-articles': cardsArticlesParser,
  'accordion-faq': accordionFaqParser,
  'hero-overlay': heroOverlayParser,
};

// TRANSFORMER REGISTRY - cleanup first, then sections (sections run in afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
