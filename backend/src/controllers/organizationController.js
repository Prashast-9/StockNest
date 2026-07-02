const pool = require('../config/db');

// ─────────────────────────────────────────────
// GET /api/organizations
// Returns all organizations ordered by org_id
// ─────────────────────────────────────────────
const getOrganizations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          org_id,
          name,
          subscription_tier,
          created_at
       FROM organization
       ORDER BY org_id ASC`
    );

    return res.status(200).json(result.rows);

  } catch (err) {
    console.error('Organizations error:', err.message);
    return res.status(500).json({ message: 'Failed to load organizations.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/organizations
// Body: { name, subscription_tier }
// ─────────────────────────────────────────────
const createOrganization = async (req, res) => {
  const { name, subscription_tier } = req.body;

  if (!name || !subscription_tier) {
    return res.status(400).json({ message: 'Name and subscription tier are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO organization
       (
           name,
           subscription_tier
       )
       VALUES
       (
           $1,
           $2
       )
       RETURNING
           org_id,
           name,
           subscription_tier,
           created_at`,
      [name, subscription_tier]
    );

    return res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Create organization error:', err.message);
    return res.status(500).json({ message: 'Failed to create organization.' });
  }
};

module.exports = { getOrganizations, createOrganization };
