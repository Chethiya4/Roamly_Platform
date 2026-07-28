const Destination = require('../models/Destination');
const TouristSpot = require('../models/TouristSpot');
const Business = require('../models/Business');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Full-text search across destinations, spots, and/or businesses
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
        throw new Error(`type must be one of: ${VALID_TYPES.join(', ')}`);
    }

    const textFilter = { $text: { $search: q.trim() } };
    const CAP = 10;  // max results per collection

    // Projection: just enough for a search result card
    const destProjection = { name: 1, province: 1, coverImage: 1, score: { $meta: 'textScore' } };
    const spotProjection = { name: 1, category: 1, destination: 1, photos: 1, averageRating: 1, score: { $meta: 'textScore' } };
    const bizProjection  = { name: 1, category: 1, destination: 1, 'images.logo': 1, priceTier: 1, averageRating: 1, score: { $meta: 'textScore' } };

    const result = {};

    if (type === 'all' || type === 'destination') {
        result.destinations = await Destination
            .find(textFilter, destProjection)
            .sort({ score: { $meta: 'textScore' } })
            .limit(CAP);
    }

    if (type === 'all' || type === 'spot') {
        result.spots = await TouristSpot
            .find({ ...textFilter, status: 'approved' }, spotProjection)
            .populate('destination', 'name')
            .sort({ score: { $meta: 'textScore' } })
            .limit(CAP);
    }

    if (type === 'all' || type === 'business') {
        result.businesses = await Business
            .find({ ...textFilter, status: 'approved' }, bizProjection)
            .populate('destination', 'name')
            .sort({ score: { $meta: 'textScore' } })
            .limit(CAP);
    }

    res.status(200).json({
        success: true,
        data: result
    });
});

module.exports = { search };
