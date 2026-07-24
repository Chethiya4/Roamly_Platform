const Destination = require('../models/Destination');
const TouristSpot = require('../models/TouristSpot');
const Business = require('../models/Business');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all destinations, with optional filtering and pagination
// @route   GET /api/destinations
// @access  Public
const getDestinations = asyncHandler(async (req, res) => {
    const { province, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (province) {
        filter.province = { $regex: province, $options: 'i' };
    }

    if (search) {
        filter.$text = { $search: search };
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [destinations, totalItems] = await Promise.all([
        Destination.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum),
        Destination.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: destinations,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Get a single destination by ID, populating approved tourist spots
// @route   GET /api/destinations/:id
// @access  Public
const getDestinationById = asyncHandler(async (req, res) => {
    const destination = await Destination.findById(req.params.id).populate({
        path: 'touristSpots',
        match: { status: 'approved' },
        options: { limit: 12, sort: { averageRating: -1 } }
    });

    if (!destination) {
        res.status(404);
        throw new Error('Destination not found');
    }

    res.status(200).json({ success: true, data: destination });
});

// @desc    Get a single destination by exact name (case-insensitive) — used by district map
// @route   GET /api/destinations/by-name/:name
// @access  Public
const getDestinationByName = asyncHandler(async (req, res) => {
    const destination = await Destination.findOne({
        name: { $regex: `^${req.params.name.trim()}$`, $options: 'i' }
    }).populate({
        path: 'touristSpots',
        match: { status: 'approved' },
        options: { limit: 12, sort: { averageRating: -1 } }
    });

    if (!destination) {
        res.status(404);
        throw new Error(`No destination found with the name "${req.params.name}". Check that the name matches an official district name.`);
    }

    res.status(200).json({ success: true, data: destination });
});

// @desc    Get all destinations grouped by province
// @route   GET /api/destinations/grouped-by-province
// @access  Public
const getDestinationsGroupedByProvince = asyncHandler(async (req, res) => {
    const destinations = await Destination.find({}).sort({ province: 1, name: 1 });
    
    const grouped = {};
    for (const dest of destinations) {
        if (!grouped[dest.province]) {
            grouped[dest.province] = [];
        }
        grouped[dest.province].push({ _id: dest._id, name: dest.name });
    }
    
    res.status(200).json({ success: true, data: grouped });
});

// @desc    Create a new destination
// @route   POST /api/destinations
// @access  Admin only
const createDestination = asyncHandler(async (req, res) => {
    const { name, province, description, coverImage } = req.body;

    if (!name || !province) {
        res.status(400);
        throw new Error('Name and province are required');
    }

    const existing = await Destination.findOne({
        name: { $regex: `^${name.trim()}$`, $options: 'i' }
    });
    if (existing) {
        res.status(400);
        throw new Error('A destination with this name already exists');
    }

    const destination = await Destination.create({
        name: name.trim(),
        province,
        description,
        coverImage,
        createdByAdmin: req.user._id
    });

    res.status(201).json({
        success: true,
        data: destination,
        message: 'Destination created successfully'
    });
});

// @desc    Update a destination
// @route   PUT /api/destinations/:id
// @access  Admin only
const updateDestination = asyncHandler(async (req, res) => {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
        res.status(404);
        throw new Error('Destination not found');
    }

    const { name, province, description, coverImage } = req.body;
    if (name !== undefined) destination.name = name;
    if (province !== undefined) destination.province = province;
    if (description !== undefined) destination.description = description;
    if (coverImage !== undefined) destination.coverImage = coverImage;

    await destination.save();

    res.status(200).json({
        success: true,
        data: destination,
        message: 'Destination updated successfully'
    });
});

// @desc    Delete a destination (refuses if spots or businesses still reference it)
// @route   DELETE /api/destinations/:id
// @access  Admin only
const deleteDestination = asyncHandler(async (req, res) => {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
        res.status(404);
        throw new Error('Destination not found');
    }

    const [spotCount, businessCount] = await Promise.all([
        TouristSpot.countDocuments({ destination: destination._id }),
        Business.countDocuments({ destination: destination._id })
    ]);

    if (spotCount > 0 || businessCount > 0) {
        res.status(400);
        throw new Error(
            `Cannot delete "${destination.name}": it is still referenced by ` +
            `${spotCount} tourist spot(s) and ${businessCount} business(es). ` +
            `Reassign or delete those records first.`
        );
    }

    await Destination.findByIdAndDelete(destination._id);

    res.status(200).json({
        success: true,
        data: {},
        message: `Destination "${destination.name}" deleted successfully`
    });
});

module.exports = {
    getDestinations,
    getDestinationById,
    getDestinationByName,
    getDestinationsGroupedByProvince,
    createDestination,
    updateDestination,
    deleteDestination
};
