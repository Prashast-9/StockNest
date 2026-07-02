/**
 * StockNest — Asset Registry Page
 */

import { renderSidebar, initSidebarNav } from './components/sidebar.js';
import { renderTopbar, initTopbarEvents } from './components/topbar.js';

const PAGE_SIZE = 4;
const CATEGORIES = ['All', 'Furniture', 'Electronics', 'Amenities'];
const LOCATIONS = ['All Zones', 'Zone A', 'Zone B', 'Zone C'];
const STATUSES = ['All', 'In Use', 'Available', 'Maintenance', 'Low Supplies'];

let assets = [
  { id: 'AST-8821-HM', name: 'Herman Miller Aeron', location: 'Zone A - Desk 42', zone: 'Zone A', category: 'Furniture', status: 'In Use', statusClass: 'status-in-use', assignedTo: { name: 'Elena H.', initials: 'EH', color: '#f97316' }, condition: 92, lastChecked: 'Oct 12, 2023', icon: '🪑' },
  { id: 'AST-4410-MB', name: 'MacBook Pro 16"', location: 'Zone B - Hot Desk 12', zone: 'Zone B', category: 'Electronics', status: 'Available', statusClass: 'status-available', assignedTo: null, condition: 100, lastChecked: 'Oct 14, 2023', icon: '💻' },
  { id: 'AST-3302-LM', name: 'La Marzocco Linea Mini', location: 'Zone C - Kitchen', zone: 'Zone C', category: 'Amenities', status: 'Maintenance', statusClass: 'status-maintenance', assignedTo: { name: 'Community Team', initials: 'CT', color: '#6366f1' }, condition: 45, lastChecked: 'Sep 28, 2023', icon: '☕' },
  { id: 'AST-1190-HP', name: 'HP LaserJet Pro', location: 'Zone A - Print Station', zone: 'Zone A', category: 'Electronics', status: 'Low Supplies', statusClass: 'status-low-supplies', assignedTo: { name: 'Shared Asset', initials: 'SA', color: '#64748b' }, condition: 68, lastChecked: 'Oct 10, 2023', icon: '🖨️' },
  { id: 'AST-5520-DK', name: 'Standing Desk Frame', location: 'Zone B - Desk 08', zone: 'Zone B', category: 'Furniture', status: 'In Use', statusClass: 'status-in-use', assignedTo: { name: 'Jordan L.', initials: 'JL', color: '#8b5cf6' }, condition: 88, lastChecked: 'Oct 01, 2023', icon: '🗄️' },
  { id: 'AST-7741-PR', name: 'Epson Projector', location: 'Zone C - Conference', zone: 'Zone C', category: 'Electronics', status: 'Available', statusClass: 'status-available', assignedTo: null, condition: 95, lastChecked: 'Sep 20, 2023', icon: '📽️' },
];

let filters = { search: '', category: 'All', location: 'All Zones', status: 'All' };
let sortKey = 'name';
let sortDir = 'asc';
let currentPage = 1;
let actionTargetId = null;

const $ = (sel, ctx = document) => ctx.querySelector(sel);

