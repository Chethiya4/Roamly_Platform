const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { 
        type: String, 
        enum: ['spot', 'destination', 'business'], 
        required: true 
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

WishlistSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
