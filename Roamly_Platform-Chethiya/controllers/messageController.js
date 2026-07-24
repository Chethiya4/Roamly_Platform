const Message = require('../models/Message');
const Business = require('../models/Business');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Send a message in a business thread
// @route   POST /api/messages
// @access  Private (Admin or Business Owner of the specific business)
const sendMessage = asyncHandler(async (req, res) => {
    const { businessId, text } = req.body;

    if (!businessId || !text) {
        res.status(400);
        throw new Error('Business ID and text are required');
    }

    const business = await Business.findById(businessId);
    if (!business) {
        res.status(404);
        throw new Error('Business not found');
    }

    // Permission check
    const isAdmin = req.user.role === 'admin';
    const isOwner = business.owner.equals(req.user._id);

    if (!isAdmin && !isOwner) {
        res.status(403);
        throw new Error('Not authorized to access this thread');
    }

    const message = await Message.create({
        business: businessId,
        sender: req.user._id,
        senderRole: req.user.role === 'admin' ? 'admin' : 'business_owner',
        text
    });

    await message.populate('sender', 'name');

    // Create notification for the other party
    try {
        const recipientRole = isAdmin ? 'business_owner' : 'admin';
        await Notification.create({
            recipientRole,
            type: 'new_message',
            message: `New message on ${business.name} thread`,
            relatedType: 'business',
            relatedId: business._id
        });
    } catch (err) {
        console.error('Failed to create new message notification:', err.message);
    }

    res.status(201).json({
        success: true,
        data: message
    });
});

// @desc    Get full message thread for a business
// @route   GET /api/messages/:businessId
// @access  Private (Admin or Business Owner of the specific business)
const getThread = asyncHandler(async (req, res) => {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
        res.status(404);
        throw new Error('Business not found');
    }

    // Permission check
    const isAdmin = req.user.role === 'admin';
    const isOwner = business.owner.equals(req.user._id);

    if (!isAdmin && !isOwner) {
        res.status(403);
        throw new Error('Not authorized to access this thread');
    }

    const messages = await Message.find({ business: businessId })
        .populate('sender', 'name')
        .sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        data: messages
    });
});

module.exports = {
    sendMessage,
    getThread
};