function showToast(message, type = 'success') {
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function getStatusClass(status) {
  const map = {
    'In Use': 'status-in-use',
    Available: 'status-available',
    Maintenance: 'status-maintenance',
    'Low Supplies': 'status-low-supplies',
  };
  return map[status] || 'status-available';
}

function getConditionColor(value) {
  if (value >= 80) return '#16a34a';
  if (value >= 60) return '#ca8a04';
  return '#dc2626';
}

function getFilteredAssets() {
  let list = [...assets];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((a) => {
      const assigned = a.assignedTo ? a.assignedTo.name : 'Unassigned';
      return (
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        assigned.toLowerCase().includes(q)
      );
    });
  }

  if (filters.category !== 'All') list = list.filter((a) => a.category === filters.category);
  if (filters.location !== 'All Zones') list = list.filter((a) => a.zone === filters.location);
  if (filters.status !== 'All') list = list.filter((a) => a.status === filters.status);

  list.sort((a, b) => {
    let va;
    let vb;
    switch (sortKey) {
      case 'assigned':
        va = a.assignedTo ? a.assignedTo.name : 'Unassigned';
        vb = b.assignedTo ? b.assignedTo.name : 'Unassigned';
        break;
      case 'condition':
        va = a.condition;
        vb = b.condition;
        break;
      default:
        va = a[sortKey] || '';
        vb = b[sortKey] || '';
    }
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    const cmp = String(va).localeCompare(String(vb));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return list;
}

function updateSummary() {
  $('#totalAssets').textContent = assets.length.toLocaleString();
  $('#weeklyChange').textContent = Math.min(assets.length, 12);
  const maint = assets.filter((a) => a.status === 'Maintenance').length;
  $('#maintCount').textContent = maint;

  const avg = assets.length
    ? Math.round(assets.reduce((sum, a) => sum + a.condition, 0) / assets.length)
    : 0;
  $('#fleetIndex').textContent = `${avg} / 100`;

  const critical = assets.filter((a) => a.condition < 60).length;
  const fair = assets.filter((a) => a.condition >= 60 && a.condition < 80).length;
  const good = assets.length - critical - fair;
  const total = assets.length || 1;

  $('#fleetBar').innerHTML = `
    <div class="fleet-bar__segment fleet-bar__segment--critical" style="width:${(critical / total) * 100}%"></div>
    <div class="fleet-bar__segment fleet-bar__segment--fair" style="width:${(fair / total) * 100}%"></div>
    <div class="fleet-bar__segment fleet-bar__segment--good" style="width:${(good / total) * 100}%"></div>`;

  $('#fleetLegend').innerHTML = `
    <span>Critical: ${Math.round((critical / total) * 100)}%</span>
    <span>Fair: ${Math.round((fair / total) * 100)}%</span>
    <span>Good: ${Math.round((good / total) * 100)}%</span>`;
}

function renderAssignedUser(assignedTo) {
  if (!assignedTo) return '<span class="text-muted">Unassigned</span>';
  return `<div class="assigned-user"><span class="assigned-user__avatar" style="background-color:${assignedTo.color}">${assignedTo.initials}</span>${assignedTo.name}</div>`;
}

function renderRow(asset) {
  const color = getConditionColor(asset.condition);
  return `<tr data-id="${asset.id}">
    <td class="col-check"><input type="checkbox" class="row-checkbox" data-id="${asset.id}" /></td>
    <td><div class="asset-details"><div class="asset-details__thumb">${asset.icon}</div><div><div class="asset-details__name">${asset.name}</div><div class="asset-details__location">${asset.location}</div></div></div></td>
    <td class="text-muted">${asset.id}</td>
    <td>${asset.category}</td>
    <td><span class="status-badge ${asset.statusClass}">${asset.status}</span></td>
    <td>${renderAssignedUser(asset.assignedTo)}</td>
    <td><div class="condition-bar"><div class="condition-bar__track"><div class="condition-bar__fill" style="width:${asset.condition}%;background-color:${color}"></div></div><span class="condition-bar__label" style="color:${color}">${asset.condition}%</span></div></td>
    <td class="text-muted">${asset.lastChecked}</td>
    <td class="col-actions"><button type="button" class="row-action-btn" data-action-menu="${asset.id}" aria-label="Actions">⋮</button></td>
  </tr>`;
}

function renderTable() {
  const filtered = getFilteredAssets();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const tbody = $('#assetTableBody');

  tbody.innerHTML = pageItems.length
    ? pageItems.map(renderRow).join('')
    : '<tr><td colspan="9" class="text-muted" style="text-align:center;padding:32px">No assets found.</td></tr>';

  const end = Math.min(start + PAGE_SIZE, filtered.length);
  $('#paginationInfo').textContent = filtered.length
    ? `Showing ${start + 1} to ${end} of ${filtered.length} entries`
    : 'Showing 0 entries';

  renderPagination(totalPages);
  $('#selectAll').checked = false;

  document.querySelectorAll('.sortable').forEach((th) => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.sort === sortKey) th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
  });

  updateSummary();
}

