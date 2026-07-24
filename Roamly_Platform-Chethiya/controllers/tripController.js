const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new planned trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = asyncHandler(async (req, res) => {
    // Force the user field to the logged-in user
    req.body.user = req.user._id;

    const trip = await Trip.create(req.body);

    res.status(201).json({
        success: true,
        data: trip
    });
});

// @desc    Get logged in user's planned trips
// @route   GET /api/trips/mine
// @access  Private
exports.getMyTrips = asyncHandler(async (req, res) => {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: trips.length,
        data: trips
    });
});

// @desc    Delete a planned trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
        res.status(404);
        throw new Error(`Trip not found with id of ${req.params.id}`);
    }

    // Make sure user is trip owner
    if (trip.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to delete this trip');
    }

    await trip.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
