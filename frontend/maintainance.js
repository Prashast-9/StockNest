// ── Toast ──
const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ── Dropdown system ──
function closeAllDropdowns(except) {
  document.querySelectorAll('.dropdown.open').forEach(dd => {
    if (dd !== except) dd.classList.remove('open');
  });
}
function bindDropdown(btnId, ddId) {
  const btn = document.getElementById(btnId);
  const dd  = document.getElementById(ddId);
  if (!btn || !dd) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !dd.classList.contains('open');
    closeAllDropdowns(dd);
    dd.classList.toggle('open', open);
  });
}
document.addEventListener('click', () => closeAllDropdowns());
document.querySelectorAll('.dropdown').forEach(dd =>
  dd.addEventListener('click', e => e.stopPropagation())
);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAllDropdowns();
    document.querySelectorAll('.modal-overlay.open')
      .forEach(m => m.classList.remove('open'));
  }
});

// ── Bind top-bar dropdowns ──
bindDropdown('quickAddBtn', 'quickAddDropdown');
bindDropdown('notifBtn',    'notifDropdown');
bindDropdown('avatarBtn',   'avatarDropdown');
bindDropdown('exportBtn',   'exportDropdown');
bindDropdown('categoriesBtn', 'categoriesDropdown');

// ── Quick Add items ──
document.querySelectorAll('#quickAddDropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    closeAllDropdowns();
    // TODO (backend): navigate to create form for item.dataset.quick type
    showToast(`Opening "${item.textContent.trim()}" form…`);
  });
});

// ── Avatar items ──
document.querySelectorAll('#avatarDropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    closeAllDropdowns();
    if (item.classList.contains('logout')) {
      // TODO (backend): clear session & redirect
      showToast('Logged out');
    } else {
      showToast(`Opening ${item.textContent.trim()}…`);
    }
  });
});

// ── Export ──
document.querySelectorAll('#exportDropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    closeAllDropdowns();
    // TODO (backend): generate & download file
    showToast(`Exporting as ${item.dataset.export.toUpperCase()}…`);
  });
});

// ── Categories ──
document.querySelectorAll('#categoriesDropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('#categoriesDropdown .dropdown-item')
      .forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('categoriesBtn').textContent =
      item.textContent.trim() + ' ▾';
    closeAllDropdowns();
    // TODO (backend): fetch chart data filtered by item.dataset.category
    showToast(`Filtered: ${item.textContent.trim()}`);
  });
});

// ── Refresh form ──
document.getElementById('refreshBtn').addEventListener('click', () => {
  document.querySelector('.text-input').value = '';
  document.querySelector('.text-area').value  = '';
  showToast('Form cleared');
});

// ── View All ──
document.getElementById('viewAllLink').addEventListener('click', e => {
  e.preventDefault();
  // TODO (backend/router): navigate to full service list page
  showToast('Navigating to full service list…');
});

// ── Priority selection ──
document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Submit Ticket ──
document.querySelector('.submit-btn').addEventListener('click', () => {
  const asset    = document.querySelector('.text-input').value.trim();
  const desc     = document.querySelector('.text-area').value.trim();
  const priority = document.querySelector('.priority-btn.active').textContent.trim();
  if (!asset || !desc) { showToast('Please fill Asset ID and Description'); return; }
  // TODO (backend): POST { asset, priority, desc } to /api/tickets
  showToast(`Ticket submitted – ${asset} (${priority})`);
  document.querySelector('.text-input').value = '';
  document.querySelector('.text-area').value  = '';
});

// ── Search ──
document.querySelector('.search-box input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    // TODO (backend): GET /search?q=...
    showToast(`Searching "${e.target.value.trim()}"…`);
  }
});

// ── Row action menus (3-dot) ──
document.querySelectorAll('.dots-btn').forEach(btn => {
  const dd = btn.nextElementSibling;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !dd.classList.contains('open');
    closeAllDropdowns(dd);
    dd.classList.toggle('open', open);
  });
});

// ── Modal helpers ──
let activeAsset = null;
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o =>
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); })
);

// ── Row action clicks ──
document.querySelectorAll('.row-dropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    activeAsset = item.dataset.asset;
    closeAllDropdowns();
    if (item.dataset.action === 'edit')       openEditModal(activeAsset);
    if (item.dataset.action === 'reschedule') openRescheduleModal(activeAsset);
    if (item.dataset.action === 'delete')     openDeleteModal(activeAsset);
  });
});

// ── Reschedule modal ──
function openRescheduleModal(asset) {
  document.getElementById('rescheduleAssetName').textContent = asset;
  document.getElementById('rescheduleDate').value = '';
  openModal('rescheduleModal');
}
document.getElementById('rescheduleCancel').addEventListener('click', () => closeModal('rescheduleModal'));
document.getElementById('rescheduleConfirm').addEventListener('click', () => {
  const d = document.getElementById('rescheduleDate').value;
  if (!d) { showToast('Please pick a date'); return; }
  // TODO (backend): PATCH /services/:id { date: d }
  showToast(`${activeAsset} rescheduled to ${d}`);
  closeModal('rescheduleModal');
});

// ── Delete modal ──
function openDeleteModal(asset) {
  document.getElementById('deleteAssetName').textContent = asset;
  openModal('deleteModal');
}
document.getElementById('deleteCancel').addEventListener('click', () => closeModal('deleteModal'));
document.getElementById('deleteConfirm').addEventListener('click', () => {
  const row = document.querySelector(`[data-row="${activeAsset}"]`)?.closest('tr');
  if (row) row.remove();
  // TODO (backend): DELETE /services/:id
  showToast(`${activeAsset} deleted`);
  closeModal('deleteModal');
});

// ── Edit modal ──
function openEditModal(asset) {
  document.getElementById('editAssetName').textContent = asset;
  const row = document.querySelector(`[data-row="${asset}"]`)?.closest('tr');
  if (row) {
    document.getElementById('editServiceType').value = row.children[1].textContent.trim();
    document.getElementById('editStatus').value =
      row.querySelector('.status').textContent.trim().toLowerCase();
  }
  openModal('editModal');
}
document.getElementById('editCancel').addEventListener('click', () => closeModal('editModal'));
document.getElementById('editSave').addEventListener('click', () => {
  const row = document.querySelector(`[data-row="${activeAsset}"]`)?.closest('tr');
  if (row) {
    row.children[1].textContent = document.getElementById('editServiceType').value;
    const statusEl = row.querySelector('.status');
    const val = document.getElementById('editStatus').value;
    statusEl.textContent = val === 'pending' ? 'Pending' : 'Scheduled';
    statusEl.className = `status ${val}`;
  }
  // TODO (backend): PATCH /services/:id with updated fields
  showToast(`${activeAsset} updated`);
  closeModal('editModal');
});
