const mongoose = require('mongoose');

const VisitorLogSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: 'Guest Visitor' },
    role: { type: String, default: 'guest' },
    page: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

VisitorLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VisitorLog', VisitorLogSchema);
