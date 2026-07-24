const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Get Google Client ID
// @route   GET /api/auth/google-client-id
// @access  Public
const getGoogleClientId = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            clientId: process.env.GOOGLE_CLIENT_ID
        }
    });
});

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        res.status(400);
        throw new Error('Credential is required');
    }

    let ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch (error) {
        res.status(401);
        throw new Error('Invalid Google credential');
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // a) Check existing user by googleId
    let user = await User.findOne({ googleId });

    if (user) {
        // User exists with this googleId
        if (user.active === false) {
            res.status(401);
            throw new Error('Account is deactivated');
        }
        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    }

    // b) Check existing user by email
    user = await User.findOne({ email });

    if (user) {
        // Link googleId to existing user
        user.googleId = googleId;
        await user.save();

        if (user.active === false) {
            res.status(401);
            throw new Error('Account is deactivated');
        }
        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    }

    // c) Create new user
    user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        role: 'visitor' // brand-new Google sign-ups always start as visitor
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

module.exports = {
    getGoogleClientId,
    googleLogin
};
