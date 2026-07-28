const fs = require('fs');
const path = require('path');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const asyncHandler = require('../utils/asyncHandler');

// Helper: verify the listing's parent business belongs to the logged-in user
const verifyOwnership = async (listingId, userId) => {
    const listing = await Listing.findById(listingId);
    if (!listing) return { error: 'Listing not found', status: 404 };

    const business = await Business.findById(listing.business);
    if (!business) return { error: 'Parent business not found', status: 404 };

    if (business.owner.toString() !== userId.toString()) {
        return { error: 'Not authorized to modify this listing', status: 403 };
    }

    return { listing, business };
};

// Helper: delete a file from disk (ignore missing files)
const deleteFile = (relativePath) => {
    if (!relativePath) return;
    const fullPath = path.join(process.cwd(), relativePath);
    fs.unlink(fullPath, () => {});
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (business_owner, business must be approved)
const createListing = asyncHandler(async (req, res, next) => {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
        return res.status(404).json({
            success: false,
            message: 'No business found for the currently logged-in user'
        });
    }

    if (business.status !== 'approved') {
        return res.status(403).json({
            success: false,
            message: 'Your business must be approved before creating listings.'
        });
    }

    const { title, description, price, availability, status } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Build photo paths from uploaded files
    const photos = req.files && req.files.photos
        ? req.files.photos.map(f => `/uploads/listings/${f.filename}`)
        : [];

    const listing = await Listing.create({
        business: business._id,
        title,
        description: description || '',
        price: price ? Number(price) : undefined,
        availability: availability !== undefined ? availability === 'true' || availability === true : true,
        photos,
        status: status || 'active'
    });

    res.status(201).json({
        success: true,
        data: listing,
        message: 'Listing created successfully'
    });
});

// @desc    Get all listings for the logged-in business owner
// @route   GET /api/listings/mine
// @access  Private (business_owner)
const getMyListings = asyncHandler(async (req, res, next) => {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
        return res.status(404).json({
            success: false,
            message: 'No business found for the currently logged-in user'
        });
    }

    const listings = await Listing.find({ business: business._id }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: listings,
        totalItems: listings.length
    });
});

// @desc    Get a single listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListing = asyncHandler(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id).populate('business', 'name category images.logo');

    if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
});

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (business_owner, must own the listing)
const updateListing = asyncHandler(async (req, res, next) => {
    const result = await verifyOwnership(req.params.id, req.user._id);
    if (result.error) {
        return res.status(result.status).json({ success: false, message: result.error });
    }

    const { listing } = result;
    const { title, description, price, availability, status } = req.body;

    if (title !== undefined) listing.title = title;
    if (description !== undefined) listing.description = description;
    if (price !== undefined) listing.price = Number(price);
    if (availability !== undefined) listing.availability = availability === 'true' || availability === true;
    if (status !== undefined) listing.status = status;

    await listing.save();

    res.status(200).json({
        success: true,
        data: listing,
        message: 'Listing updated successfully'
    });
});

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (business_owner, must own the listing)
const deleteListing = asyncHandler(async (req, res, next) => {
    const result = await verifyOwnership(req.params.id, req.user._id);
    if (result.error) {
        return res.status(result.status).json({ success: false, message: result.error });
    }

    const { listing } = result;

    // Delete photo files from disk
    if (listing.photos && listing.photos.length > 0) {
        listing.photos.forEach(photoPath => deleteFile(photoPath));
    }

    await Listing.findByIdAndDelete(listing._id);

    res.status(200).json({
        success: true,
        data: {},
        message: 'Listing deleted successfully'
    });
});

module.exports = {
    createListing,
    getMyListings,
    getListing,
    updateListing,
    deleteListing,
};
