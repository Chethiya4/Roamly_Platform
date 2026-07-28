const dotenv = require('dotenv');

// Initialize dotenv so that process.env is populated before we export
dotenv.config();

const config = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
    
    // Admin Seed Config
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    
    // Placeholders for future environment variables
    // STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
};

module.exports = config;
