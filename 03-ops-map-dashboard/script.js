// ── config ──────────────────────────────────────────────────────────────────
const CENTER = [44.8241, -93.2074]; // Saint Paul area
const ZOOM   = 14;

// ── type → css class + label ─────────────────────────────────────────────────
const TYPE_MAP = {
  'Stop sign':     { css: 'stop',         label: 'S' },
  'Traffic light': { css: 'signal',       label: 'L' },
  'Construction':  { css: 'construction', label: 'C' },
  'School zone':   { css: 'school',       label: 'Z' },
  'Delivery note': { css: 'delivery',     label: 'D' },
  'Bad address':   { css: 'bad-addr',     label: '!' },
};

// ── seed data ─────────────────────────────────────────────────────────────────
const SEED = [
  { type: 'Stop sign',     lat: 44.8241, lng: -93.2074, note: 'Facing north, possible 4-way',     status: 'good' },
  { type: 'Traffic light', lat: 44.8192, lng: -93.2110, note: 'Long red during morning route',    status: 'warn' },
  { type: 'Construction',  lat: 44.8301, lng: -93.2190, note: 'Lane closed near school entrance', status: 'bad'  },
  { type: 'Stop sign',     lat: 44.8265, lng: -93.2030, note: 'Hidden behind overgrown bush',     status: 'bad'  },
  { type: 'Traffic light', lat: 44.8175, lng: -93.2155, note: 'No right-on-red posted',           status: 'warn' },
  { type: 'School zone',   lat: 44.8310, lng: -93.2060, note: '20mph 7-4 school days',            status: 'good' },
  { type: 'Delivery note', lat: 44.8228, lng: -93.2145, note: 'Gate code 1234, ring bell',        status: 'good' },
  { type: 'Bad address',   lat: 44.8255, lng: -93.2095, note: 'Building entrance on side street', status: 'bad'  },
];

// ── state ─────────────────────────────────────────────────────────────────────
let pendingType = null;   // type string when quick-add button is active
let markers     = [];     // { leafletMarker, type, lat, lng, note, status }
let activeFilter = 'all';

// ── init map ──────────────────────────────────────────────────────────────────
const map = L.map('map', { zoomControl: true }).setView(CENTER, ZOOM);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19,
}).addTo(map);

// ── custom icon factory ───────────────────────────────────────────────────────
function makeIcon(type) {
  const { css, label } = TYPE_MAP[type] || { css: 'stop', label: '?' };
  return L.divIcon({
    className: '',
    html: `<div class="map-pin ${css}"><span>${label}</span></div>`,
    iconSize:   [34, 34],
    iconAnchor: [17, 34],
    popupAnchor:[0, -36],
  });
}

// ── drop a marker ─────────────────────────────────────────────────────────────
function dropMarker(lat, lng, type, note, status) {
  const m = L.marker([lat, lng], { icon: makeIcon(type) }).addTo(map);
  const coordStr = lat.toFixed(4) + ', ' + lng.toFixed(4);
  m.bindPopup(
    `<strong>${type}</strong>${note ? note + '<br>' : ''}<small>${coordStr}</small>`
  );
  const entry = { leafletMarker: m, type, lat, lng, note, status };
  markers.push(entry);
  applyFilter(activeFilter);
  updateCounts();
  return coordStr;
}

// ── seed the map ──────────────────────────────────────────────────────────────
SEED.forEach(s => dropMarker(s.lat, s.lng, s.type, s.note, s.status));

// ── filter ────────────────────────────────────────────────────────────────────
const FILTER_CSS = {
  stop:   ['Stop sign'],
  signal: ['Traffic light'],
  review: ['Bad address', 'Construction'],
};

function applyFilter(filter) {
  activeFilter = filter;

  // Sync map pins
  markers.forEach(({ leafletMarker, type }) => {
    const show = filter === 'all' || (FILTER_CSS[filter] || []).includes(type);
    if (show) {
      if (!map.hasLayer(leafletMarker)) map.addLayer(leafletMarker);
    } else {
      if (map.hasLayer(leafletMarker)) map.removeLayer(leafletMarker);
    }
  });

  // Sync table rows — match on first cell (type column)
  document.querySelectorAll('#notesTable tr').forEach(tr => {
    const typeCell = tr.querySelector('td:first-child');
    if (!typeCell) return;
    const rowType = typeCell.textContent.trim();
    const show = filter === 'all' || (FILTER_CSS[filter] || []).includes(rowType);
    tr.style.display = show ? '' : 'none';
  });
}

