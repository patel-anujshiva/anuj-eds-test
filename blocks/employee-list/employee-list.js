import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

const PAGE_SIZE = 10;
const EMPLOYEE_URL = 'https://main--anuj-eds-test--patel-anujshiva.aem.live/employees.json';

function createEmployeeItem(employee) {
  const item = document.createElement('li');
  item.className = 'employee-list-item';

  const card = document.createElement('article');
  card.className = 'employee-card';

  const name = document.createElement('h3');
  name.className = 'employee-name';
  name.textContent = employee.Name || employee.name || 'Unknown employee';

  const details = document.createElement('div');
  details.className = 'employee-details';

  const department = document.createElement('p');
  department.className = 'employee-department';
  department.textContent = `Department: ${employee.Department || employee.department || 'N/A'}`;

  const city = document.createElement('p');
  city.className = 'employee-city';
  city.textContent = `City: ${employee.City || employee.city || 'N/A'}`;

  details.append(department, city);
  card.append(name, details);
  item.append(card);
  return item;
}

async function loadEmployees() {
  const response = await fetch(EMPLOYEE_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load employees: ${response.status}`);
  }

  const json = await response.json();
  return Array.isArray(json.data) ? json.data : [];
}

export default async function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'employee-list-items';

  const actions = document.createElement('div');
  actions.className = 'employee-list-actions';

  const loadMoreButton = document.createElement('button');
  loadMoreButton.type = 'button';
  loadMoreButton.className = 'employee-list-load-more';
  loadMoreButton.textContent = 'Load more';
  actions.append(loadMoreButton);

  block.replaceChildren(list, actions);

  let employees = [];
  let visibleCount = 0;

  const placeholders = await fetchPlaceholders().catch(() => ({}));
  const buttonLabel = placeholders.loadMore || placeholders.loadMoreButton || 'Load more';
  loadMoreButton.textContent = buttonLabel;

  const renderNextItems = () => {
    const nextItems = employees.slice(visibleCount, visibleCount + PAGE_SIZE);
    nextItems.forEach((employee) => {
      list.appendChild(createEmployeeItem(employee));
    });

    visibleCount += nextItems.length;

    if (visibleCount >= employees.length) {
      loadMoreButton.hidden = true;
      return;
    }

    loadMoreButton.hidden = false;
  };

  try {
    employees = await loadEmployees();
    if (!employees.length) {
      const emptyState = document.createElement('li');
      emptyState.className = 'employee-list-empty';
      emptyState.textContent = 'No employees found.';
      list.append(emptyState);
      loadMoreButton.hidden = true;
      return;
    }

    renderNextItems();

    if (employees.length <= PAGE_SIZE) {
      loadMoreButton.hidden = true;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to load employee list:', error);
    const emptyState = document.createElement('li');
    emptyState.className = 'employee-list-empty';
    emptyState.textContent = 'Unable to load employees.';
    list.append(emptyState);
    loadMoreButton.hidden = true;
  }

  loadMoreButton.addEventListener('click', () => {
    renderNextItems();
  });
}
