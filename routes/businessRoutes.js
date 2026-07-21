const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate, isObjectId } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');
const { businessUpload, businessImageUpload } = require('../middleware/upload');

const {
    getBusinesses,
    getBusinessById,
    registerBusiness,
    getMyBusiness,
    updateMyBusiness,
    updateMyBusinessImages,
    getMyBusinessStats
} = require('../controllers/businessController');

// Optional auth — attaches req.user if a valid Bearer token is present,
// but does NOT reject the request when no token is provided.
// Used for getBusinessById: public for approved, owner/admin for others.
const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        return protect(req, res, next);
    }
    next();
};

// ── Public discovery (/api/businesses) ──────────────────────────────────────
// These are mounted at /api/businesses (plural) in server.js
// Keep them in this file to co-locate all business logic.
router.get('/', getBusinesses);
router.get('/:id', validate([param('id').custom(isObjectId)]), optionalAuth, getBusinessById);

// ── Business registration (public) ──────────────────────────────────────────
// NOTE: businessUpload processes multipart/form-data. express-validator MUST run AFTER it.
router.post('/register', businessUpload, validate([
    body('personalEmail').trim().isEmail().withMessage('Valid personal email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').notEmpty().withMessage('Please confirm your password'),
    body('businessName').trim().notEmpty().withMessage('Business name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('destination').custom(isObjectId).withMessage('Valid destination ID is required'),
    body('ownerFullName').trim().notEmpty().withMessage('Owner full name is required'),
    body('province').trim().notEmpty().withMessage('Province is required'),
    body('district').trim().notEmpty().withMessage('District is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
    body('streetAddress').trim().notEmpty().withMessage('Street address is required'),
    body('businessPhone').trim().notEmpty().withMessage('Business phone is required'),
    body('businessEmail').trim().isEmail().withMessage('Valid business email is required').normalizeEmail(),
    body('priceTier').trim().notEmpty().withMessage('Price tier is required'),
    body('termsAgreed').notEmpty().withMessage('You must agree to the terms')
]), registerBusiness);

// ── Business owner dashboard (protected) ────────────────────────────────────
router.get('/me',        protect, authorize('business_owner'), getMyBusiness);
router.put('/me',        protect, authorize('business_owner'), validate([
    body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('destination').optional().custom(isObjectId).withMessage('Valid destination ID is required'),
    body('businessEmail').optional().trim().isEmail().withMessage('Valid business email is required').normalizeEmail(),
]), updateMyBusiness);
router.put('/me/images', protect, authorize('business_owner'), businessImageUpload, updateMyBusinessImages);
router.get('/me/stats',  protect, authorize('business_owner'), getMyBusinessStats);

module.exports = router;

