const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedAdmin = require('./scripts/seedAdmin');
const seedDestinations = require('./scripts/seedDestinations');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Production hardening middleware
app.use(helmet({ contentSecurityPolicy: false }));

// Prevent NoSQL injection
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.query) mongoSanitize.sanitize(req.query);
    if (req.headers) mongoSanitize.sanitize(req.headers);
    next();
});

app.use(compression());

// Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets (CSS, JS, Images, Uploads, HTML files)
app.use(express.static(__dirname));

// Handle DB connection and Seeding outside of middleware loop
let isSeeded = false;
const initializeDB = async () => {
    try {
        await connectDB();
        if (!isSeeded) {
            isSeeded = true;
            seedAdmin().catch(console.error);
            seedDestinations().catch(console.error);
        }
    } catch (err) {
        console.error("Database Connection Error:", err);
    }
};
initializeDB();

// Route files
const authRoutes        = require('./routes/authRoutes');
const businessRoutes    = require('./routes/businessRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const listingRoutes     = require('./routes/listingRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const spotRoutes        = require('./routes/touristSpotRoutes');
const reviewRoutes      = require('./routes/reviewRoutes');
const wishlistRoutes    = require('./routes/wishlistRoutes');
const searchRoutes      = require('./routes/searchRoutes');
const userRoutes        = require('./routes/userRoutes');
const tripRoutes        = require('./routes/tripRoutes');
const trackingRoutes    = require('./routes/trackingRoutes');

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        dbState: mongoose.connection.readyState
    });
});

// Mount API routers
app.use('/api/auth',         authRoutes);
app.use('/api/business',     businessRoutes);
app.use('/api/businesses',   businessRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/listings',     listingRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/spots',        spotRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/wishlist',     wishlistRoutes);
app.use('/api/search',       searchRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/trips',        tripRoutes);
app.use('/api/tracking',     trackingRoutes);

// Serve main frontend website UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Global Error Handler Middleware
app.use(errorHandler);

// Only listen locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Roamly Backend Server running on port ${PORT}`);
    });
}

module.exports = app;