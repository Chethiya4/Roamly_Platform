const trackingManager = require('../utils/trackingManager');
const VisitorLog = require('../models/VisitorLog');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Process heartbeat ping from client
// @route   POST /api/tracking/heartbeat
// @access  Public / Optional Auth
const sendHeartbeat = asyncHandler(async (req, res) => {
    const { sessionId, page, title } = req.body;

    if (!sessionId) {
        res.status(400);
        throw new Error('sessionId is required');
    }

    let userId = null;
    let userName = 'Guest Visitor';
    let role = 'guest';

    // Check optional bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret123');
            const user = await User.findById(decoded.id).select('name role active');
            if (user && user.active !== false) {
                userId = user._id;
                userName = user.name;
                role = user.role;
            }
        } catch (err) {
            // Ignore token verification errors for guests
        }
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Browser';
    const currentPage = page || '/';

    const sessionData = trackingManager.recordHeartbeat({
        sessionId,
        userId,
        userName,
        role,
        currentPage,
        ip,
        userAgent
    });

    // Asynchronously log to database without blocking response
    VisitorLog.create({
        sessionId,
        user: userId,
        userName,
        role,
        page: currentPage,
        ip,
        userAgent
    }).catch(err => console.error('VisitorLog insert error:', err.message));

    res.status(200).json({
        success: true,
        data: sessionData,
        message: 'Heartbeat recorded'
    });
});

// @desc    Get live tracking stats and active sessions
// @route   GET /api/tracking/live (or /api/admin/tracking)
// @access  Private (admin)
const getLiveTrackingStats = asyncHandler(async (req, res) => {
    const stats = trackingManager.getLiveStats();

    res.status(200).json({
        success: true,
        data: stats
    });
});

module.exports = {
    sendHeartbeat,
    getLiveTrackingStats
};
