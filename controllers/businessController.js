const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────────────────────────
//  PUBLIC DISCOVERY
// ─────────────────────────────────────────────────────────────

// @desc    Get all approved businesses, with optional filters and pagination
// @route   GET /api/businesses
// @access  Public
const getBusinesses = asyncHandler(async (req, res) => {
    const { category, destination, search, priceTier, page = 1, limit = 20 } = req.query;

    const filter = { status: 'approved' };

    if (category)    filter.category   = category;
    if (destination) filter.destination = destination;
    if (priceTier)   filter.priceTier  = priceTier;
    if (search)      filter.$text      = { $search: search };

    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [businesses, totalItems] = await Promise.all([
        Business.find(filter)
            .populate('destination', 'name province')
            .sort({ averageRating: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Business.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: businesses,
        page: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems
    });
});

// @desc    Get a single business by ID
//          Public if approved; owner or admin can view any status
// @route   GET /api/businesses/:id
// @access  Public (with conditional status check)
const getBusinessById = asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id)
        .populate('destination', 'name province')
        .populate('owner', 'name email')
        .populate({
            path: 'listings',          // virtual from Prompt 3
            match: { status: 'active' },
            options: { sort: { createdAt: -1 } }
        });

    if (!business) {
        res.status(404);
        throw new Error('Business not found');
    }

    // Approved businesses are visible to everyone
    if (business.status === 'approved') {
        // Attach recent reviews (business-level)
        const recentReviews = await Review.find({
            targetType: 'business',
            targetId: business._id
        })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            data: { ...business.toJSON(), recentReviews }
        });
    }

    // Non-approved: only owner or admin
    const user = req.user;
    const isOwner = user && business.owner._id.toString() === user._id.toString();
    const isAdmin = user && user.role === 'admin';

    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to view this business');
    }

    res.status(200).json({ success: true, data: business });
});

// ─────────────────────────────────────────────────────────────
//  BUSINESS OWNER — REGISTRATION
// ─────────────────────────────────────────────────────────────

