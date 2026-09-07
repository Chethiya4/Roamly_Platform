const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate, isObjectId } = require('../middleware/validate');

const {
    createReview,
    getReviewsForTarget,
    getMyReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getReviewsForTarget);

// Private — /mine must be before /:id to avoid route collision
router.get('/mine', protect, getMyReviews);

// Protected mutations
router.post('/', protect, validate([
    body('targetType').isIn(['spot', 'listing', 'business', 'destination']).withMessage('Invalid targetType'),
    body('targetId').custom(isObjectId).withMessage('Valid targetId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('comment').optional().trim()
]), createReview);

router.put('/:id', protect, validate([
    param('id').custom(isObjectId),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('comment').optional().trim()
]), updateReview);

router.delete('/:id', protect, validate([param('id').custom(isObjectId)]), deleteReview);


module.exports = router;
