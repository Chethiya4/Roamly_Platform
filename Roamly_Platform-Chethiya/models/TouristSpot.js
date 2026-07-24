const mongoose = require('mongoose');

const TouristSpotSchema = new mongoose.Schema({
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { 
        type: String, 
        enum: ['Historical', 'Beach', 'Waterfall', 'Nature & Wildlife', 'Adventure', 'Religious', 'Cultural', 'Viewpoint', 'Other'] 
    },
    openingHours: { type: String },
    entryFee: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    photos: [{ type: String }],
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

TouristSpotSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('TouristSpot', TouristSpotSchema);
