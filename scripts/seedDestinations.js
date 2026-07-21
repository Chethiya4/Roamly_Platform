/**
 * scripts/seedDestinations.js
 *
 * Seeds all 25 Sri Lankan districts as Destination documents.
 * Uses upsert-by-name so it is safe to run multiple times.
 *
 * Usage:  node scripts/seedDestinations.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const Destination = require('../models/Destination');

// Sri Lanka: official district name  →  province
const DISTRICTS = [
    // Northern Province
    { name: 'Jaffna',         province: 'Northern Province' },
    { name: 'Kilinochchi',    province: 'Northern Province' },
    { name: 'Mannar',         province: 'Northern Province' },
    { name: 'Vavuniya',       province: 'Northern Province' },
    { name: 'Mullaitivu',     province: 'Northern Province' },

    // Eastern Province
    { name: 'Trincomalee',    province: 'Eastern Province' },
    { name: 'Batticaloa',     province: 'Eastern Province' },
    { name: 'Ampara',         province: 'Eastern Province' },

    // North Central Province
    { name: 'Anuradhapura',   province: 'North Central Province' },
    { name: 'Polonnaruwa',    province: 'North Central Province' },

    // North Western Province
    { name: 'Kurunegala',     province: 'North Western Province' },
    { name: 'Puttalam',       province: 'North Western Province' },

    // Central Province
    { name: 'Kandy',          province: 'Central Province' },
    { name: 'Matale',         province: 'Central Province' },
    { name: 'Nuwara Eliya',   province: 'Central Province' },

    // Sabaragamuwa Province
    { name: 'Ratnapura',      province: 'Sabaragamuwa Province' },
    { name: 'Kegalle',        province: 'Sabaragamuwa Province' },

    // Uva Province
    { name: 'Badulla',        province: 'Uva Province' },
    { name: 'Monaragala',     province: 'Uva Province' },

    // Western Province
    { name: 'Colombo',        province: 'Western Province' },
    { name: 'Gampaha',        province: 'Western Province' },
    { name: 'Kalutara',       province: 'Western Province' },

    // Southern Province
    { name: 'Galle',          province: 'Southern Province' },
    { name: 'Matara',         province: 'Southern Province' },
    { name: 'Hambantota',     province: 'Southern Province' },
];

const seed = async () => {
    try {
        await connectDB();

        let created = 0;
        let skipped = 0;

        for (const district of DISTRICTS) {
            const result = await Destination.updateOne(
                { name: district.name },               // filter
                { $setOnInsert: { province: district.province } }, // only set on insert
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                console.log(`  ✓ Created: ${district.name} (${district.province})`);
                created++;
            } else {
                console.log(`  – Exists:  ${district.name}`);
                skipped++;
            }
        }

        console.log(`\nDone. ${created} created, ${skipped} already existed.`);
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
};

seed();