function renderPagination(totalPages) {
  const controls = $('#paginationControls');
  let html = `<button type="button" class="page-btn" data-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button type="button" class="page-btn${i === currentPage ? ' page-btn--active' : ''}" data-page="${i}">${i}</button>`;
  }

  html += `<button type="button" class="page-btn" data-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>`;
  controls.innerHTML = html;
}

function openModal(title, body, footer = '', wide = false) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = body;
  $('#modalFooter').innerHTML = footer;
  $('#registryModal').classList.toggle('registry-modal--wide', wide);
  $('#registryModal').showModal();
  $('#modalBackdrop').hidden = false;
}

function closeModal() {
  $('#registryModal').close();
  $('#modalBackdrop').hidden = true;
  $('#modalFooter').innerHTML = '';
}

function assetForm(asset = null) {
  return `
    <div class="form-group"><label class="form-label">Asset Name</label><input class="form-input" id="fName" value="${asset?.name || ''}" required></div>
    <div class="form-group"><label class="form-label">System ID</label><input class="form-input" id="fId" value="${asset?.id || ''}" ${asset ? 'readonly' : ''} required></div>
    <div class="form-group"><label class="form-label">Category</label><select class="form-select" id="fCategory">${CATEGORIES.filter((c) => c !== 'All').map((c) => `<option${asset?.category === c ? ' selected' : ''}>${c}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="fLocation" value="${asset?.location || ''}" required></div>
    <div class="form-group"><label class="form-label">Zone</label><select class="form-select" id="fZone">${LOCATIONS.filter((l) => l !== 'All Zones').map((z) => `<option${asset?.zone === z ? ' selected' : ''}>${z}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="fStatus">${STATUSES.filter((s) => s !== 'All').map((s) => `<option${asset?.status === s ? ' selected' : ''}>${s}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Condition (%)</label><input class="form-input" id="fCondition" type="number" min="0" max="100" value="${asset?.condition ?? 100}"></div>
    <div class="form-group"><label class="form-label">Assigned To</label><input class="form-input" id="fAssigned" value="${asset?.assignedTo?.name || ''}" placeholder="Leave blank if unassigned"></div>
    <p class="form-error" id="formError"></p>`;
}

function saveAssetFromForm(existingId = null) {
  const name = $('#fName').value.trim();
  const id = $('#fId').value.trim();
  const category = $('#fCategory').value;
  const location = $('#fLocation').value.trim();
  const zone = $('#fZone').value;
  const status = $('#fStatus').value;
  const condition = Math.min(100, Math.max(0, parseInt($('#fCondition').value, 10) || 0));
  const assignedName = $('#fAssigned').value.trim();
  const errorEl = $('#formError');

  if (!name || !id || !location) {
    errorEl.textContent = 'Please fill in all required fields.';
    return false;
  }

  if (!existingId && assets.some((a) => a.id === id)) {
    errorEl.textContent = 'System ID already exists.';
    return false;
  }

  const payload = {
    id,
    name,
    location,
    zone,
    category,
    status,
    statusClass: getStatusClass(status),
    assignedTo: assignedName
      ? { name: assignedName, initials: assignedName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(), color: '#6366f1' }
      : null,
    condition,
    lastChecked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    icon: '📦',
  };

  if (existingId) {
    const idx = assets.findIndex((a) => a.id === existingId);
    if (idx !== -1) assets[idx] = payload;
    showToast(`Asset "${name}" updated.`);
  } else {
    assets.unshift(payload);
    showToast(`Asset "${name}" added.`);
  }

  renderTable();
  closeModal();
  return true;
}

function openAddModal() {
  openModal('Add New Asset', assetForm(), `
    <button type="button" class="btn btn--outline" data-close-modal>Cancel</button>
    <button type="button" class="btn btn--primary" id="saveAssetBtn">Save Asset</button>`);
  $('#saveAssetBtn').addEventListener('click', () => saveAssetFromForm());
}

function openEditModal(id) {
  const asset = assets.find((a) => a.id === id);
  if (!asset) return;
  openModal('Edit Asset', assetForm(asset), `
    <button type="button" class="btn btn--outline" data-close-modal>Cancel</button>
    <button type="button" class="btn btn--primary" id="saveAssetBtn">Save Changes</button>`);
  $('#saveAssetBtn').addEventListener('click', () => saveAssetFromForm(id));
}

function openViewModal(id) {
  const asset = assets.find((a) => a.id === id);
  if (!asset) return;
  openModal('Asset Details', `
    <p><strong>Name:</strong> ${asset.name}</p>
    <p><strong>ID:</strong> ${asset.id}</p>
    <p><strong>Category:</strong> ${asset.category}</p>
    <p><strong>Location:</strong> ${asset.location}</p>
    <p><strong>Status:</strong> ${asset.status}</p>
    <p><strong>Condition:</strong> ${asset.condition}%</p>
    <p><strong>Assigned:</strong> ${asset.assignedTo ? asset.assignedTo.name : 'Unassigned'}</p>
    <p><strong>Last Checked:</strong> ${asset.lastChecked}</p>`,
    `<button type="button" class="btn btn--primary" data-close-modal>Close</button>`);
}

function deleteAsset(id) {
  const asset = assets.find((a) => a.id === id);
  if (!asset) return;
  openModal('Delete Asset', `<p>Are you sure you want to delete <strong>${asset.name}</strong> (${asset.id})?</p>`,
    `<button type="button" class="btn btn--outline" data-close-modal>Cancel</button>
     <button type="button" class="btn btn--primary" id="confirmDeleteBtn">Delete</button>`);
  $('#confirmDeleteBtn').addEventListener('click', () => {
    assets = assets.filter((a) => a.id !== id);
    showToast(`Asset "${asset.name}" deleted.`, 'info');
    renderTable();
    closeModal();
  });
}

function exportAssets() {
  const filtered = getFilteredAssets();
  const headers = ['ID', 'Name', 'Category', 'Location', 'Status', 'Condition', 'Assigned', 'Last Checked'];
  const rows = filtered.map((a) => [
    a.id, a.name, a.category, a.location, a.status, a.condition,
    a.assignedTo ? a.assignedTo.name : 'Unassigned', a.lastChecked,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `stocknest-assets-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Assets exported as CSV.');
}

function openImportModal() {
  openModal('Import Assets', `
    <p style="margin-bottom:12px;color:#6b7280;font-size:14px;">Paste CSV data (ID,Name,Category) — one asset per line.</p>
    <textarea class="form-textarea" id="importData" placeholder="AST-0001-XX,Sample Asset,Electronics"></textarea>`,
    `<button type="button" class="btn btn--outline" data-close-modal>Cancel</button>
     <button type="button" class="btn btn--primary" id="importConfirmBtn">Import</button>`);

  $('#importConfirmBtn').addEventListener('click', () => {
    const lines = $('#importData').value.trim().split('\n').filter(Boolean);
    let count = 0;
    lines.forEach((line) => {
      const [id, name, category] = line.split(',').map((s) => s.trim());
      if (!id || !name || assets.some((a) => a.id === id)) return;
      assets.push({
        id, name, category: category || 'Electronics', location: 'Zone A - Imported', zone: 'Zone A',
        status: 'Available', statusClass: 'status-available', assignedTo: null, condition: 100,
        lastChecked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: '📦',
      });
      count++;
    });
    showToast(count ? `Imported ${count} asset(s).` : 'No valid rows imported.', count ? 'success' : 'error');
    renderTable();
    closeModal();
  });
}

function openScanModal() {
  openModal('Scan Asset', `
    <div class="scan-box"><div class="scan-box__line"></div>Point scanner at asset barcode</div>
    <p style="margin-top:12px;font-size:13px;color:#6b7280;text-align:center;">Simulated scan will detect the nearest asset.</p>`,
    `<button type="button" class="btn btn--outline" data-close-modal>Cancel</button>
     <button type="button" class="btn btn--primary" id="scanConfirmBtn">Simulate Scan</button>`);

  $('#scanConfirmBtn').addEventListener('click', () => {
    const asset = assets[0];
    closeModal();
    showToast(asset ? `Scanned: ${asset.name} (${asset.id})` : 'No assets to scan.', 'info');
    if (asset) openViewModal(asset.id);
  });
}

function buildFilterMenu(container, items, current, onSelect, btnSelector, labelFn) {
  container.innerHTML = items.map((item) =>
    `<button type="button" class="${item === current ? 'is-active' : ''}" data-value="${item}">${item}</button>`
  ).join('');

  container.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      onSelect(btn.dataset.value);
      $(btnSelector).textContent = labelFn(btn.dataset.value);
      container.hidden = true;
      currentPage = 1;
      renderTable();
    });
  });
}

