const express = require('express');
const { sendMessage, getThread } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:businessId', protect, getThread);

module.exports = router;
