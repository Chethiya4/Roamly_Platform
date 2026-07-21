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
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Production hardening middleware
app.use(helmet({ contentSecurityPolicy: false })); // Sets secure HTTP headers, CSP disabled to allow inline scripts/fonts

// Prevent NoSQL injection manually to avoid Express 5 req.query read-only error
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.query) mongoSanitize.sanitize(req.query);
    if (req.headers) mongoSanitize.sanitize(req.headers);
    next();
});

app.use(compression()); // Compress response bodies

// Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}
// TODO: Lock CORS to a specific origin before real deployment
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

// Mount routers
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        dbState: mongoose.connection.readyState
    });
});

app.use('/api/auth',         authRoutes);
app.use('/api/business',     businessRoutes);   // owner dashboard + register
app.use('/api/businesses',   businessRoutes);   // public discovery (plural — ARCHITECTURE.md convention)
app.use('/api/admin',        adminRoutes);
app.use('/api/listings',     listingRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/spots',        spotRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/wishlist',     wishlistRoutes);
app.use('/api/search',       searchRoutes);
app.use('/api/users',        userRoutes);

// Serve static frontend files
app.use(express.static(__dirname));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Roamly Backend Server running on port ${PORT}`);
});
