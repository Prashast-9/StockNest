// ==============================================================
// ORGANIZATION SETUP — Full frontend interactions
// Every TODO comment = where backend dev plugs in a fetch() call
// ==============================================================

// ---------- Toast ----------
const toastEl = document.getElementById('toast');
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

// ---------- Modal helpers ----------
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close modal when clicking dark overlay
document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
// Escape key closes everything
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
    closeAllDropdowns();
  }
});

// ---------- Generic dropdown system ----------
function closeAllDropdowns(except) {
  document.querySelectorAll('.dropdown.open').forEach((dd) => {
    if (dd !== except) dd.classList.remove('open');
  });
}
function toggleDD(triggerEl, dropdownEl) {
  triggerEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !dropdownEl.classList.contains('open');
    closeAllDropdowns(dropdownEl);
    dropdownEl.classList.toggle('open', willOpen);
  });
}
document.addEventListener('click', () => closeAllDropdowns());
document.querySelectorAll('.dropdown').forEach((dd) =>
  dd.addEventListener('click', (e) => e.stopPropagation())
);

// ==============================================================
// TOP BAR DROPDOWNS
// ==============================================================

// Notifications
toggleDD(document.getElementById('notifBtn'), document.getElementById('notifDropdown'));

// Quick Add
toggleDD(document.getElementById('quickAddBtn'), document.getElementById('qaDropdown'));
document.querySelectorAll('#qaDropdown .dd-item').forEach((item) => {
  item.addEventListener('click', () => {
    closeAllDropdowns();
    // TODO (backend): navigate to create form for item.dataset.qa type
    showToast(`Opening form: ${item.textContent.trim()}`);
  });
});

// Avatar
toggleDD(document.getElementById('avatarBtn'), document.getElementById('avatarDropdown'));
document.querySelectorAll('#avatarDropdown .dd-item').forEach((item) => {
  item.addEventListener('click', () => {
    closeAllDropdowns();
    if (item.classList.contains('danger')) {
      // TODO (backend): clear session & redirect to login
      showToast('Logged out');
    } else {
      showToast(`Opening ${item.textContent.trim()}...`);
    }
  });
});

// Search
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    // TODO (backend): GET /search?q=... and show results
    showToast(`Searching "${e.target.value.trim()}"...`);
  }
});

// ==============================================================
// ORGANIZATION TIER SELECTION
// ==============================================================
const tierDescriptions = {
  basic:        'Single location, up to 1,000 assets.',
  professional: 'Multi-branch, advanced reporting.',
  enterprise:   'Unlimited hierarchy, API access.'
};
let pendingTier = null;

document.querySelectorAll('.tier-option').forEach((option) => {
  option.addEventListener('click', () => {
    const tierVal = option.dataset.tier;
    const currentChecked = document.querySelector('input[name="tier"]:checked');
    if (currentChecked && currentChecked.value === tierVal) return; // already selected

    pendingTier = tierVal;
    document.getElementById('tierName').textContent =
      tierVal.charAt(0).toUpperCase() + tierVal.slice(1);
    document.getElementById('tierDesc').textContent = tierDescriptions[tierVal];
    openModal('tierModal');
  });
});

document.getElementById('tierCancel').addEventListener('click', () => closeModal('tierModal'));
document.getElementById('tierConfirm').addEventListener('click', () => {
  if (!pendingTier) return;
  // Update radio state
  document.querySelectorAll('.tier-option').forEach((opt) => {
    opt.classList.remove('selected');
    const radio = opt.querySelector('input[type="radio"]');
    const circle = opt.querySelector('.radio-circle');
    radio.checked = opt.dataset.tier === pendingTier;
    circle.classList.toggle('checked', opt.dataset.tier === pendingTier);
    if (opt.dataset.tier === pendingTier) opt.classList.add('selected');
  });
  // TODO (backend): PATCH /organization/tier { tier: pendingTier }
  showToast(`Tier changed to ${pendingTier.charAt(0).toUpperCase() + pendingTier.slice(1)}`);
  closeModal('tierModal');
  pendingTier = null;
});

// ==============================================================
// BRANCH DETAILS FORM
// ==============================================================
const branchFields = ['branchName', 'branchId', 'branchAddr1', 'branchCity', 'branchZip', 'branchStatus'];
let originalValues = {};

