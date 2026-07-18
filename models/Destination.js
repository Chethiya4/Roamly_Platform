const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    region: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Destination', DestinationSchema);
