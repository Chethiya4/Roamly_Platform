const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

// Load env vars
dotenv.config();

const config = require('../config/index');

const seedAdmin = async () => {
    try {
        await connectDB();

        const email = config.ADMIN_EMAIL;
        const password = config.ADMIN_PASSWORD;

        if (!email || !password) {
            console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
            process.exit(1);
        }

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log(`Admin user with email ${email} already exists.`);
        } else {
            await User.create({
                name: 'System Admin',
                email: email,
                password: password,
                role: 'admin',
                active: true
            });
            console.log(`Successfully created admin user with email ${email}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