function saveBranchOriginals() {
  branchFields.forEach((id) => {
    originalValues[id] = document.getElementById(id).value;
  });
}
saveBranchOriginals();

// Enable edit mode
document.getElementById('branchEditBtn').addEventListener('click', () => {
  saveBranchOriginals();
  branchFields.forEach((id) => {
    document.getElementById(id).disabled = false;
  });
  document.getElementById('cancelBtn').disabled = false;
  document.getElementById('saveBtn').disabled = false;
  document.getElementById('branchEditBtn').style.opacity = '0.3';
  document.getElementById('branchEditBtn').style.pointerEvents = 'none';
  showToast('Edit mode enabled');
});

// Cancel — restore original values
document.getElementById('cancelBtn').addEventListener('click', () => {
  branchFields.forEach((id) => {
    document.getElementById(id).value = originalValues[id];
    document.getElementById(id).disabled = true;
  });
  document.getElementById('cancelBtn').disabled = true;
  document.getElementById('saveBtn').disabled = true;
  document.getElementById('branchEditBtn').style.opacity = '';
  document.getElementById('branchEditBtn').style.pointerEvents = '';
  showToast('Changes cancelled');
});

// Save
document.getElementById('saveBtn').addEventListener('click', () => {
  const name = document.getElementById('branchName').value.trim();
  if (!name) { showToast('Branch Name cannot be empty'); return; }

  // TODO (backend): PATCH /branches/:id with updated field values
  branchFields.forEach((id) => document.getElementById(id).disabled = true);
  document.getElementById('cancelBtn').disabled = true;
  document.getElementById('saveBtn').disabled = true;
  document.getElementById('branchEditBtn').style.opacity = '';
  document.getElementById('branchEditBtn').style.pointerEvents = '';
  saveBranchOriginals();
  showToast('Branch details saved');
});

// ==============================================================
// GEO-SYNC SETTINGS
// ==============================================================
document.getElementById('geoSettingsBtn').addEventListener('click', () => openModal('geoModal'));
document.getElementById('geoCancel').addEventListener('click', () => closeModal('geoModal'));
document.getElementById('geoSave').addEventListener('click', () => {
  // TODO (backend): PATCH /geosync/settings { interval, accuracy }
  showToast('GEO-SYNC settings saved');
  closeModal('geoModal');
});

// ==============================================================
// GENERATE LOCATION TAGS
// ==============================================================
document.getElementById('generateTagsBtn').addEventListener('click', () => openModal('tagsModal'));
document.getElementById('tagsClose').addEventListener('click', () => closeModal('tagsModal'));

document.getElementById('tagsCopy').addEventListener('click', () => {
  const tags = Array.from(document.querySelectorAll('.tag-chip')).map((c) => c.textContent).join(', ');
  navigator.clipboard.writeText(tags).then(() => showToast('Tags copied to clipboard'));
  // TODO (backend): optionally log copy event
});

document.getElementById('tagsDownload').addEventListener('click', () => {
  const tags = Array.from(document.querySelectorAll('.tag-chip')).map((c) => c.textContent);
  const csv = 'Location Tag\n' + tags.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'location-tags.csv' });
  a.click();
  URL.revokeObjectURL(url);
  // TODO (backend): log download event or generate tags server-side
  showToast('Downloaded location-tags.csv');
});

// ==============================================================
// LOCATION TREE
// ==============================================================

// Expand / collapse nodes
document.querySelectorAll('[data-toggle]').forEach((row) => {
  row.addEventListener('click', (e) => {
    // Don't trigger if clicking action buttons
    if (e.target.closest('.tree-act-btn')) return;

    const nodeId = row.dataset.toggle;
    const children = document.getElementById(`children-${nodeId}`);
    if (!children) return;

    const toggle = row.querySelector('.tree-toggle');
    const isOpen = !children.classList.contains('hidden');

    children.classList.toggle('hidden', isOpen);
    if (toggle) toggle.textContent = isOpen ? '▸' : '▾';
    row.classList.toggle('collapsed', isOpen);
    row.classList.toggle('open', !isOpen);
  });
});

