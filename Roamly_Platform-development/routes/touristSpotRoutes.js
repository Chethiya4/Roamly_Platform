const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate, isObjectId } = require('../middleware/validate');

const {
    getSpots,
    getSpotById,
    createSpot,
    getMySpots,
    updateSpot,
    deleteSpot
} = require('../controllers/touristSpotController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { spotUpload } = require('../middleware/upload');

// Optional auth middleware — attaches req.user IF a valid token is present,
// but does NOT reject the request if no token is provided.
// This is used for getSpotById, which is public for approved spots but
// restricts pending/rejected spots to the submitter or admin.
const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        return protect(req, res, next);
    }
    next(); // no token → continue with req.user = undefined
};

// Public routes
router.get('/', getSpots);

// Private: must come before /:id so "mine" isn't treated as an ObjectId
router.get('/mine', protect, getMySpots);

// Conditionally authenticated: works with or without a token
router.get('/:id', validate([param('id').custom(isObjectId)]), optionalAuth, getSpotById);

// Admin-only routes for spot management
// Note: spotUpload comes before validate because it processes multipart form data
router.post('/', protect, authorize('admin'), spotUpload, validate([
    body('destination').custom(isObjectId).withMessage('Valid destination ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required')
]), createSpot);

router.put('/:id', protect, authorize('admin'), validate([
    param('id').custom(isObjectId)
]), updateSpot);

router.delete('/:id', protect, authorize('admin'), validate([param('id').custom(isObjectId)]), deleteSpot);

module.exports = router;

