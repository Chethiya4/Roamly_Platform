const User        = require('../models/User');
const Business    = require('../models/Business');
const TouristSpot = require('../models/TouristSpot');
const Destination = require('../models/Destination');
const Review      = require('../models/Review');
const asyncHandler       = require('../utils/asyncHandler');
const updateRatingStats  = require('../utils/updateRatingStats');
const trackingManager    = require('../utils/trackingManager');

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS (already existed — preserved verbatim)
// ─────────────────────────────────────────────────────────────────────────────

// @desc    List businesses (optionally filtered by status)
// @route   GET /api/admin/businesses?status=pending|approved|rejected
// @access  Private (admin)
const listBusinesses = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [businesses, totalItems] = await Promise.all([
        Business.find(filter)
            .populate('owner', 'name email')
            .populate('destination', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Business.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: businesses,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Approve a business
// @route   PUT /api/admin/businesses/:id/approve
// @access  Private (admin)
const approveBusiness = asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

    business.status = 'approved';
    business.rejectionReason = undefined;
    await business.save();

    res.status(200).json({ success: true, data: business, message: 'Business approved successfully' });
});

// @desc    Reject a business
// @route   PUT /api/admin/businesses/:id/reject
// @access  Private (admin)
const rejectBusiness = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });

    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

    business.status = 'rejected';
    business.rejectionReason = reason;
    await business.save();

    res.status(200).json({ success: true, data: business, message: 'Business rejected' });
});

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW STATS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Platform-wide admin stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getAdminStats = asyncHandler(async (req, res) => {
    const [
        usersByRole,
        businessesByStatus,
        businessesByCategory,
        spotsByStatus,
        totalDestinations,
        totalReviews
    ] = await Promise.all([
        User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        Business.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Business.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        TouristSpot.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Destination.countDocuments(),
        Review.countDocuments()
    ]);

    // Flatten aggregation arrays into plain objects for easy frontend consumption
    const pivot = (arr) => arr.reduce((acc, { _id, count }) => { acc[_id] = count; return acc; }, {});

    const liveStats = trackingManager.getLiveStats();

    res.status(200).json({
        success: true,
        data: {
            totalUsers:           usersByRole,          // [{_id:'visitor',count:N}, ...]
            usersByRole:          pivot(usersByRole),
            totalBusinesses:      businessesByStatus,
            businessesByStatus:   pivot(businessesByStatus),
            businessesByCategory: pivot(businessesByCategory),
            totalSpots:           spotsByStatus,
            spotsByStatus:        pivot(spotsByStatus),
            totalDestinations,
            totalReviews,
            liveTracking:         liveStats
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @desc    List all users, paginated, filter by ?role=
// @route   GET /api/admin/users
// @access  Private (admin)
const listUsers = asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [users, totalItems] = await Promise.all([
        User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: users,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Change a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin)
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const VALID_ROLES = ['visitor', 'business_owner', 'admin'];
    if (!VALID_ROLES.includes(role)) {
        res.status(400);
        throw new Error(`role must be one of: ${VALID_ROLES.join(', ')}`);
    }

    const target = await User.findById(req.params.id).select('-password');
    if (!target) {
        res.status(404);
        throw new Error('User not found');
    }

    // Guard: refuse to demote the last remaining admin
    if (target.role === 'admin' && role !== 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount === 1) {
            res.status(400);
            throw new Error(
                'Cannot demote the last admin account. Promote another user to admin first.'
            );
        }
    }

    target.role = role;
    await target.save();

    res.status(200).json({
        success: true,
        data: target,
        message: `User role updated to "${role}"`
    });
});

// @desc    Soft-deactivate a user (active: false)
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private (admin)
const deactivateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) { res.status(404); throw new Error('User not found'); }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot deactivate your own account');
    }

    user.active = false;
    await user.save();

    res.status(200).json({ success: true, data: user, message: 'User deactivated' });
});

// @desc    Reactivate a user (active: true)
// @route   PUT /api/admin/users/:id/reactivate
// @access  Private (admin)
const reactivateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) { res.status(404); throw new Error('User not found'); }

    user.active = true;
    await user.save();

    res.status(200).json({ success: true, data: user, message: 'User reactivated' });
});

// ─────────────────────────────────────────────────────────────────────────────
// TOURIST SPOT MODERATION
// ─────────────────────────────────────────────────────────────────────────────

// @desc    List tourist spots, filter by ?status=
// @route   GET /api/admin/spots?status=pending
// @access  Private (admin)
const listSpotsForApproval = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [spots, totalItems] = await Promise.all([
        TouristSpot.find(filter)
            .populate('submittedBy', 'name email')
            .populate('destination', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        TouristSpot.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: spots,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Approve a tourist spot
// @route   PUT /api/admin/spots/:id/approve
// @access  Private (admin)
const approveSpot = asyncHandler(async (req, res) => {
    const spot = await TouristSpot.findById(req.params.id);
    if (!spot) { res.status(404); throw new Error('Spot not found'); }

    spot.status = 'approved';
    spot.rejectionReason = undefined;
    await spot.save();

    res.status(200).json({ success: true, data: spot, message: 'Tourist spot approved' });
});

// @desc    Reject a tourist spot
// @route   PUT /api/admin/spots/:id/reject
// @access  Private (admin)
const rejectSpot = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) { res.status(400); throw new Error('Rejection reason is required'); }

    const spot = await TouristSpot.findById(req.params.id);
    if (!spot) { res.status(404); throw new Error('Spot not found'); }

    spot.status = 'rejected';
    spot.rejectionReason = reason;
    await spot.save();

    res.status(200).json({ success: true, data: spot, message: 'Tourist spot rejected' });
});

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW MODERATION
// ─────────────────────────────────────────────────────────────────────────────

// @desc    List all reviews for moderation, paginated
// @route   GET /api/admin/reviews
// @access  Private (admin)
const listReviewsForModeration = asyncHandler(async (req, res) => {
    const { page = 1, limit = 30 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [reviews, totalItems] = await Promise.all([
        Review.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Review.countDocuments()
    ]);

    res.status(200).json({
        success: true,
        data: reviews,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Delete a review as admin (also recalculates rating stats)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (admin)
const deleteReviewAsAdmin = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) { res.status(404); throw new Error('Review not found'); }

    const { targetType, targetId } = review;
    await Review.findByIdAndDelete(review._id);

    // Recalculate denormalized stats on the reviewed entity
    await updateRatingStats(targetType, targetId);

    res.status(200).json({
        success: true,
        data: {},
        message: 'Review deleted and rating stats updated'
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    // Business
    listBusinesses,
    approveBusiness,
    rejectBusiness,
    // Stats
    getAdminStats,
    // Users
    listUsers,
    updateUserRole,
    deactivateUser,
    reactivateUser,
    // Spots
    listSpotsForApproval,
    approveSpot,
    rejectSpot,
    // Reviews
    listReviewsForModeration,
    deleteReviewAsAdmin
};
