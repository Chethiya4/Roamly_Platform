const express = require('express');
const router  = express.Router();
const { body, param } = require('express-validator');
const { validate, isObjectId } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');

const {
    // Business
    listBusinesses, approveBusiness, rejectBusiness,
    // Stats
    getAdminStats,
    // Users
    listUsers, updateUserRole, deactivateUser, reactivateUser,
    // Spots
    listSpotsForApproval, approveSpot, rejectSpot,
    // Reviews
    listReviewsForModeration, deleteReviewAsAdmin
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// ── Overview ──────────────────────────────────────────────────────────────────
router.get('/stats', getAdminStats);

// ── Businesses ────────────────────────────────────────────────────────────────
router.get('/businesses',             listBusinesses);
router.put('/businesses/:id/approve', validate([param('id').custom(isObjectId)]), approveBusiness);
router.put('/businesses/:id/reject',  validate([
    param('id').custom(isObjectId),
    body('reason').trim().notEmpty().withMessage('Rejection reason is required')
]), rejectBusiness);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',                listUsers);
router.put('/users/:id/role',       validate([
    param('id').custom(isObjectId),
    body('role').isIn(['visitor', 'business_owner', 'admin']).withMessage('Invalid role')
]), updateUserRole);
router.put('/users/:id/deactivate', validate([param('id').custom(isObjectId)]), deactivateUser);
router.put('/users/:id/reactivate', validate([param('id').custom(isObjectId)]), reactivateUser);

// ── Tourist Spots ─────────────────────────────────────────────────────────────
router.get('/spots',              listSpotsForApproval);
router.put('/spots/:id/approve',  validate([param('id').custom(isObjectId)]), approveSpot);
router.put('/spots/:id/reject',   validate([
    param('id').custom(isObjectId),
    body('reason').trim().notEmpty().withMessage('Rejection reason is required')
]), rejectSpot);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/reviews',         listReviewsForModeration);
router.delete('/reviews/:id',  validate([param('id').custom(isObjectId)]), deleteReviewAsAdmin);

module.exports = router;