// ── counts ────────────────────────────────────────────────────────────────────
function updateCounts() {
  const stops   = markers.filter(m => m.type === 'Stop sign').length;
  const signals = markers.filter(m => m.type === 'Traffic light').length;
  const constr  = markers.filter(m => m.type === 'Construction').length;
  const review  = markers.filter(m => m.status === 'bad').length;
  document.getElementById('stopCount').textContent        = stops;
  document.getElementById('signalCount').textContent      = signals;
  document.getElementById('constructionCount').textContent= constr;
  document.getElementById('reviewCount').textContent      = review;
}

// ── quick-add buttons ─────────────────────────────────────────────────────────
const pendingHint  = document.getElementById('pendingHint');
const quickButtons = document.querySelectorAll('.button-grid button');
const isMobile     = () => window.innerWidth <= 600;

quickButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (isMobile()) {
      // Mobile: pre-fill the form's type select and scroll to form
      const typeSelect = document.querySelector('#noteForm select[name="type"]');
      if (typeSelect) {
        typeSelect.value = btn.dataset.type;
        // Scroll to form smoothly
        document.getElementById('noteForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Flash the button to confirm
        btn.classList.add('pending');
        setTimeout(() => btn.classList.remove('pending'), 800);
      }
      return;
    }

    // Desktop: two-step pin-drop flow
    if (pendingType === btn.dataset.type) {
      pendingType = null;
      btn.classList.remove('pending');
      pendingHint.classList.remove('active');
      return;
    }
    quickButtons.forEach(b => b.classList.remove('pending'));
    pendingType = btn.dataset.type;
    btn.classList.add('pending');
    pendingHint.classList.add('active');
    map.getContainer().style.cursor = 'crosshair';
  });
});

// ── map click ─────────────────────────────────────────────────────────────────
map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  const coordStr = lat.toFixed(4) + ', ' + lng.toFixed(4);

  if (pendingType) {
    // quick-add flow
    dropMarker(lat, lng, pendingType, 'Added from quick-add', 'bad');
    addRow(pendingType, coordStr, 'Added from quick-add');

    quickButtons.forEach(b => b.classList.remove('pending'));
    pendingHint.classList.remove('active');
    map.getContainer().style.cursor = '';
    pendingType = null;
  } else {
    // form flow — fill location input
    document.getElementById('locationInput').value = coordStr;
    // drop a preview crosshair popup
    L.popup()
      .setLatLng([lat, lng])
      .setContent('<small>Location captured — fill form and save</small>')
      .openOn(map);
  }
});

// ── note form ─────────────────────────────────────────────────────────────────
const noteForm     = document.getElementById('noteForm');
const locationInput= document.getElementById('locationInput');

noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(noteForm).entries());
  let lat = CENTER[0], lng = CENTER[1];

  // parse coords if user entered them
  const parts = data.location.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    lat = parts[0]; lng = parts[1];
  }

  const coordStr = dropMarker(lat, lng, data.type, data.note, 'bad');
  addRow(data.type, coordStr, data.note);
  map.setView([lat, lng], ZOOM);
  noteForm.reset();
  locationInput.value = '';
});

// ── table helpers ─────────────────────────────────────────────────────────────
const notesTable = document.getElementById('notesTable');

function addRow(type, location, note) {
  const tr = document.createElement('tr');
  tr.innerHTML =
    `<td>${type}</td>` +
    `<td>${location}</td>` +
    `<td>${note || 'No note'}</td>` +
    `<td><span class="tag bad">Review</span></td>`;
  notesTable.prepend(tr);
}

// ── filter buttons ────────────────────────────────────────────────────────────
document.querySelectorAll('.filter-row button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-row button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Clear search when filter changes so they don't conflict
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    applyFilter(btn.dataset.filter);
  });
});

// ── sync demo button ──────────────────────────────────────────────────────────
document.getElementById('syncButton').addEventListener('click', () => {
  const btn = document.getElementById('syncButton');
  btn.textContent = 'Synced ✓';
  // add one extra marker to show activity
  const lat = CENTER[0] + (Math.random() - .5) * .02;
  const lng = CENTER[1] + (Math.random() - .5) * .02;
  const coordStr = dropMarker(lat, lng, 'Delivery note', 'Synced from device', 'good');
  addRow('Delivery note', coordStr, 'Synced from device');
  map.setView([lat, lng], ZOOM);
  setTimeout(() => { btn.textContent = 'Sync demo data'; }, 1400);
});

// ── search ────────────────────────────────────────────────────────────────────
document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  notesTable.querySelectorAll('tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});
