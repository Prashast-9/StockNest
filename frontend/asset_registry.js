(function () {
  'use strict';

  // 1. Authentication Check
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userString = localStorage.getItem('user') || sessionStorage.getItem('user');

  if (!token) {
    console.warn('No authentication token found. Redirecting to login...');
    window.location.href = 'index.html';
    return;
  }

  // Set user profile info if available
  if (userString) {
    try {
      const user = JSON.parse(userString);
      const nameEl = document.querySelector('.topbar__profile-name');
      const avatarEl = document.querySelector('.topbar__avatar');
      if (nameEl) nameEl.textContent = user.name || 'User';
      if (avatarEl && user.name) avatarEl.textContent = user.name[0].toUpperCase();
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  // State
  let assets = [];
  const BACKEND_URL = 'http://localhost:5000/api';

  // 2. Fetch Assets from Backend
  async function fetchAssets() {
    try {
      const response = await fetch(`${BACKEND_URL}/assets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          alert('Session expired. Please log in again.');
          window.location.href = 'index.html';
          return;
        }
        throw new Error('Failed to fetch assets from server.');
      }

      const data = await response.json();
      
      // Map backend schema to frontend table structure
      assets = data.assets.map(a => {
        let statusClass = 'status-available';
        if (a.status === 'In-Maintenance') statusClass = 'status-maintenance';
        if (a.status === 'Damaged' || a.status === 'Retired') statusClass = 'status-low-supplies';

        return {
          dbId: a.asset_id, // keep actual database serial ID
          id: `AST-${String(a.asset_id).padStart(4, '0')}`,
          name: a.name,
          location: 'Floor 3 - Main Zone', // default
          category: 'Furniture', // default
          status: a.status,
          statusClass: statusClass,
          assignedTo: null,
          condition: a.condition_level,
          lastChecked: a.last_service_date ? new Date(a.last_service_date).toLocaleDateString() : 'Never',
          icon: a.name.toLowerCase().includes('chair') || a.name.toLowerCase().includes('seating') ? '🪑' : 
                (a.name.toLowerCase().includes('desk') || a.name.toLowerCase().includes('table') ? '📂' : '💻')
        };
      });

      renderTable(assets);
      updateSummaryStats();

    } catch (err) {
      console.error('Error fetching assets:', err);
      alert(err.message || 'Error connecting to backend API.');
    }
  }

  // 3. Update Summary Info Cards
  function updateSummaryStats() {
    const totalEl = document.getElementById('totalAssets');
    if (totalEl) {
      totalEl.textContent = assets.length.toLocaleString();
    }
  }

  // Helper colors
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

  // 4. Render Table Row Markup
  function renderRow(asset) {
    var color = getConditionColor(asset.condition);

    return (
      '<tr data-id="' + asset.dbId + '">' +
        '<td class="col-check"><input type="checkbox" class="row-checkbox" data-id="' + asset.dbId + '" /></td>' +
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
        '<td class="col-actions">' +
          '<button type="button" class="btn btn--outline btn--sm delete-btn" data-id="' + asset.dbId + '" style="color:#dc2626; border-color:#fca5a5; padding: 4px 8px; font-size: 12px; cursor: pointer;">Delete</button>' +
        '</td>' +
      '</tr>'
    );
  }

  function renderTable(list) {
    var tbody = document.getElementById('assetTableBody');
    var info = document.getElementById('paginationInfo');

    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-muted" style="text-align:center;padding:32px">No assets found. Click "+ Add New Asset" to create one!</td></tr>';
    } else {
      tbody.innerHTML = list.map(renderRow).join('');
    }

    if (info) {
      info.textContent = 'Showing 1 to ' + list.length + ' of ' + list.length + ' entries';
    }
    const selectAll = document.getElementById('selectAll');
    if (selectAll) selectAll.checked = false;

    // Bind event listeners to newly created delete buttons
    const deleteBtns = tbody.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        deleteAsset(id);
      });
    });
  }

  function filterAssets(query) {
    var q = query.toLowerCase().trim();
    if (!q) return assets;

    return assets.filter(function (asset) {
      return (
        asset.name.toLowerCase().indexOf(q) !== -1 ||
        asset.id.toLowerCase().indexOf(q) !== -1 ||
        asset.status.toLowerCase().indexOf(q) !== -1
      );
    });
  }

  // 5. Create Asset
  async function createAsset(name, conditionLevel, currentValue) {
    try {
      const response = await fetch(`${BACKEND_URL}/assets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          condition_level: parseInt(conditionLevel, 10) || 100,
          current_value: parseFloat(currentValue) || 0,
          status: 'Active'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create asset.');
      }

      alert('Asset created successfully!');
      fetchAssets(); // Refresh table

    } catch (err) {
      console.error('Error creating asset:', err);
      alert(err.message);
    }
  }

  // 6. Delete Asset
  async function deleteAsset(id) {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/assets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete asset.');
      }

      alert('Asset deleted successfully!');
      fetchAssets(); // Refresh table

    } catch (err) {
      console.error('Error deleting asset:', err);
      alert(err.message);
    }
  }

  // Bind UI Events
  function init() {
    // Initial fetch
    fetchAssets();

    // Filter input
    const filterInput = document.getElementById('filterInput');
    if (filterInput) {
      filterInput.addEventListener('input', function (e) {
        renderTable(filterAssets(e.target.value));
      });
    }

    // Select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
      selectAll.addEventListener('change', function (e) {
        var checked = e.target.checked;
        var boxes = document.querySelectorAll('.row-checkbox');
        for (var i = 0; i < boxes.length; i++) {
          boxes[i].checked = checked;
        }
      });
    }

    // Add New Asset Button
    const addAssetBtn = document.getElementById('addAssetBtn');
    if (addAssetBtn) {
      addAssetBtn.addEventListener('click', () => {
        const name = prompt('Enter Asset Name:');
        if (!name || !name.trim()) return;

        const condition = prompt('Enter Condition Level (0-100):', '100');
        const value = prompt('Enter Current Value (₹):', '1000');

        createAsset(name, condition, value);
      });
    }
  }

  // Run on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
