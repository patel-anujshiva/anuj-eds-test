export default function decorate(block) {
  // No image in the first row -> fall back to solid dark treatment.
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  // The CTA link may not be auto-decorated as a button by EDS
  // (e.g. href="#"). Decorate it so it renders as the pill CTA.
  const cta = block.querySelector(':scope > div:last-child a');
  if (cta && !cta.classList.contains('button')) {
    cta.classList.add('button');
    const p = cta.closest('p');
    if (p && p.textContent.trim() === cta.textContent.trim()) {
      p.classList.add('button-container');
    }
  }
}