function closeAllMenus() {
  document.querySelectorAll('.filter-menu').forEach((m) => { m.hidden = true; });
  $('#actionMenu').hidden = true;
}

function showActionMenu(id, btn) {
  actionTargetId = id;
  const menu = $('#actionMenu');
  menu.innerHTML = `
    <button type="button" data-action="view">View Details</button>
    <button type="button" data-action="edit">Edit Asset</button>
    <button type="button" data-action="delete" class="is-danger">Delete Asset</button>`;
  const rect = btn.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 4}px`;
  menu.style.left = `${Math.max(8, rect.left - 120)}px`;
  menu.hidden = false;
}

function initFilters() {
  buildFilterMenu($('#categoryMenu'), CATEGORIES, filters.category, (v) => { filters.category = v; }, '#categoryFilterBtn', (v) => `Category: ${v} ▾`);
  buildFilterMenu($('#locationMenu'), LOCATIONS, filters.location, (v) => { filters.location = v; }, '#locationFilterBtn', (v) => `Location: ${v} ▾`);
  buildFilterMenu($('#statusMenu'), STATUSES, filters.status, (v) => { filters.status = v; }, '#statusFilterBtn', (v) => `Status: ${v} ▾`);

  ['categoryFilterBtn', 'locationFilterBtn', 'statusFilterBtn'].forEach((id) => {
    $(`#${id}`).addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = $(`#${id.replace('Btn', 'Menu')}`);
      const wasHidden = menu.hidden;
      closeAllMenus();
      if (wasHidden) menu.hidden = false;
    });
  });

  $('#filterInput').addEventListener('input', (e) => {
    filters.search = e.target.value;
    currentPage = 1;
    renderTable();
  });

  $('#clearSearchBtn').addEventListener('click', () => {
    filters.search = '';
    $('#filterInput').value = '';
    currentPage = 1;
    renderTable();
    showToast('Search cleared.', 'info');
  });

  $('#resetFiltersBtn').addEventListener('click', () => {
    filters = { search: '', category: 'All', location: 'All Zones', status: 'All' };
    $('#filterInput').value = '';
    $('#categoryFilterBtn').textContent = 'Category: All ▾';
    $('#locationFilterBtn').textContent = 'Location: All Zones ▾';
    $('#statusFilterBtn').textContent = 'Status: All ▾';
    buildFilterMenu($('#categoryMenu'), CATEGORIES, 'All', (v) => { filters.category = v; }, '#categoryFilterBtn', (v) => `Category: ${v} ▾`);
    buildFilterMenu($('#locationMenu'), LOCATIONS, 'All Zones', (v) => { filters.location = v; }, '#locationFilterBtn', (v) => `Location: ${v} ▾`);
    buildFilterMenu($('#statusMenu'), STATUSES, 'All', (v) => { filters.status = v; }, '#statusFilterBtn', (v) => `Status: ${v} ▾`);
    currentPage = 1;
    renderTable();
    showToast('Filters reset.', 'info');
  });

  $('#advancedFilterBtn').addEventListener('click', () => {
    openModal('Advanced Filters', `
      <div class="form-group"><label class="form-label">Minimum Condition</label><input class="form-input" id="advMinCondition" type="number" min="0" max="100" value="0"></div>
      <div class="form-group"><label class="form-label">Only Unassigned</label><input type="checkbox" id="advUnassigned"></div>`,
      `<button type="button" class="btn btn--outline" data-close-modal>Cancel</button>
       <button type="button" class="btn btn--primary" id="advApplyBtn">Apply</button>`);

    $('#advApplyBtn').addEventListener('click', () => {
      const min = parseInt($('#advMinCondition').value, 10) || 0;
      const unassignedOnly = $('#advUnassigned').checked;
      const base = getFilteredAssets().filter((a) => a.condition >= min && (!unassignedOnly || !a.assignedTo));
      closeModal();
      showToast(`Advanced filter matched ${base.length} asset(s).`, 'info');
    });
  });
}

