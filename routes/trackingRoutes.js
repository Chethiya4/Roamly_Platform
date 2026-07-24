const express = require('express');
const router  = express.Router();
const { sendHeartbeat, getLiveTrackingStats } = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public / client heartbeat endpoint
router.post('/heartbeat', sendHeartbeat);

// Admin-only live tracking endpoint
router.get('/live', protect, authorize('admin'), getLiveTrackingStats);

module.exports = router;