// @desc    Register a new business (and create the owner User account)
// @route   POST /api/business/register
// @access  Public (multipart/form-data)
const registerBusiness = asyncHandler(async (req, res, next) => {
    let createdUser = null;

    try {
        const {
            // User account fields
            personalEmail,
            password,
            confirmPassword,
            termsAgreed,

            // Business fields
            businessName,
            category,
            description,
            destination,          // required: ObjectId of a Destination document
            registrationNumber,
            ownerFullName,
            ownerNIC,

            // Location
            province,
            district,
            city,
            postalCode,
            streetAddress,
            latitude,
            longitude,

            // Contact
            businessPhone,
            whatsapp,
            businessEmail,
            website,

            // Operating hours
            open24,
            openTime,
            closeTime,
            openDays,

            // Pricing
            priceTier,
            startingPriceLKR,

            // Socials
            facebook,
            instagram,
            tiktok,
            youtube
        } = req.body;

        // Parse facilities — accept JSON array string or comma-separated
        let facilities = [];
        if (req.body.facilities) {
            try {
                facilities = JSON.parse(req.body.facilities);
            } catch {
                facilities = req.body.facilities.split(',').map(f => f.trim()).filter(Boolean);
            }
        }

        // ── Validate password match ──────────────────────────────────────
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // ── Validate terms agreed ────────────────────────────────────────
        if (!termsAgreed || termsAgreed === 'false') {
            return res.status(400).json({
                success: false,
                message: 'You must agree to the terms and conditions'
            });
        }

        // ── Validate destination exists ───────────────────────────────────
        if (!destination) {
            return res.status(400).json({
                success: false,
                message: 'Destination district is required'
            });
        }

        const destinationDoc = await Destination.findById(destination);
        if (!destinationDoc) {
            return res.status(400).json({
                success: false,
                message: `No destination found with id "${destination}". Choose a valid destination from /api/destinations.`
            });
        }

        const districtName = district || destinationDoc.name;

        // ── Validate required text fields ────────────────────────────────
        const missingFields = [];

        if (!personalEmail)   missingFields.push('personalEmail');
        if (!password)        missingFields.push('password');
        if (!confirmPassword) missingFields.push('confirmPassword');
        if (!businessName)    missingFields.push('businessName');
        if (!category)        missingFields.push('category');
        if (!ownerFullName)   missingFields.push('ownerFullName');
        if (!destination)     missingFields.push('destination');
        if (!province)        missingFields.push('province');
        if (!districtName)    missingFields.push('district');
        if (!city)            missingFields.push('city');
        if (!postalCode)      missingFields.push('postalCode');
        if (!streetAddress)   missingFields.push('streetAddress');
        if (!businessPhone)   missingFields.push('businessPhone');
        if (!businessEmail)   missingFields.push('businessEmail');
        if (!priceTier)       missingFields.push('priceTier');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // ── Validate required files ──────────────────────────────────────
        if (!req.files || !req.files.logo || req.files.logo.length === 0) {
            return res.status(400).json({ success: false, message: 'Logo image is required' });
        }
        if (!req.files.cover || req.files.cover.length === 0) {
            return res.status(400).json({ success: false, message: 'Cover image is required' });
        }
        if (!req.files.license || req.files.license.length === 0) {
            return res.status(400).json({ success: false, message: 'Business license document is required' });
        }

        // ── Check if user already exists ─────────────────────────────────
        const existingUser = await User.findOne({ email: personalEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // ── Create User ─────────────────────────────────────────────────
        createdUser = await User.create({
            name: ownerFullName,
            email: personalEmail,
            password: password, // hashed by User.js pre-save hook
            role: 'business_owner'
        });

        // ── Build image paths from uploaded files ────────────────────────
        const logoPath    = `/uploads/logos/${req.files.logo[0].filename}`;
        const coverPath   = `/uploads/covers/${req.files.cover[0].filename}`;
        const galleryPaths = req.files.gallery
            ? req.files.gallery.map(f => `/uploads/gallery/${f.filename}`)
            : [];
        const licensePath = `/uploads/licenses/${req.files.license[0].filename}`;
        const nicPath     = req.files.nic && req.files.nic.length > 0
            ? `/uploads/nic/${req.files.nic[0].filename}`
            : undefined;

        // ── Create Business ──────────────────────────────────────────────
        const business = await Business.create({
            owner: createdUser._id,
            name: businessName,
            category,
            description: description || '',
            status: 'pending',
            destination: destinationDoc._id,
            registrationNumber: registrationNumber || undefined,
            ownerFullName,
            ownerNIC: ownerNIC || undefined,

            location: {
                province,
                district: districtName,
                city,
                postalCode,
                streetAddress,
                latitude:  latitude  ? Number(latitude)  : undefined,
                longitude: longitude ? Number(longitude) : undefined
            },

            contact: {
                businessPhone,
                whatsapp:      whatsapp      || undefined,
                businessEmail,
                website:       website       || undefined
            },

            operatingHours: {
                open24:    open24 === 'true' || open24 === true,
                openTime:  openTime  || undefined,
                closeTime: closeTime || undefined,
                openDays:  openDays  || undefined
            },

            priceTier,
            startingPriceLKR: startingPriceLKR ? Number(startingPriceLKR) : undefined,
            facilities,

            images: {
                logo:    logoPath,
                cover:   coverPath,
                gallery: galleryPaths
            },

            verification: {
                licenseDocUrl: licensePath,
                nicDocUrl:     nicPath
            },

            socials: {
                facebook:  facebook  || undefined,
                instagram: instagram || undefined,
                tiktok:    tiktok    || undefined,
                youtube:   youtube   || undefined
            }
        });

        res.status(201).json({
            success: true,
            data: {
                token: generateToken(createdUser._id),
                business
            },
            message: 'Registration submitted. Your business is pending admin approval.'
        });

    } catch (error) {
        // Rollback: if User was created but Business creation failed, delete the orphaned User
        if (createdUser) {
            try {
                await User.findByIdAndDelete(createdUser._id);
            } catch (rollbackErr) {
                console.error('Rollback failed — could not delete orphaned User:', rollbackErr.message);
            }
        }
        throw error;
    }
});

// ─────────────────────────────────────────────────────────────
//  BUSINESS OWNER — DASHBOARD
// ─────────────────────────────────────────────────────────────

// @desc    Get the logged-in business owner's business
// @route   GET /api/business/me
// @access  Private (business_owner)
const getMyBusiness = asyncHandler(async (req, res) => {
    const business = await Business.findOne({ owner: req.user._id })
        .populate('destination', 'name province');

    if (!business) {
        return res.status(404).json({
            success: false,
            message: 'No business found for the currently logged-in user'
        });
    }

    res.status(200).json({ success: true, data: business });
});

// @desc    Update the logged-in business owner's business (text fields only)
// @route   PUT /api/business/me
// @access  Private (business_owner)
const updateMyBusiness = asyncHandler(async (req, res) => {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
        return res.status(404).json({
            success: false,
            message: 'No business found for the currently logged-in user'
        });
    }

    // Fields the owner is NOT allowed to change (system/admin-controlled)
    const forbiddenFields = ['owner', 'status', 'rejectionReason', 'averageRating', 'reviewCount'];

    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
        if (!forbiddenFields.includes(key)) {
            updates[key] = value;
        }
    }

    // If destination is being updated, validate it exists
    if (updates.destination) {
        const destExists = await Destination.findById(updates.destination);
        if (!destExists) {
            return res.status(400).json({
                success: false,
                message: `No destination found with id "${updates.destination}".`
            });
        }
    }

    Object.assign(business, updates);

    // Business rule: if status was 'rejected' and owner edits, flip back to 'pending'
    if (business.status === 'rejected') {
        business.status = 'pending';
        business.rejectionReason = undefined;
    }

    await business.save();

    res.status(200).json({
        success: true,
        message: business.status === 'pending'
            ? 'Business updated and resubmitted for review'
            : 'Business updated successfully',
        data: business
    });
});

