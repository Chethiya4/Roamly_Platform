const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    province: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

DestinationSchema.index({ name: 'text', description: 'text' });

DestinationSchema.virtual('touristSpots', {
    ref: 'TouristSpot',
    localField: '_id',
    foreignField: 'destination',
    justOne: false
});

module.exports = mongoose.model('Destination', DestinationSchema);
