const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate, isObjectId } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');
const { listingUpload } = require('../middleware/upload');
const {
    createListing,
    getMyListings,
    getListing,
    updateListing,
    deleteListing,
} = require('../controllers/listingController');

// POST   /api/listings        — create listing (with optional photo uploads)
router.post('/', protect, authorize('business_owner'), listingUpload, validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('price').optional({ checkFalsy: true }).isNumeric().withMessage('Price must be a number'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
]), createListing);

// GET    /api/listings/mine   — all listings for logged-in owner
router.get('/mine', protect, authorize('business_owner'), getMyListings);

// GET    /api/listings/:id    — public, single listing
router.get('/:id', validate([param('id').custom(isObjectId)]), getListing);

// PUT    /api/listings/:id    — update listing (text fields)
router.put('/:id', protect, authorize('business_owner'), validate([
    param('id').custom(isObjectId),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('price').optional({ checkFalsy: true }).isNumeric().withMessage('Price must be a number'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
]), updateListing);

// DELETE /api/listings/:id    — delete listing + photos from disk
router.delete('/:id', protect, authorize('business_owner'), validate([param('id').custom(isObjectId)]), deleteListing);

module.exports = router;