function initEvents() {
  $('#addAssetBtn').addEventListener('click', openAddModal);
  $('#exportBtn').addEventListener('click', exportAssets);
  $('#importBtn').addEventListener('click', openImportModal);
  $('#scanBtn').addEventListener('click', openScanModal);
  $('#reviewTicketsBtn').addEventListener('click', () => {
    filters.status = 'Maintenance';
    $('#statusFilterBtn').textContent = 'Status: Maintenance ▾';
    currentPage = 1;
    renderTable();
    showToast('Showing maintenance assets.', 'info');
  });

  $('#selectAll').addEventListener('change', (e) => {
    document.querySelectorAll('.row-checkbox').forEach((cb) => { cb.checked = e.target.checked; });
  });

  document.querySelectorAll('.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = key; sortDir = 'asc'; }
      renderTable();
    });
  });

  $('#paginationControls').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    const totalPages = Math.ceil(getFilteredAssets().length / PAGE_SIZE);
    if (btn.dataset.page === 'prev') currentPage--;
    else if (btn.dataset.page === 'next') currentPage++;
    else currentPage = parseInt(btn.dataset.page, 10);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    renderTable();
  });

  $('#assetTableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action-menu]');
    if (!btn) return;
    e.stopPropagation();
    showActionMenu(btn.dataset.actionMenu, btn);
  });

  $('#actionMenu').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !actionTargetId) return;
    const action = btn.dataset.action;
    $('#actionMenu').hidden = true;
    if (action === 'view') openViewModal(actionTargetId);
    else if (action === 'edit') openEditModal(actionTargetId);
    else if (action === 'delete') deleteAsset(actionTargetId);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-dropdown-wrap')) closeAllMenus();
    if (!e.target.closest('.action-menu') && !e.target.closest('[data-action-menu]')) $('#actionMenu').hidden = true;
    if (e.target.matches('[data-close-modal]') || e.target === $('#modalBackdrop')) closeModal();
  });

  $('#modalCloseBtn').addEventListener('click', closeModal);
  $('#registryModal').addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });
}

function initTopbarSearch() {
  const topbarRoot = $('#topbar-root');
  const searchInput = topbarRoot?.querySelector('#global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filters.search = e.target.value;
      $('#filterInput').value = e.target.value;
      currentPage = 1;
      renderTable();
    });
  }
}

function initApp() {
  renderSidebar($('#sidebar-root'), { activeItem: 'asset-registry' });
  initSidebarNav($('#sidebar-root'));
  renderTopbar($('#topbar-root'), { searchPlaceholder: 'Search assets, IDs, locations...' });
  initTopbarEvents($('#topbar-root'));
  initTopbarSearch();
  initFilters();
  initEvents();
  renderTable();
}

document.addEventListener('DOMContentLoaded', initApp);
