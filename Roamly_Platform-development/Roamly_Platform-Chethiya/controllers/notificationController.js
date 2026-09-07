const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get paginated notifications for admin
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = asyncHandler(async (req, res) => {
    const { unreadOnly, page = 1, limit = 20 } = req.query;

    const filter = { recipientRole: 'admin' };
    if (unreadOnly === 'true') {
        filter.read = false;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, totalItems] = await Promise.all([
        Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Notification.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: notifications,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Get unread notification count
// @route   GET /api/admin/notifications/unread-count
// @access  Private/Admin
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ recipientRole: 'admin', read: false });

    res.status(200).json({
        success: true,
        count
    });
});

// @desc    Mark a specific notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all unread notifications as read
// @route   PUT /api/admin/notifications/read-all
// @access  Private/Admin
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipientRole: 'admin', read: false },
        { $set: { read: true } }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
