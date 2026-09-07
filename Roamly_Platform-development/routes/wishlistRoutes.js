const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate, isObjectId } = require('../middleware/validate');

const { toggleWishlist, getMyWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// /mine must come before any /:id routes to avoid collision
router.get('/mine', protect, getMyWishlist);

router.post('/', protect, validate([
    body('itemType').isIn(['spot', 'destination', 'business']).withMessage('Invalid itemType'),
    body('itemId').custom(isObjectId).withMessage('Valid itemId is required')
]), toggleWishlist);


module.exports = router;
