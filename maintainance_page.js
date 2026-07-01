// ===================================================================
// Maintenance Center — Frontend interactions only.
// No data is actually saved/deleted/fetched here — every action below
// just updates the UI and shows feedback (toast). Real Edit/Delete/
// Reschedule/Search/Export logic must be wired up by backend via API
// calls (fetch requests) in place of the TODO comments.
// ===================================================================

// ---------- Toast helper ----------
const toast = document.getElementById('toast');
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ---------- Generic dropdown open/close ----------
// Closes every open dropdown except the one passed in (or all, if none passed).
function closeAllDropdowns(except) {
  document.querySelectorAll('.dropdown.open').forEach((dd) => {
    if (dd !== except) dd.classList.remove('open');
  });
}

function toggleDropdown(triggerEl, dropdownEl) {
  triggerEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !dropdownEl.classList.contains('open');
    closeAllDropdowns(dropdownEl);
    dropdownEl.classList.toggle('open', willOpen);
  });
}

// Close all dropdowns when clicking anywhere else on the page
document.addEventListener('click', () => closeAllDropdowns());
// Prevent a click inside a dropdown from bubbling up and closing itself
document.querySelectorAll('.dropdown').forEach((dd) => {
  dd.addEventListener('click', (e) => e.stopPropagation());
});

// ---------- Quick Add ----------
toggleDropdown(document.getElementById('quickAddBtn'), document.getElementById('quickAddDropdown'));
document.querySelectorAll('#quickAddDropdown .dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    const type = item.dataset.quick;
    closeAllDropdowns();
    // TODO (backend): open the relevant "create" form/page for `type`
    showToast(`Opening "${item.textContent.trim()}" form...`);
  });
});

// ---------- Notifications ----------
toggleDropdown(document.getElementById('notifBtn'), document.getElementById('notifDropdown'));

// ---------- Avatar menu ----------
toggleDropdown(document.getElementById('avatarBtn'), document.getElementById('avatarDropdown'));
document.querySelectorAll('#avatarDropdown .dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    closeAllDropdowns();
    if (item.classList.contains('logout')) {
      // TODO (backend): clear session / call logout API
      showToast('Logged out');
    } else {
      showToast(`Opening "${item.textContent.trim()}"...`);
    }
  });
});

// ---------- Export Log ----------
toggleDropdown(document.getElementById('exportBtn'), document.getElementById('exportDropdown'));
document.querySelectorAll('#exportDropdown .dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    closeAllDropdowns();
    // TODO (backend): generate and download the actual file
    showToast(`Exporting log as ${item.dataset.export.toUpperCase()}...`);
  });
});

// ---------- Categories filter (Asset Health Overview) ----------
const categoriesBtn = document.getElementById('categoriesBtn');
toggleDropdown(categoriesBtn, document.getElementById('categoriesDropdown'));
document.querySelectorAll('#categoriesDropdown .dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('#categoriesDropdown .dropdown-item').forEach((i) => i.classList.remove('active'));
    item.classList.add('active');
    categoriesBtn.firstChild.textContent = item.textContent.trim() + ' ';
    closeAllDropdowns();
    // TODO (backend): refetch chart data filtered by item.dataset.category
    showToast(`Filtered by "${item.textContent.trim()}"`);
  });
});

// ---------- Refresh icon on Report Issue card ----------
document.getElementById('refreshBtn').addEventListener('click', () => {
  // TODO (backend): refresh/clear the form with fresh defaults from server
  document.querySelector('.text-input').value = '';
  document.querySelector('.text-area').value = '';
  showToast('Form refreshed');
});

// ---------- View All (Upcoming Service) ----------
document.getElementById('viewAllLink').addEventListener('click', (e) => {
  e.preventDefault();
  // TODO (backend/router): navigate to the full Upcoming Service list page
  showToast('Navigating to full service list...');
});

// ---------- Priority level selector ----------
const priorityButtons = document.querySelectorAll('.priority-btn');
priorityButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    priorityButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ---------- Submit Ticket ----------
const submitBtn = document.querySelector('.submit-btn');
const assetInput = document.querySelector('.text-input');
const descriptionInput = document.querySelector('.text-area');

submitBtn.addEventListener('click', () => {
  const asset = assetInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = document.querySelector('.priority-btn.active').textContent.trim();

  if (!asset || !description) {
    showToast('Please fill in Asset ID/Name and Description');
    return;
  }

  // TODO (backend): POST { asset, priority, description } to the ticket API
  showToast(`Ticket submitted for ${asset} (${priority} priority)`);

  assetInput.value = '';
  descriptionInput.value = '';
});

