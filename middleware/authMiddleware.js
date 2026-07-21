const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: protect
 * Purpose: Verifies the JWT token from the Authorization header.
 * If valid, fetches the user from the database and attaches it to req.user.
 * If invalid, missing, or expired, returns a 401 Unauthorized JSON response.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret123');

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }
            if (req.user.active === false) {
                return res.status(401).json({ success: false, message: 'Not authorized, account is deactivated' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

/**
 * Middleware: authorize
 * Purpose: Grants access only to users who have specific roles.
 * Must be used AFTER the `protect` middleware (which sets req.user).
 * If the user's role is not in the allowed roles array, returns a 403 Forbidden JSON response.
 * @param {...String} roles - List of allowed roles (e.g., 'admin', 'business_owner')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
