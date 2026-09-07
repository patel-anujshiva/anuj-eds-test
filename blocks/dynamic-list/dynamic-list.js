const DEFAULT_INDEX_URL = '/query-index.json';
const DEFAULT_PAGE_SIZE = 100;

function readOptions(block) {
  const options = {};

  [...block.children].forEach((row) => {
    const cells = [...row.children]
      .map((cell) => cell.textContent.trim())
      .filter(Boolean);

    if (cells.length >= 2) {
      const key = cells
        .shift()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      options[key] = cells.join(' ').trim();
    }
  });

  return options;
}

function getField(item, fieldName) {
  if (!item || !fieldName) return undefined;

  if (item[fieldName] !== undefined) {
    return item[fieldName];
  }

  const matchingKey = Object.keys(item).find(
    (key) => key.toLowerCase() === fieldName.toLowerCase(),
  );

  return matchingKey ? item[matchingKey] : undefined;
}

function getSafeUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(String(value), window.location.origin);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    return url.href;
  } catch (error) {
    return null;
  }
}

function formatDate(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  let date;

  // parseTimestamp() values are seconds; JavaScript Date values are milliseconds.
  if (/^\d+(\.\d+)?$/.test(String(value))) {
    const number = Number(value);
    date = new Date(number < 100000000000 ? number * 1000 : number);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return {
      label: String(value),
      datetime: null,
    };
  }

  return {
    label: new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
    }).format(date),
    datetime: date.toISOString(),
  };
}

function compareValues(left, right, direction) {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  let result;

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    result = leftNumber - rightNumber;
  } else {
    result = String(left ?? '').localeCompare(
      String(right ?? ''),
      undefined,
      {
        numeric: true,
        sensitivity: 'base',
      },
    );
  }

  return direction === 'asc' ? result : -result;
}

function getPageUrl(indexUrl, offset, limit) {
  const url = new URL(indexUrl, window.location.origin);

  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));

  return url.href;
}

function renderItem(item, options) {
  const titleField = options['title-field'] || 'title';
  const descriptionField = options['description-field'] || 'description';
  const imageField = options['image-field'] || 'image';
  const dateField = options['date-field'] || 'lastModified';
  const linkField = options['link-field'] || 'path';

  const title = String(
    getField(item, titleField)
      || getField(item, 'path')
      || 'Untitled',
  ).trim();

  const description = getField(item, descriptionField);
  const imageUrl = getSafeUrl(getField(item, imageField));
  const linkUrl = getSafeUrl(
    getField(item, linkField) || getField(item, 'path'),
  );
  const date = formatDate(getField(item, dateField));

  const listItem = document.createElement('li');
  listItem.className = 'dynamic-list__item';

  const article = document.createElement('article');
  article.className = 'dynamic-list__card';

  if (imageUrl) {
    const image = document.createElement('img');

    image.className = 'dynamic-list__image';
    image.src = imageUrl;
    image.alt = title;
    image.loading = 'lazy';
    image.decoding = 'async';

    article.append(image);
  }

  const content = document.createElement('div');
  content.className = 'dynamic-list__content';

  if (date) {
    const time = document.createElement('time');

    time.className = 'dynamic-list__date';
    time.textContent = date.label;

    if (date.datetime) {
      time.dateTime = date.datetime;
    }

    content.append(time);
  }

  const heading = document.createElement('h3');
  heading.className = 'dynamic-list__title';

  if (linkUrl) {
    const link = document.createElement('a');

    link.href = linkUrl;
    link.textContent = title;
    heading.append(link);
  } else {
    heading.textContent = title;
  }

  content.append(heading);

  if (description) {
    const descriptionElement = document.createElement('p');

    descriptionElement.className = 'dynamic-list__description';
    descriptionElement.textContent = String(description);
    content.append(descriptionElement);
  }

  article.append(content);
  listItem.append(article);

  return listItem;
}

export default async function decorate(block) {
  const options = readOptions(block);

  const indexUrl = (
    options['index-url']
    || block.dataset.indexUrl
    || block.querySelector('a[href*=".json"]')?.getAttribute('href')
    || DEFAULT_INDEX_URL
  );

  const pageSize = Math.max(
    1,
    Number.parseInt(options['page-size'], 10) || DEFAULT_PAGE_SIZE,
  );

  const filterField = options['filter-field'];
  const filterValue = options['filter-value']?.toLowerCase();
  const sortField = options['sort-field'];
  const sortDirection = options['sort-direction'] === 'asc'
    ? 'asc'
    : 'desc';

  const state = {
    items: [],
    total: 0,
    offset: 0,
    loading: false,
    error: null,
  };

  const status = document.createElement('p');
  status.className = 'dynamic-list__status';
  status.setAttribute('aria-live', 'polite');

  const list = document.createElement('ul');
  list.className = 'dynamic-list__items';

  const loadMore = document.createElement('button');
  loadMore.className = 'dynamic-list__load-more';
  loadMore.type = 'button';
  loadMore.textContent = 'Load more';

  block.replaceChildren(status, list, loadMore);

  function getVisibleItems() {
    let items = [...state.items];

    if (filterField && filterValue) {
      items = items.filter((item) => {
        const value = getField(item, filterField);

        return String(value ?? '')
          .toLowerCase()
          .includes(filterValue);
      });
    }

    if (sortField) {
      items.sort((left, right) => compareValues(
        getField(left, sortField),
        getField(right, sortField),
        sortDirection,
      ));
    }

    return items;
  }

  function render() {
    const visibleItems = getVisibleItems();

    list.replaceChildren(
      ...visibleItems.map((item) => renderItem(item, options)),
    );

    list.hidden = visibleItems.length === 0;

    if (state.loading) {
      status.textContent = 'Loading…';
    } else if (state.error) {
      status.textContent = state.error;
    } else if (visibleItems.length === 0 && state.items.length > 0) {
      status.textContent = 'No matching items found.';
    } else if (visibleItems.length === 0) {
      status.textContent = 'No items found.';
    } else {
      status.textContent = '';
    }

    loadMore.hidden = (
      state.loading
      || Boolean(state.error)
      || state.items.length >= state.total
    );

    loadMore.disabled = state.loading;
  }

  async function loadPage() {
    if (state.loading) return;

    state.loading = true;
    state.error = null;
    render();

    try {
      const response = await fetch(
        getPageUrl(indexUrl, state.offset, pageSize),
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Index request failed with HTTP ${response.status}`);
      }

      const payload = await response.json();

      if (!Array.isArray(payload.data)) {
        throw new Error('The index response does not contain a data array.');
      }

      const rows = payload.data;

      state.items.push(...rows);
      state.offset += rows.length;
      state.total = Number(payload.total) || state.items.length;

      // Prevent a Load More loop if the endpoint returns no additional rows.
      if (rows.length === 0) {
        state.total = state.items.length;
      }
    } catch (error) {
      state.error = 'Unable to load the list right now.';
      // Keep the technical error available to developers without exposing it
      // to visitors.
      console.error('Dynamic list error:', error);
    } finally {
      state.loading = false;
      render();
    }
  }

  loadMore.addEventListener('click', loadPage);

  render();
  await loadPage();
}