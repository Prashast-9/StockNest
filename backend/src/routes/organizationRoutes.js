const express = require('express');
const router  = express.Router();

const { getOrganizations, createOrganization } = require('../controllers/organizationController');

// GET /api/organizations
router.get('/', getOrganizations);

// POST /api/organizations
router.post('/', createOrganization);

module.exports = router;
