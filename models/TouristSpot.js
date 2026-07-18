const mongoose = require('mongoose');

const TouristSpotSchema = new mongoose.Schema({
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    openingHours: { type: String },
    entryFee: { type: Number },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    photos: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('TouristSpot', TouristSpotSchema);
