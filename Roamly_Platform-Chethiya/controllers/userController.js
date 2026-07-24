const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const TouristSpot = require('../models/TouristSpot');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get visitor dashboard data in a single request
//          Returns recent reviews, wishlist entries, and spot submissions.
// @route   GET /api/users/me/dashboard
// @access  Private (any logged-in role)
const getMyDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [reviews, wishlist, spotSubmissions] = await Promise.all([
        // Up to 10 most recent reviews left by this user
        Review.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10),

        // All wishlist entries (getMyWishlist logic, no enrichment here — client can
        // enrich if needed; this keeps the response latency predictable)
        Wishlist.find({ user: userId })
            .sort({ createdAt: -1 }),

        // All spot submissions by this user, any status
        TouristSpot.find({ submittedBy: userId })
            .select('name category status destination photos createdAt')
            .populate('destination', 'name')
            .sort({ createdAt: -1 })
    ]);

    res.status(200).json({
        success: true,
        data: {
            reviews,
            wishlist,
            spotSubmissions
        }
    });
});

module.exports = { getMyDashboard };
