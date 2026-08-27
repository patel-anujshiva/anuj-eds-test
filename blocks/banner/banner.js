import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  const image = rows[0]?.querySelector('picture');
  const titleText = rows[1]?.textContent.trim();
  const colorText = rows[2]?.textContent.trim();

  const source = image?.querySelector('img');
  const bannerImage = source
    ? createOptimizedPicture(source.src, source.alt, false, [{ width: '750' }])
    : document.createElement('div');

  const title = document.createElement('h2');
  title.textContent = titleText || '';

  const background = document.createElement('div');
  background.className = 'banner-content';
  background.append(title);

  if (colorText) block.style.backgroundColor = colorText;
  block.replaceChildren(bannerImage || document.createElement('div'), background);
}
