const express = require('express');
const router = express.Router();
const { getMyDashboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/me/dashboard
router.get('/me/dashboard', protect, getMyDashboard);

module.exports = router;
