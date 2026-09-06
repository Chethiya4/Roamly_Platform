const Destination = require('../models/Destination');
const TouristSpot = require('../models/TouristSpot');
const Business = require('../models/Business');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Search across destinations, spots, and businesses
// @route   GET /api/search?q=<term>&type=all|destination|spot|business
// @access  Public
const search = asyncHandler(async (req, res) => {
    const { q, type = 'all' } = req.query;

    if (!q || !q.trim()) {
        res.status(400);
        throw new Error('Search query "q" is required');
    }

    const VALID_TYPES = ['all', 'destination', 'spot', 'business'];

    if (!VALID_TYPES.includes(type)) {
        res.status(400);
        throw new Error(
            `type must be one of: ${VALID_TYPES.join(', ')}`
        );
    }

    // Escape special regex characters from user input
    const escapedQuery = q
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Case-insensitive partial search
    const regex = new RegExp(escapedQuery, 'i');

    const CAP = 10;
    const result = {};

    // Search destinations
    if (type === 'all' || type === 'destination') {
        result.destinations = await Destination
            .find({
                $or: [
                    { name: regex },
                    { province: regex },
                    { description: regex }
                ]
            })
            .select('name province coverImage')
            .limit(CAP);
    }

    // Search tourist spots
    if (type === 'all' || type === 'spot') {
        result.spots = await TouristSpot
            .find({
                status: 'approved',
                $or: [
                    { name: regex },
                    { category: regex },
                    { description: regex }
                ]
            })
            .select(
                'name category destination photos averageRating'
            )
            .populate('destination', 'name')
            .limit(CAP);
    }

    // Search businesses
    if (type === 'all' || type === 'business') {
        result.businesses = await Business
            .find({
                status: 'approved',
                $or: [
                    { name: regex },
                    { category: regex }
                ]
            })
            .select(
                'name category destination images.logo priceTier averageRating'
            )
            .populate('destination', 'name')
            .limit(CAP);
    }

    res.status(200).json({
        success: true,
        data: result
    });
});

module.exports = { search };