// ===================================================================
// Row action menus (the ⋮ "3-dot" buttons) — Edit / Reschedule / Delete
// ===================================================================
document.querySelectorAll('.dots-btn').forEach((btn) => {
  const dropdown = btn.nextElementSibling;
  toggleDropdown(btn, dropdown);
});

// Track which asset's row is currently being acted on
let activeAsset = null;

document.querySelectorAll('.row-dropdown .dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    activeAsset = item.dataset.asset;
    const action = item.dataset.action;
    closeAllDropdowns();

    if (action === 'edit') openEditModal(activeAsset);
    if (action === 'reschedule') openRescheduleModal(activeAsset);
    if (action === 'delete') openDeleteModal(activeAsset);
  });
});

// ---------- Reschedule modal ----------
const rescheduleModal = document.getElementById('rescheduleModal');
const rescheduleAssetName = document.getElementById('rescheduleAssetName');
const rescheduleDate = document.getElementById('rescheduleDate');

function openRescheduleModal(asset) {
  rescheduleAssetName.textContent = asset;
  rescheduleDate.value = '';
  rescheduleModal.classList.add('open');
}
function closeRescheduleModal() {
  rescheduleModal.classList.remove('open');
}
document.getElementById('rescheduleCancel').addEventListener('click', closeRescheduleModal);
document.getElementById('rescheduleConfirm').addEventListener('click', () => {
  if (!rescheduleDate.value) {
    showToast('Please pick a date');
    return;
  }
  // TODO (backend): PATCH the service date for `activeAsset` to rescheduleDate.value
  showToast(`${activeAsset} rescheduled to ${rescheduleDate.value}`);
  closeRescheduleModal();
});

// ---------- Delete confirm modal ----------
const deleteModal = document.getElementById('deleteModal');
const deleteAssetName = document.getElementById('deleteAssetName');

function openDeleteModal(asset) {
  deleteAssetName.textContent = asset;
  deleteModal.classList.add('open');
}
function closeDeleteModal() {
  deleteModal.classList.remove('open');
}
document.getElementById('deleteCancel').addEventListener('click', closeDeleteModal);
document.getElementById('deleteConfirm').addEventListener('click', () => {
  // TODO (backend): DELETE the service entry for `activeAsset`, then remove its row
  const row = document.querySelector(`[data-row="${activeAsset}"]`)?.closest('tr');
  if (row) row.remove();
  showToast(`${activeAsset} deleted`);
  closeDeleteModal();
});

// ---------- Edit modal ----------
const editModal = document.getElementById('editModal');
const editAssetName = document.getElementById('editAssetName');
const editServiceType = document.getElementById('editServiceType');
const editStatus = document.getElementById('editStatus');

function openEditModal(asset) {
  editAssetName.textContent = asset;
  const row = document.querySelector(`[data-row="${asset}"]`)?.closest('tr');
  if (row) {
    editServiceType.value = row.children[1].textContent.trim();
    const statusText = row.querySelector('.status').textContent.trim().toLowerCase();
    editStatus.value = statusText;
  }
  editModal.classList.add('open');
}
function closeEditModal() {
  editModal.classList.remove('open');
}
document.getElementById('editCancel').addEventListener('click', closeEditModal);
document.getElementById('editSave').addEventListener('click', () => {
  const row = document.querySelector(`[data-row="${activeAsset}"]`)?.closest('tr');
  if (row) {
    row.children[1].textContent = editServiceType.value || row.children[1].textContent;
    const statusEl = row.querySelector('.status');
    statusEl.textContent = editStatus.value === 'pending' ? 'Pending' : 'Scheduled';
    statusEl.classList.remove('pending', 'scheduled');
    statusEl.classList.add(editStatus.value);
  }
  // TODO (backend): PATCH the updated service type/status for `activeAsset`
  showToast(`${activeAsset} updated`);
  closeEditModal();
});

// Close modals when clicking the dark overlay (outside the white box)
[rescheduleModal, deleteModal, editModal].forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
});

// Close any open modal/dropdown with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllDropdowns();
    [rescheduleModal, deleteModal, editModal].forEach((m) => m.classList.remove('open'));
  }
});

// ---------- Search box (UI only — wire to backend search API) ----------
const searchInput = document.querySelector('.search-box input');
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && searchInput.value.trim()) {
    // TODO (backend): GET /search?q=searchInput.value and render results
    showToast(`Searching for "${searchInput.value.trim()}"...`);
  }
});