// Leaf node select (click to highlight)
document.querySelectorAll('[data-select]').forEach((row) => {
  row.addEventListener('click', (e) => {
    if (e.target.closest('.tree-act-btn')) return;
    document.querySelectorAll('.tree-row').forEach((r) => r.classList.remove('active'));
    row.classList.add('active');
    // TODO (backend): GET /locations/:id to load detail into Branch Details panel
    showToast(`Selected: ${row.querySelector('.tree-label').textContent}`);
  });
});

// Tree action buttons — Edit & Delete
let activeNodeName = null;

document.querySelectorAll('.tree-act-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    activeNodeName = btn.dataset.node;
    if (btn.dataset.act === 'edit') {
      document.getElementById('editNodeName').textContent = activeNodeName;
      document.getElementById('editNodeInput').value = activeNodeName;
      openModal('editNodeModal');
    } else if (btn.dataset.act === 'delete') {
      document.getElementById('deleteNodeName').textContent = activeNodeName;
      openModal('deleteNodeModal');
    }
  });
});

// Edit node save
document.getElementById('editNodeCancel').addEventListener('click', () => closeModal('editNodeModal'));
document.getElementById('editNodeSave').addEventListener('click', () => {
  const newName = document.getElementById('editNodeInput').value.trim();
  if (!newName) { showToast('Name cannot be empty'); return; }

  // Update the label in the tree DOM
  document.querySelectorAll('.tree-label').forEach((label) => {
    if (label.closest('.tree-row')?.querySelector(`[data-node="${activeNodeName}"]`)) return;
    // find btn with data-node matching activeNodeName inside same tree-row
  });
  // Easier — find the row that has act-btn with this node
  document.querySelectorAll(`.tree-act-btn[data-node="${activeNodeName}"]`).forEach((btn) => {
    const label = btn.closest('.tree-row').querySelector('.tree-label');
    if (label) label.textContent = newName;
    btn.dataset.node = newName;
  });

  // TODO (backend): PATCH /locations/:id { name: newName }
  showToast(`Renamed to "${newName}"`);
  activeNodeName = newName;
  closeModal('editNodeModal');
});

// Delete node confirm
document.getElementById('deleteNodeCancel').addEventListener('click', () => closeModal('deleteNodeModal'));
document.getElementById('deleteNodeConfirm').addEventListener('click', () => {
  document.querySelectorAll(`.tree-act-btn[data-node="${activeNodeName}"]`).forEach((btn) => {
    const parentNode = btn.closest('.tree-node');
    if (parentNode) parentNode.remove();
  });
  // TODO (backend): DELETE /locations/:id
  showToast(`Removed "${activeNodeName}"`);
  closeModal('deleteNodeModal');
});

// Add location
document.getElementById('addNodeBtn').addEventListener('click', () => {
  document.getElementById('newLocName').value = '';
  openModal('addLocationModal');
});
document.getElementById('addLocCancel').addEventListener('click', () => closeModal('addLocationModal'));
document.getElementById('addLocConfirm').addEventListener('click', () => {
  const name = document.getElementById('newLocName').value.trim();
  const type = document.getElementById('newLocType').value;
  if (!name) { showToast('Please enter a location name'); return; }

  // Add to the tree UI under North America for demo
  const newNode = document.createElement('div');
  newNode.className = 'tree-node leaf';
  const ico = type === 'floor' ? '📋' : type === 'region' ? '🌎' : '🏢';
  newNode.innerHTML = `
    <div class="tree-row leaf-row" data-select="${name.toLowerCase().replace(/\s+/g,'-')}">
      <span class="tree-ico">${ico}</span>
      <span class="tree-label">${name}</span>
      <span class="tree-actions">
        <button class="tree-act-btn" data-act="edit" data-node="${name}" title="Edit">✏️</button>
        <button class="tree-act-btn" data-act="delete" data-node="${name}" title="Delete">🗑</button>
      </span>
    </div>`;
  document.getElementById('children-north-america').appendChild(newNode);

  // Bind events on the new buttons
  newNode.querySelectorAll('.tree-act-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeNodeName = btn.dataset.node;
      if (btn.dataset.act === 'edit') {
        document.getElementById('editNodeName').textContent = activeNodeName;
        document.getElementById('editNodeInput').value = activeNodeName;
        openModal('editNodeModal');
      } else {
        document.getElementById('deleteNodeName').textContent = activeNodeName;
        openModal('deleteNodeModal');
      }
    });
  });
  newNode.querySelector('[data-select]').addEventListener('click', (e) => {
    if (e.target.closest('.tree-act-btn')) return;
    document.querySelectorAll('.tree-row').forEach((r) => r.classList.remove('active'));
    e.currentTarget.classList.add('active');
    showToast(`Selected: ${name}`);
  });

  // TODO (backend): POST /locations { name, type, parentId }
  showToast(`"${name}" added to tree`);
  closeModal('addLocationModal');
});