// @desc    Update business images (logo, cover, gallery)
// @route   PUT /api/business/me/images
// @access  Private (business_owner)
const updateMyBusinessImages = asyncHandler(async (req, res) => {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
        return res.status(404).json({
            success: false,
            message: 'No business found for the currently logged-in user'
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No image files provided'
        });
    }

    const deleteOldFile = (relativePath) => {
        if (!relativePath) return;
        fs.unlink(path.join(process.cwd(), relativePath), () => {});
    };

    if (req.files.logo && req.files.logo.length > 0) {
        deleteOldFile(business.images.logo);
        business.images.logo = `/uploads/logos/${req.files.logo[0].filename}`;
    }

    if (req.files.cover && req.files.cover.length > 0) {
        deleteOldFile(business.images.cover);
        business.images.cover = `/uploads/covers/${req.files.cover[0].filename}`;
    }

    if (req.files.gallery && req.files.gallery.length > 0) {
        if (business.images.gallery && business.images.gallery.length > 0) {
            business.images.gallery.forEach(deleteOldFile);
        }
        business.images.gallery = req.files.gallery.map(f => `/uploads/gallery/${f.filename}`);
    }

    await business.save();

    res.status(200).json({
        success: true,
        message: 'Business images updated successfully',
        data: { images: business.images }
    });
});

// @desc    Get stats for the logged-in business owner's business
//          Uses denormalized averageRating/reviewCount fields (kept up-to-date by Review hooks in Prompt 6)
// @route   GET /api/business/me/stats
// @access  Private (business_owner)
const getMyBusinessStats = asyncHandler(async (req, res) => {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
        return res.status(404).json({
            success: false,
            message: 'No business found for the currently logged-in user'
        });
    }

    const [totalListings, activeListings] = await Promise.all([
        Listing.countDocuments({ business: business._id }),
        Listing.countDocuments({ business: business._id, status: 'active' })
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalListings,
            activeListings,
            // Read directly from the Business document's denormalized fields
            // (updated by Review hooks installed in Prompt 6)
            averageRating: business.averageRating,
            reviewCount:   business.reviewCount
        }
    });
});

module.exports = {
    getBusinesses,
    getBusinessById,
    registerBusiness,
    getMyBusiness,
    updateMyBusiness,
    updateMyBusinessImages,
    getMyBusinessStats,
};
