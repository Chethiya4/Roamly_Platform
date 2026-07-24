/**
 * utils/updateRatingStats.js
 *
 * Recalculates and writes averageRating + reviewCount onto the target document
 * by aggregating all Review documents for a given (targetType, targetId) pair.
 *
 * Supported targetTypes: 'spot', 'business', 'destination'
 * ('listing' is intentionally skipped — listings use their business's stats)
 *
 * Usage: await updateRatingStats('business', businessId);
 */

const Review = require('../models/Review');

const MODEL_MAP = {
    spot:        () => require('../models/TouristSpot'),
    business:    () => require('../models/Business'),
    destination: () => require('../models/Destination'),
};

const updateRatingStats = async (targetType, targetId) => {
    const getModel = MODEL_MAP[targetType];
    if (!getModel) return; // 'listing' and unknown types are intentional no-ops

    const Model = getModel();

    const agg = await Review.aggregate([
        { $match: { targetType, targetId: targetId } },
        {
            $group: {
                _id: null,
                avgRating:   { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    const averageRating = agg.length > 0
        ? Math.round(agg[0].avgRating * 10) / 10
        : 0;
    const reviewCount = agg.length > 0 ? agg[0].reviewCount : 0;

    await Model.findByIdAndUpdate(targetId, { averageRating, reviewCount });
};

module.exports = updateRatingStats;
