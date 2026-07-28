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

// @desc    Get Facebook App ID
// @route   GET /api/auth/facebook-app-id
// @access  Public
const getFacebookAppId = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            appId: process.env.FACEBOOK_APP_ID
        }
    });
});

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
        res.status(400);
        throw new Error('Credential or Access Token is required');
    }

    let googleId, email, name;

    if (accessToken) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch user info');
            const data = await response.json();
            googleId = data.sub;
            email = data.email;
            name = data.name;
        } catch (error) {
            res.status(401);
            throw new Error('Invalid Google access token');
        }
    } else if (credential) {
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
        googleId = payload.sub;
        email = payload.email;
        name = payload.name;
    }

    // a) Check existing user by googleId
    let user = await User.findOne({ googleId });

    if (user) {
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
        user.authProvider = user.authProvider === 'local' ? 'local' : 'google'; 
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

// @desc    Facebook Login
// @route   POST /api/auth/facebook
// @access  Public
const facebookLogin = asyncHandler(async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        res.status(400);
        throw new Error('Facebook access token is required');
    }

    let facebookId, email, name;

    try {
        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
        if (!response.ok) throw new Error('Failed to fetch user info from Facebook');
        const data = await response.json();
        
        facebookId = data.id;
        name = data.name;
        // If email permission is denied, use a fallback email based on facebookId
        email = data.email || `${facebookId}@facebook.local`;
    } catch (error) {
        res.status(401);
        throw new Error('Invalid Facebook access token');
    }

    // a) Check existing user by facebookId
    let user = await User.findOne({ facebookId });

    if (user) {
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
        // Link facebookId to existing user
        user.facebookId = facebookId;
        user.authProvider = user.authProvider === 'local' ? 'local' : 'facebook'; 
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
        facebookId,
        authProvider: 'facebook',
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

module.exports = {
    getGoogleClientId,
    getFacebookAppId,
    googleLogin,
    facebookLogin
};
