const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipientRole: { 
        type: String, 
        enum: ['admin', 'business_owner'], 
        default: 'admin' 
    },
    type: { 
        type: String, 
        enum: ['business_registered', 'spot_submitted', 'new_message'], 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    relatedType: { 
        type: String, 
        enum: ['business', 'spot'], 
        required: true 
    },
    relatedId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    read: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Notification', NotificationSchema);
