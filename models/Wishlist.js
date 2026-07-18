const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    spot: { type: mongoose.Schema.Types.ObjectId, ref: 'TouristSpot', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