// ==============================================================
// SPATIAL ASSET DISTRIBUTION
// ==============================================================

// Info tooltip
const infoBtn = document.getElementById('infoBtn');
const infoTooltip = document.getElementById('infoTooltip');
infoBtn.addEventListener('mouseenter', () => infoTooltip.classList.add('visible'));
infoBtn.addEventListener('mouseleave', () => infoTooltip.classList.remove('visible'));
infoBtn.addEventListener('click', () => infoTooltip.classList.toggle('visible'));

// Floor selector
const floorData = {
  'Floor 10': {
    zones: [
      { name: 'Open Desk Area', assets: 245, density: 'medium', label: 'blue' },
      { name: 'Meeting Rooms', assets: 42, density: 'normal', label: 'dark' },
      { name: 'IT Storage', assets: 890, density: 'high', label: 'dark' }
    ]
  },
  'Floor 11': {
    zones: [
      { name: 'Studio A', assets: 120, density: 'medium', label: 'blue' },
      { name: 'Studio B', assets: 85, density: 'normal', label: 'dark' },
      { name: 'Equipment Room', assets: 310, density: 'high', label: 'dark' }
    ]
  },
  'Floor 1': {
    zones: [
      { name: 'Reception', assets: 30, density: 'normal', label: 'blue' },
      { name: 'Conference Hall', assets: 75, density: 'medium', label: 'dark' },
      { name: 'Server Room', assets: 540, density: 'high', label: 'dark' }
    ]
  }
};

toggleDD(document.getElementById('floorBtn'), document.getElementById('floorDropdown'));
document.querySelectorAll('#floorDropdown .dd-item').forEach((item) => {
  item.addEventListener('click', () => {
    const floor = item.dataset.floor;
    document.getElementById('floorBtn').textContent = floor + ' ▾';
    document.querySelectorAll('#floorDropdown .dd-item').forEach((i) => i.classList.remove('active'));
    item.classList.add('active');
    closeAllDropdowns();
    updateFloorData(floor);
    // TODO (backend): GET /floors/:id/density and render returned data
    showToast(`Viewing ${floor} density`);
  });
});

function updateFloorData(floor) {
  const data = floorData[floor];
  if (!data) return;

  // Update heatmap zone labels and counts
  const heatZones = document.querySelectorAll('.heat-zone');
  const listRows = document.querySelectorAll('.zone-table tbody tr');

  data.zones.forEach((zone, i) => {
    if (heatZones[i]) {
      const label = heatZones[i].querySelector('.zone-label');
      const count = heatZones[i].querySelector('.zone-assets');
      if (label) label.textContent = zone.name;
      if (count) count.textContent = zone.assets + ' Assets';
    }
    if (listRows[i]) {
      listRows[i].cells[0].textContent = zone.name;
      listRows[i].cells[1].textContent = zone.assets;
      const badge = listRows[i].querySelector('.density');
      if (badge) {
        badge.className = `density ${zone.density}`;
        badge.textContent = zone.density.charAt(0).toUpperCase() + zone.density.slice(1);
      }
    }
  });
}

// Grid / List view toggle
document.getElementById('gridViewBtn').addEventListener('click', () => {
  document.getElementById('gridViewBtn').classList.add('active');
  document.getElementById('listViewBtn').classList.remove('active');
  document.getElementById('heatmapWrap').classList.remove('hidden');
  document.getElementById('listView').classList.add('hidden');
});

document.getElementById('listViewBtn').addEventListener('click', () => {
  document.getElementById('listViewBtn').classList.add('active');
  document.getElementById('gridViewBtn').classList.remove('active');
  document.getElementById('heatmapWrap').classList.add('hidden');
  document.getElementById('listView').classList.remove('hidden');
});
