const express = require('express');
const router  = express.Router();

const { register, login, getMe, googleLogin } = require('../controllers/authController');
const { verifyToken, checkRole }  = require('../middleware/authMiddleware');

// POST /api/auth/register  — only Admins can create new users
router.post('/register', verifyToken, checkRole('Admin'), register);

// POST /api/auth/login  — public
router.post('/login', login);

// POST /api/auth/google  — public
router.post('/google', googleLogin);

// GET  /api/auth/me  — any logged-in user can get their own info
router.get('/me', verifyToken, getMe);

module.exports = router;
