const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate, isObjectId } = require('../middleware/validate');

const {
    getDestinations,
    getDestinationById,
    getDestinationByName,
    createDestination,
    updateDestination,
    deleteDestination
} = require('../controllers/destinationController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getDestinations);

// IMPORTANT: /by-name/:name must come BEFORE /:id to avoid "by-name" being
// interpreted as a Mongo ObjectId
router.get('/by-name/:name', getDestinationByName);

router.get('/:id', validate([param('id').custom(isObjectId)]), getDestinationById);

// Admin-only routes
router.post('/',    protect, authorize('admin'), validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('province').trim().notEmpty().withMessage('Province is required')
]), createDestination);

router.put('/:id',  protect, authorize('admin'), validate([
    param('id').custom(isObjectId),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('province').optional().trim().notEmpty().withMessage('Province cannot be empty')
]), updateDestination);

router.delete('/:id', protect, authorize('admin'), validate([param('id').custom(isObjectId)]), deleteDestination);


module.exports = router;
