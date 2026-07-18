const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['stay', 'rental', 'food', 'tour'], required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
    description: { type: String },
    priceRange: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
