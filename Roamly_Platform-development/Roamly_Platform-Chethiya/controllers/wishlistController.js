const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const TouristSpot = require('../models/TouristSpot');
const Business = require('../models/Business');
const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');

// Helper: fetch a lightweight summary {name, photo} for a wishlist item
const fetchItemSummary = async (itemType, itemId) => {
    switch (itemType) {
        case 'spot': {
            const doc = await TouristSpot.findById(itemId, 'name photos status');
            if (!doc) return null;
            return { _id: doc._id, type: 'spot', name: doc.name, photo: doc.photos?.[0] || null, status: doc.status };
        }
        case 'business': {
            const doc = await Business.findById(itemId, 'name images.logo status');
            if (!doc) return null;
            return { _id: doc._id, type: 'business', name: doc.name, photo: doc.images?.logo || null, status: doc.status };
        }
        case 'destination': {
            const doc = await Destination.findById(itemId, 'name coverImage');
            if (!doc) return null;
            return { _id: doc._id, type: 'destination', name: doc.name, photo: doc.coverImage || null };
        }
        default:
            return null;
    }
};

// @desc    Toggle a wishlist item (add if absent, remove if present)
// @route   POST /api/wishlist
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
    const { itemType, itemId } = req.body;

    const VALID_TYPES = ['spot', 'destination', 'business'];
    if (!VALID_TYPES.includes(itemType)) {
        res.status(400);
        throw new Error(`itemType must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        res.status(400);
        throw new Error('A valid itemId is required');
    }

    const existing = await Wishlist.findOne({
        user:     req.user._id,
        itemType,
        itemId:   new mongoose.Types.ObjectId(itemId)
    });

    if (existing) {
        await Wishlist.findByIdAndDelete(existing._id);
        return res.status(200).json({
            success: true,
            data: { saved: false },
            message: 'Removed from wishlist'
        });
    }

    await Wishlist.create({
        user:   req.user._id,
        itemType,
        itemId: new mongoose.Types.ObjectId(itemId)
    });

    res.status(201).json({
        success: true,
        data: { saved: true },
        message: 'Added to wishlist'
    });
});

// @desc    Get logged-in user's wishlist with lightweight item summaries
// @route   GET /api/wishlist/mine
// @access  Private
const getMyWishlist = asyncHandler(async (req, res) => {
    const entries = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Attach a lightweight item summary for each entry
    const enriched = await Promise.all(
        entries.map(async (entry) => {
            const item = await fetchItemSummary(entry.itemType, entry.itemId);
            return {
                _id:      entry._id,
                itemType: entry.itemType,
                itemId:   entry.itemId,
                savedAt:  entry.createdAt,
                item      // lightweight { name, photo } — null if target was deleted
            };
        })
    );

    res.status(200).json({
        success: true,
        data: enriched,
        totalItems: enriched.length
    });
});

module.exports = {
    toggleWishlist,
    getMyWishlist
};
