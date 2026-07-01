// Sample asset data (plain JavaScript — no JSON file)
var assets = [
  {
    id: 'AST-8821-HM',
    name: 'Herman Miller Aeron',
    location: 'Zone A - Desk 42',
    category: 'Furniture',
    status: 'In Use',
    statusClass: 'status-in-use',
    assignedTo: { name: 'Elena H.', initials: 'EH', color: '#f97316' },
    condition: 92,
    lastChecked: 'Oct 12, 2023',
    icon: '🪑'
  },
  {
    id: 'AST-4410-MB',
    name: 'MacBook Pro 16"',
    location: 'Zone B - Hot Desk 12',
    category: 'Electronics',
    status: 'Available',
    statusClass: 'status-available',
    assignedTo: null,
    condition: 100,
    lastChecked: 'Oct 14, 2023',
    icon: '💻'
  },
  {
    id: 'AST-3302-LM',
    name: 'La Marzocco Linea Mini',
    location: 'Zone C - Kitchen',
    category: 'Amenities',
    status: 'Maintenance',
    statusClass: 'status-maintenance',
    assignedTo: { name: 'Community Team', initials: 'CT', color: '#6366f1' },
    condition: 45,
    lastChecked: 'Sep 28, 2023',
    icon: '☕'
  },
  {
    id: 'AST-1190-HP',
    name: 'HP LaserJet Pro',
    location: 'Zone A - Print Station',
    category: 'Electronics',
    status: 'Low Supplies',
    statusClass: 'status-low-supplies',
    assignedTo: { name: 'Shared Asset', initials: 'SA', color: '#64748b' },
    condition: 68,
    lastChecked: 'Oct 10, 2023',
    icon: '🖨️'
  }
];

function getConditionColor(value) {
  if (value >= 80) return '#16a34a';
  if (value >= 60) return '#ca8a04';
  return '#dc2626';
}

function renderAssignedUser(assignedTo) {
  if (!assignedTo) {
    return '<span class="text-muted">Unassigned</span>';
  }
  return (
    '<div class="assigned-user">' +
      '<span class="assigned-user__avatar" style="background-color:' + assignedTo.color + '">' +
        assignedTo.initials +
      '</span>' +
      assignedTo.name +
    '</div>'
  );
}

function renderRow(asset) {
  var color = getConditionColor(asset.condition);

  return (
    '<tr data-id="' + asset.id + '">' +
      '<td class="col-check"><input type="checkbox" class="row-checkbox" data-id="' + asset.id + '" /></td>' +
      '<td>' +
        '<div class="asset-details">' +
          '<div class="asset-details__thumb">' + asset.icon + '</div>' +
          '<div>' +
            '<div class="asset-details__name">' + asset.name + '</div>' +
            '<div class="asset-details__location">' + asset.location + '</div>' +
          '</div>' +
        '</div>' +
      '</td>' +
      '<td class="text-muted">' + asset.id + '</td>' +
      '<td>' + asset.category + '</td>' +
      '<td><span class="status-badge ' + asset.statusClass + '">' + asset.status + '</span></td>' +
      '<td>' + renderAssignedUser(asset.assignedTo) + '</td>' +
      '<td>' +
        '<div class="condition-bar">' +
          '<div class="condition-bar__track">' +
            '<div class="condition-bar__fill" style="width:' + asset.condition + '%;background-color:' + color + '"></div>' +
          '</div>' +
          '<span class="condition-bar__label" style="color:' + color + '">' + asset.condition + '%</span>' +
        '</div>' +
      '</td>' +
      '<td class="text-muted">' + asset.lastChecked + '</td>' +
      '<td class="col-actions"><button type="button" class="row-action-btn">⋮</button></td>' +
    '</tr>'
  );
}

function renderTable(list) {
  var tbody = document.getElementById('assetTableBody');
  var info = document.getElementById('paginationInfo');

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-muted" style="text-align:center;padding:32px">No assets found.</td></tr>';
  } else {
    tbody.innerHTML = list.map(renderRow).join('');
  }

  info.textContent = 'Showing 1 to ' + list.length + ' of 1,428 entries';
  document.getElementById('selectAll').checked = false;
}

function filterAssets(query) {
  var q = query.toLowerCase().trim();
  if (!q) return assets;

  return assets.filter(function (asset) {
    var assigned = asset.assignedTo ? asset.assignedTo.name : 'Unassigned';
    return (
      asset.name.toLowerCase().indexOf(q) !== -1 ||
      asset.id.toLowerCase().indexOf(q) !== -1 ||
      assigned.toLowerCase().indexOf(q) !== -1
    );
  });
}

// Initial render
renderTable(assets);

// Filter input
document.getElementById('filterInput').addEventListener('input', function (e) {
  renderTable(filterAssets(e.target.value));
});

// Select all checkbox
document.getElementById('selectAll').addEventListener('change', function (e) {
  var checked = e.target.checked;
  var boxes = document.querySelectorAll('.row-checkbox');
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].checked = checked;
  }
});
