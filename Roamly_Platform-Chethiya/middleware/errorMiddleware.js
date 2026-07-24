const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    let errors = undefined; // For validation error arrays

    // Handle Multer-specific errors (file size, type, count)
    if (err instanceof multer.MulterError) {
        statusCode = 400;
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File too large. Maximum allowed size exceeded.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files uploaded.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = `Invalid file type or unexpected field: ${err.field || 'unknown'}`;
                break;
            default:
                message = err.message;
        }
    }

    // Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found. Invalid: ${err.path}`;
    }

    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errorMessages = Object.values(err.errors).map(val => val.message);
        message = `Validation failed: ${errorMessages.join(', ')}`;
        errors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
    }

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern)[0];
        // Special case: capitalize field name nicely
        const niceField = field.charAt(0).toUpperCase() + field.slice(1);
        message = `${niceField} already exists`;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Not authorized, invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Not authorized, token expired';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
