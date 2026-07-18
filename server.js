const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const connectDB = require('./config/db');

// Import Models
const User = require('./models/User');
const Destination = require('./models/Destination');
const TouristSpot = require('./models/TouristSpot');
const Business = require('./models/Business');
const Listing = require('./models/Listing');
const Review = require('./models/Review');
const Wishlist = require('./models/Wishlist');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Multer setup using memory storage (we are not saving files to disk since there's no DB requirement)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// ==========================================
// UPDATED EXISTING ENDPOINTS (Smoke test integrated)
// ==========================================

// API Endpoint for Business Registration
app.post('/api/register', upload.any(), async (req, res) => {
    try {
        const { business_name, business_category, business_description, owner_full_name, personal_email_address } = req.body;
        
        // 1. Create or find User
        let user = await User.findOne({ email: personal_email_address || 'dummy@example.com' });
        if (!user) {
            user = new User({
                name: owner_full_name || 'Anonymous Owner',
                email: personal_email_address || `dummy_${Date.now()}@example.com`,
                password: 'defaultPassword123',
                role: 'business_owner'
            });
            await user.save();
        }

        // 2. Create Business
        let category = 'stay';
        if (business_category) {
            const catMap = { 'Hotel': 'stay', 'Rental': 'rental', 'Restaurant': 'food', 'TourGuide': 'tour' };
            category = catMap[business_category] || 'stay';
        }

        const business = new Business({
            owner: user._id,
            name: business_name || 'Unnamed Business',
            category: category,
            description: business_description || 'No description provided.',
            status: 'pending'
        });
        await business.save();

        res.json({ success: true, message: 'Business Registration submitted and saved to Database successfully!', data: business });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// API Endpoint for Planning
app.post('/api/plan', upload.none(), async (req, res) => {
    try {
        // Read from TouristSpot model to suggest destinations
        const spots = await TouristSpot.find().populate('destination');
        
        res.json({ 
            success: true, 
            message: `Your personalized itinerary has been generated based on ${spots.length} available spots in the database!`,
            data: spots
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// API Endpoint for Review/Recommendation
app.post('/api/review', upload.none(), async (req, res) => {
    try {
        const { name, text, rating } = req.body;
        
        let user = await User.findOne({ email: 'reviewer@example.com' });
        if (!user) {
            user = new User({
                name: name || 'Anonymous Reviewer',
                email: 'reviewer@example.com',
                password: 'defaultPassword123',
                role: 'visitor'
            });
            await user.save();
        }

        // Dummy targetId for the smoke test
        const dummyTargetId = new mongoose.Types.ObjectId();

        const review = new Review({
            user: user._id,
            targetId: dummyTargetId,
            targetType: 'spot',
            rating: rating || 5,
            comment: text || 'No comment.'
        });
        await review.save();

        res.json({ success: true, message: 'Thank you for your review! Saved to Database.', data: review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});


// ==========================================
// BASIC CRUD ENDPOINTS FOR ALL MODELS (Smoke tests)
// ==========================================

// --- USERS ---
app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- DESTINATIONS ---
app.post('/api/destinations', async (req, res) => {
    try {
        const dest = new Destination(req.body);
        await dest.save();
        res.status(201).json(dest);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.get('/api/destinations', async (req, res) => {
    try {
        const dests = await Destination.find().populate('createdByAdmin');
        res.json(dests);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TOURIST SPOTS ---
app.post('/api/tourist-spots', async (req, res) => {
    try {
        const spot = new TouristSpot(req.body);
        await spot.save();
        res.status(201).json(spot);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.get('/api/tourist-spots', async (req, res) => {
    try {
        const spots = await TouristSpot.find().populate('destination submittedBy');
        res.json(spots);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- BUSINESSES ---
app.post('/api/businesses', async (req, res) => {
    try {
        const business = new Business(req.body);
        await business.save();
        res.status(201).json(business);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.get('/api/businesses', async (req, res) => {
    try {
        const businesses = await Business.find().populate('owner destination');
        res.json(businesses);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- LISTINGS ---
app.post('/api/listings', async (req, res) => {
    try {
        const listing = new Listing(req.body);
        await listing.save();
        res.status(201).json(listing);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.get('/api/listings', async (req, res) => {
    try {
        const listings = await Listing.find().populate('business');
        res.json(listings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- REVIEWS ---
app.post('/api/reviews', async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json(review);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().populate('user');
        res.json(reviews);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- WISHLISTS ---
app.post('/api/wishlists', async (req, res) => {
    try {
        const wishlist = new Wishlist(req.body);
        await wishlist.save();
        res.status(201).json(wishlist);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.get('/api/wishlists', async (req, res) => {
    try {
        const wishlists = await Wishlist.find().populate('user spot');
        res.json(wishlists);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// Connect to DB and then start server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Roamly Backend Server running at http://localhost:${port}`);
        console.log(`Serving static files from: ${__dirname}`);
    });
});
