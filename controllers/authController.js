const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please include all fields');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user. Force role to 'visitor' regardless of request payload
    // to prevent privilege escalation.
    const user = await User.create({
        name,
        email,
        password, // Password hashed in User model pre-save hook
        role: 'visitor'
    });

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please include all fields');
    }

    const user = await User.findOne({ email });

    // Check if active
    if (user && user.active === false) {
        res.status(401);
        throw new Error('Account is deactivated');
    }

    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        active: req.user.active,
    };
    res.status(200).json({ success: true, data: user });
});

// @desc    Update current logged in user details
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        // Never allow updating role or active status here

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id) // re-issue token optionally, but keeping it simple
            }
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res, next) => {
    // JWTs are stateless. We don't invalidate them server-side; we just rely on client to clear token.
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateMe,
    logoutUser,
};
