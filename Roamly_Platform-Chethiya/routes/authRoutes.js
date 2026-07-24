const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { registerUser, loginUser, getMe, updateMe, logoutUser } = require('../controllers/authController');
const { getGoogleClientId, googleLogin } = require('../controllers/oauthController');
const { protect } = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/register', authLimiter, validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), registerUser);

router.post('/login', authLimiter, validate([
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
]), loginUser);

router.get('/me', protect, getMe);

router.put('/me', protect, validate([
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty if provided'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), updateMe);

router.post('/logout', protect, logoutUser);

router.get('/google-client-id', getGoogleClientId);
router.post('/google', googleLogin);
module.exports = router;

