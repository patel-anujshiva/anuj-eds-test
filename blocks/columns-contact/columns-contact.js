export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-contact-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // The contact column is the text-only cell that holds the label/value groups.
      // Heuristic: a cell with no picture and more than one heading is the contact list.
      const hasImage = col.querySelector('picture, img');
      const headings = col.querySelectorAll('h2, h3, h4, h5, h6');
      if (!hasImage && headings.length > 1) {
        col.classList.add('columns-contact-list');
        // Group each label heading with the sibling value(s) that follow it.
        [...headings].forEach((heading) => {
          const group = document.createElement('div');
          group.className = 'columns-contact-item';
          heading.replaceWith(group);
          group.append(heading);
          let next = group.nextElementSibling;
          while (next && !/^H[2-6]$/.test(next.tagName)) {
            const move = next;
            next = next.nextElementSibling;
            group.append(move);
          }
        });
      } else {
        col.classList.add('columns-contact-intro');
      }
    });
  });
}
