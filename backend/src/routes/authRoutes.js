const express = require('express');
const router  = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { verifyToken, checkRole }  = require('../middleware/authMiddleware');

// POST /api/auth/register  — only Admins can create new users
router.post('/register', verifyToken, checkRole('Admin'), register);

// POST /api/auth/login  — public
router.post('/login', login);

// GET  /api/auth/me  — any logged-in user can get their own info
router.get('/me', verifyToken, getMe);

module.exports = router;
