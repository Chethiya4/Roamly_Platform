/**
 * middleware/validate.js
 *
 * Shared helper that runs express-validator validation chains and short-circuits
 * the request with a 400 in the standard Roamly error envelope if any fail.
 *
 * Usage in a route file:
 *   const { validate, isObjectId } = require('../middleware/validate');
 *   const { body, param } = require('express-validator');
 *
 *   router.post('/', validate([
 *       body('email').isEmail().withMessage('Valid email required'),
 *       body('name').trim().notEmpty().withMessage('Name is required'),
 *   ]), myController);
 */

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * validate(chains)
 * Accepts an array of express-validator chains.
 * Returns an Express middleware array: [...chains, errorCollector].
 */
const validate = (chains) => [
    ...chains,
    (req, res, next) => {
        const result = validationResult(req);
        if (result.isEmpty()) return next();

        const errors = result.array().map(e => ({
            field:   e.path || e.param || 'unknown',
            message: e.msg
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
];

/**
 * isObjectId(value)
 * Custom express-validator validator that checks whether a string is a valid
 * MongoDB ObjectId. Use with .custom(isObjectId).
 */
const isObjectId = (value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ObjectId format');
    }
    return true;
};

module.exports = { validate, isObjectId };
