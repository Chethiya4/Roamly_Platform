const fs = require('fs');
const path = require('path');
const TouristSpot = require('../models/TouristSpot');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// Helper: delete a file from disk (fire-and-forget, ignores missing files)
const deleteFile = (relativePath) => {
    if (!relativePath) return;
    const fullPath = path.join(process.cwd(), relativePath);
    fs.unlink(fullPath, () => {});
};

// @desc    Get all approved tourist spots with optional filters and pagination
// @route   GET /api/spots
// @access  Public
const getSpots = asyncHandler(async (req, res) => {
    const { destination, category, search, page = 1, limit = 20 } = req.query;

    const filter = { status: 'approved' };

    if (destination) filter.destination = destination;
    if (category)    filter.category = category;
    if (search)      filter.$text = { $search: search };

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [spots, totalItems] = await Promise.all([
        TouristSpot.find(filter)
            .populate('destination', 'name province')
            .populate('submittedBy', 'name')
            .sort({ averageRating: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        TouristSpot.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: spots,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Get a single tourist spot by ID
//          Public if approved; pending/rejected visible only to submitter or admin
// @route   GET /api/spots/:id
// @access  Public (with conditional auth check)
const getSpotById = asyncHandler(async (req, res) => {
    const spot = await TouristSpot.findById(req.params.id)
        .populate('destination', 'name province')
        .populate('submittedBy', 'name email');

    if (!spot) {
        res.status(404);
        throw new Error('Tourist spot not found');
    }

    // If approved, anyone can see it
    if (spot.status === 'approved') {
        return res.status(200).json({ success: true, data: spot });
    }

    // Non-approved: only submitter or admin
    const user = req.user; // may be undefined if no token was provided
    const isSubmitter = user && spot.submittedBy._id.toString() === user._id.toString();
    const isAdmin     = user && user.role === 'admin';

    if (!isSubmitter && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to view this spot');
    }

    res.status(200).json({ success: true, data: spot });
});

// @desc    Submit a new tourist spot
// @route   POST /api/spots
// @access  Private (any logged-in user)
const createSpot = asyncHandler(async (req, res) => {
    const {
        destination,
        name,
        description,
        category,
        openingHours,
        entryFee,
        latitude,
        longitude
    } = req.body;

    if (!destination || !name) {
        res.status(400);
        throw new Error('Destination and name are required');
    }

    // Build photo paths from uploaded files (field name: spotPhotos)
    const photos = req.files && req.files.spotPhotos
        ? req.files.spotPhotos.map(f => `/uploads/spots/${f.filename}`)
        : [];

    const spot = await TouristSpot.create({
        destination,
        submittedBy: req.user._id,  // forced — never trust body
        status: 'pending',          // forced — always starts pending
        name,
        description,
        category,
        openingHours,
        entryFee: entryFee ? Number(entryFee) : 0,
        location: {
            latitude:  latitude  ? Number(latitude)  : undefined,
            longitude: longitude ? Number(longitude) : undefined
        },
        photos
    });

    try {
        await Notification.create({
            type: 'spot_submitted',
            message: `New tourist spot submitted: ${spot.name}`,
            relatedType: 'spot',
            relatedId: spot._id
        });
    } catch (notifErr) {
        console.error('Notification creation failed:', notifErr.message);
    }
    
    // ── Send Email ──────────────────────────────────────────
    if (req.user && req.user.email) {
        try {
            await sendEmail(
                req.user.email,
                'Tourist Spot Submission Received',
                `<h2>Submission Received</h2><p>We've received your tourist spot submission, ${spot.name}. It's pending review.</p>`
            );
        } catch (err) {
            console.error('Failed to send spot submission email:', err.message);
        }
    }

    res.status(201).json({
        success: true,
        data: spot,
        message: 'Tourist spot submitted for review'
    });
});

// @desc    Get logged-in user's own spot submissions (any status)
// @route   GET /api/spots/mine
// @access  Private
const getMySpots = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { submittedBy: req.user._id };

    const [spots, totalItems] = await Promise.all([
        TouristSpot.find(filter)
            .populate('destination', 'name province')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        TouristSpot.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: spots,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Update a tourist spot
//          Submitter can edit only if status is 'pending' or 'rejected'.
//          Editing a rejected spot resubmits it (status → 'pending', clears rejectionReason).
//          Admin can edit any spot at any status.
// @route   PUT /api/spots/:id
// @access  Private
const updateSpot = asyncHandler(async (req, res) => {
    const spot = await TouristSpot.findById(req.params.id);

    if (!spot) {
        res.status(404);
        throw new Error('Tourist spot not found');
    }

    const isAdmin     = req.user.role === 'admin';
    const isSubmitter = spot.submittedBy.toString() === req.user._id.toString();

    if (!isAdmin && !isSubmitter) {
        res.status(403);
        throw new Error('Not authorized to edit this spot');
    }

    // Non-admin submitters can only edit pending/rejected spots
    if (!isAdmin && spot.status === 'approved') {
        res.status(403);
        throw new Error('Approved spots can only be edited by an admin');
    }

    const {
        destination, name, description, category,
        openingHours, entryFee, latitude, longitude
    } = req.body;

    if (destination  !== undefined) spot.destination  = destination;
    if (name         !== undefined) spot.name         = name;
    if (description  !== undefined) spot.description  = description;
    if (category     !== undefined) spot.category     = category;
    if (openingHours !== undefined) spot.openingHours = openingHours;
    if (entryFee     !== undefined) spot.entryFee     = Number(entryFee);

    if (latitude  !== undefined) spot.location.latitude  = Number(latitude);
    if (longitude !== undefined) spot.location.longitude = Number(longitude);

    // Admin can explicitly set status; non-admin resubmissions reset to pending
    if (isAdmin && req.body.status !== undefined) {
        spot.status = req.body.status;
        if (req.body.rejectionReason !== undefined) {
            spot.rejectionReason = req.body.rejectionReason;
        }
    } else if (isSubmitter && spot.status === 'rejected') {
        // Resubmission: clear rejection and put back in review queue
        spot.status = 'pending';
        spot.rejectionReason = undefined;
    }

    await spot.save();

    res.status(200).json({
        success: true,
        data: spot,
        message: spot.status === 'pending'
            ? 'Spot updated and resubmitted for review'
            : 'Spot updated successfully'
    });
});

// @desc    Delete a tourist spot (submitter or admin); removes photos from disk
// @route   DELETE /api/spots/:id
// @access  Private
const deleteSpot = asyncHandler(async (req, res) => {
    const spot = await TouristSpot.findById(req.params.id);

    if (!spot) {
        res.status(404);
        throw new Error('Tourist spot not found');
    }

    const isAdmin     = req.user.role === 'admin';
    const isSubmitter = spot.submittedBy.toString() === req.user._id.toString();

    if (!isAdmin && !isSubmitter) {
        res.status(403);
        throw new Error('Not authorized to delete this spot');
    }

    // Clean up photo files from disk
    if (spot.photos && spot.photos.length > 0) {
        spot.photos.forEach(deleteFile);
    }

    await TouristSpot.findByIdAndDelete(spot._id);

    res.status(200).json({
        success: true,
        data: {},
        message: 'Tourist spot deleted successfully'
    });
});

module.exports = {
    getSpots,
    getSpotById,
    createSpot,
    getMySpots,
    updateSpot,
    deleteSpot
};
