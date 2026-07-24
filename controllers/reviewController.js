const mongoose = require('mongoose');
const Review = require('../models/Review');
const Business = require('../models/Business');
const TouristSpot = require('../models/TouristSpot');
const Destination = require('../models/Destination');
const Listing = require('../models/Listing');
const asyncHandler = require('../utils/asyncHandler');
const updateRatingStats = require('../utils/updateRatingStats');

// ── Helper: resolve target document by type and id ────────────────────────────
const resolveTarget = async (targetType, targetId) => {
    switch (targetType) {
        case 'spot':        return TouristSpot.findById(targetId);
        case 'business':    return Business.findById(targetId);
        case 'destination': return Destination.findById(targetId);
        case 'listing':     return Listing.findById(targetId);
        default:            return null;
    }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (any logged-in role)
const createReview = asyncHandler(async (req, res) => {
    const { targetType, targetId, rating, comment } = req.body;

    const VALID_TYPES = ['spot', 'listing', 'business', 'destination'];
    if (!VALID_TYPES.includes(targetType)) {
        res.status(400);
        throw new Error(`targetType must be one of: ${VALID_TYPES.join(', ')}`);
    }

    if (!targetId || !rating) {
        res.status(400);
        throw new Error('targetId and rating are required');
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        res.status(400);
        throw new Error('Invalid targetId format');
    }

    // Resolve target document
    const target = await resolveTarget(targetType, targetId);
    if (!target) {
        res.status(404);
        throw new Error(`${targetType} with id "${targetId}" not found`);
    }

    // Spot and Business must be approved before they can be reviewed
    if ((targetType === 'spot' || targetType === 'business') && target.status !== 'approved') {
        res.status(400);
        throw new Error(`You can only review an approved ${targetType}`);
    }

    // Create the review — the compound unique index catches duplicates
    try {
        const review = await Review.create({
            user:       req.user._id,
            targetType,
            targetId:   new mongoose.Types.ObjectId(targetId),
            rating:     Number(rating),
            comment
        });

        // Recalculate denormalized stats on the target (no-op for 'listing')
        await updateRatingStats(targetType, new mongoose.Types.ObjectId(targetId));

        const populated = await review.populate('user', 'name');

        res.status(201).json({
            success: true,
            data: populated,
            message: 'Review submitted successfully'
        });
    } catch (err) {
        // MongoDB duplicate-key error code
        if (err.code === 11000) {
            res.status(409);
            throw new Error(
                'You have already reviewed this item. Edit your existing review instead.'
            );
        }
        throw err;
    }
});

// @desc    Get reviews for a specific target (paginated)
// @route   GET /api/reviews?targetType=&targetId=
// @access  Public
const getReviewsForTarget = asyncHandler(async (req, res) => {
    const { targetType, targetId, page = 1, limit = 20 } = req.query;

    if (!targetType || !targetId) {
        res.status(400);
        throw new Error('targetType and targetId query params are required');
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId)
    };

    const [reviews, totalItems] = await Promise.all([
        Review.find(filter)
            .populate('user', 'name')   // name only, never email
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Review.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: reviews,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Get logged-in user's own reviews
// @route   GET /api/reviews/mine
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };

    const [reviews, totalItems] = await Promise.all([
        Review.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Review.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: reviews,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Update a review (rating/comment)
// @route   PUT /api/reviews/:id
// @access  Private (owner only)
const updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to edit this review');
    }

    const { rating, comment } = req.body;
    if (rating  !== undefined) review.rating  = Number(rating);
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Recalculate denormalized stats
    await updateRatingStats(review.targetType, review.targetId);

    res.status(200).json({
        success: true,
        data: review,
        message: 'Review updated successfully'
    });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (owner or admin)
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }

    const { targetType, targetId } = review;
    await Review.findByIdAndDelete(review._id);

    // Recalculate denormalized stats after deletion
    await updateRatingStats(targetType, targetId);

    res.status(200).json({
        success: true,
        data: {},
        message: 'Review deleted successfully'
    });
});

module.exports = {
    createReview,
    getReviewsForTarget,
    getMyReviews,
    updateReview,
    deleteReview
};
