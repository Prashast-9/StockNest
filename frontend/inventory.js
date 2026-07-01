/**
 * StockNest — Inventory Management (Consumables) Page
 */

import { renderSidebar, initSidebarNav } from './components/sidebar.js';
import { renderTopbar, initTopbarEvents } from './components/topbar.js';

/* Sample consumables data */
var consumables = [
  {
    id: 'PPR-A4-500',
    name: 'Premium Printer Paper, A4',
    category: 'Office Supplies',
    stock: '12 Reams',
    minStock: 20,
    status: 'Low Stock',
    statusClass: 'status-pill--low',
    critical: false
  },
  {
    id: 'WBM-BLK-004',
    name: 'Whiteboard Markers (Set of 4)',
    category: 'Stationery',
    stock: '45 Boxes',
    minStock: 10,
    status: 'Healthy',
    statusClass: 'status-pill--healthy',
    critical: false
  },
  {
    id: 'CFB-ESP-104',
    name: 'Coffee Beans (1kg)',
    category: 'Pantry',
    stock: '2 kg',
    minStock: 5,
    status: 'Critical',
    statusClass: 'status-pill--critical',
    critical: true
  },
  {
    id: 'TBG-HD-100',
    name: 'Trash Bags (Heavy Duty)',
    category: 'Cleaning',
    stock: '120 Rolls',
    minStock: 50,
    status: 'Healthy',
    statusClass: 'status-pill--healthy',
    critical: false
  }
];

function buildRow(item) {
  var rowClass = item.critical ? ' row--critical' : '';

  return (
    '<tr class="' + rowClass.trim() + '" data-id="' + item.id + '">' +
      '<td class="col-check"><input type="checkbox" class="row-check" data-id="' + item.id + '" /></td>' +
      '<td>' +
        '<div class="item-cell__name">' + item.name + '</div>' +
        '<div class="item-cell__sku">' + item.id + '</div>' +
      '</td>' +
      '<td><span class="category-pill">' + item.category + '</span></td>' +
      '<td>' +
        '<div class="stock-cell__qty">' + item.stock + '</div>' +
        '<div class="stock-cell__min">Min: ' + item.minStock + '</div>' +
      '</td>' +
      '<td><span class="status-pill ' + item.statusClass + '">' + item.status + '</span></td>' +
    '</tr>'
  );
}

function renderTable(list) {
  var tbody = document.getElementById('consumablesBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:#64748b">No items found.</td></tr>';
  } else {
    tbody.innerHTML = list.map(buildRow).join('');
  }

  var selectAll = document.getElementById('selectAll');
  if (selectAll) selectAll.checked = false;
}

function filterItems(text) {
  var q = text.toLowerCase().trim();
  if (!q) return consumables;

  return consumables.filter(function (item) {
    return (
      item.name.toLowerCase().indexOf(q) !== -1 ||
      item.id.toLowerCase().indexOf(q) !== -1 ||
      item.category.toLowerCase().indexOf(q) !== -1 ||
      item.status.toLowerCase().indexOf(q) !== -1
    );
  });
}

function initTableFilter() {
  var input = document.getElementById('tableFilter');
  if (!input) return;

  input.addEventListener('input', function (e) {
    renderTable(filterItems(e.target.value));
  });
}

function initSelectAll() {
  var selectAll = document.getElementById('selectAll');
  if (!selectAll) return;

  selectAll.addEventListener('change', function (e) {
    var boxes = document.querySelectorAll('.row-check');
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].checked = e.target.checked;
    }
  });
}

function initHeaderButtons() {
  var filterBtn = document.getElementById('filterBtn');
  var exportBtn = document.getElementById('exportBtn');

  if (filterBtn) {
    filterBtn.addEventListener('click', function () {
      var input = document.getElementById('tableFilter');
      if (input) input.focus();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      alert('Export clicked — this would download a CSV in a real app.');
    });
  }
}

function initPurchaseOrder() {
  var btn = document.getElementById('purchaseOrderBtn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    alert('Purchase order generated for Coffee Beans (CFB-ESP-104).');
  });
}

function initRegisterForm() {
  var form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('itemName').value.trim();
    var category = document.getElementById('itemCategory').value;
    var minStock = document.getElementById('minStock').value;

    if (!name) {
      alert('Please enter an item name.');
      return;
    }

    alert('Registered: ' + name + ' (' + (category || 'No category') + ')');
    form.reset();
  });
}

function initApp() {
  var sidebarRoot = document.getElementById('sidebar-root');
  var topbarRoot = document.getElementById('topbar-root');

  renderSidebar(sidebarRoot, { activeItem: 'inventory-management' });
  initSidebarNav(sidebarRoot);

  renderTopbar(topbarRoot, {
    searchPlaceholder: 'Search inventory, SKUs, or locations... (Cmd+K)'
  });
  initTopbarEvents(topbarRoot);

  renderTable(consumables);
  initTableFilter();
  initSelectAll();
  initHeaderButtons();
  initPurchaseOrder();
  initRegisterForm();
}

document.addEventListener('DOMContentLoaded', initApp);
