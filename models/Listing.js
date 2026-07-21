const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    availability: { type: Boolean, default: true },
    photos: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Listing', ListingSchema);
