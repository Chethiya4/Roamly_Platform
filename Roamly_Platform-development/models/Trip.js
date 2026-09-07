const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destination: {
        type: String,
        trim: true
    },
    durationDays: {
        type: Number,
        min: 1
    },
    budget: {
        type: String,
        enum: ['Backpacker (Budget)', 'Standard (Mid-range)', 'Luxury (Premium)']
    },
    travelStyle: {
        type: String,
        enum: ['Solo', 'Couple', 'Family', 'Friends']
    },
    interests: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
