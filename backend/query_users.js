const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'Stocknest',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Samaira@1011',
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT user_id, name, email, role, org_id, created_at FROM users');
    console.log('👥 Current Users in Database:\n');
    console.table(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
