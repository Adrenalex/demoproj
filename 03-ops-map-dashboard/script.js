const noteForm = document.querySelector('#noteForm');
const notesTable = document.querySelector('#notesTable');
const quickButtons = document.querySelectorAll('.button-grid button');
const syncButton = document.querySelector('#syncButton');
const searchInput = document.querySelector('#searchInput');
const filterButtons = document.querySelectorAll('.filter-row button');
const pins = document.querySelectorAll('.pin');

function addRow(type, location, note, status = 'Review') {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${type}</td>
    <td>${location}</td>
    <td>${note || 'Added from field panel'}</td>
    <td><span class="tag bad">${status}</span></td>
  `;
  notesTable.prepend(row);
}

noteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(noteForm).entries());
  addRow(data.type, data.location, data.note);
  noteForm.reset();
});

quickButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.type;
    addRow(type, 'Demo GPS point', `${type} captured from quick-add button`);
    button.textContent = 'Saved ✓';
    setTimeout(() => { button.textContent = type; }, 900);
  });
});

syncButton.addEventListener('click', () => {
  syncButton.textContent = 'Synced ✓';
  document.querySelector('#reviewCount').textContent = '4';
  setTimeout(() => { syncButton.textContent = 'Sync demo data'; }, 1200);
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  notesTable.querySelectorAll('tr').forEach((row) => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    pins.forEach((pin) => {
      const show = filter === 'all' || pin.classList.contains(filter);
      pin.style.opacity = show ? '1' : '.18';
      pin.style.transform = show ? 'rotate(-45deg) scale(1)' : 'rotate(-45deg) scale(.86)';
    });
  });
});
