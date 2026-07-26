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
    { name: 'Jaffna',         province: 'Northern Province', coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200' },
    { name: 'Kilinochchi',    province: 'Northern Province', coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200' },
    { name: 'Mannar',         province: 'Northern Province', coverImage: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=1200' },
    { name: 'Vavuniya',       province: 'Northern Province', coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200' },
    { name: 'Mullaitivu',     province: 'Northern Province', coverImage: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?q=80&w=1200' },

    // Eastern Province
    { name: 'Trincomalee',    province: 'Eastern Province', coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200' },
    { name: 'Batticaloa',     province: 'Eastern Province', coverImage: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200' },
    { name: 'Ampara',         province: 'Eastern Province', coverImage: 'images/arugambay1.jpg' },

    // North Central Province
    { name: 'Anuradhapura',   province: 'North Central Province', coverImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=1200' },
    { name: 'Polonnaruwa',    province: 'North Central Province', coverImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=1200' },

    // North Western Province
    { name: 'Kurunegala',     province: 'North Western Province', coverImage: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1200' },
    { name: 'Puttalam',       province: 'North Western Province', coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200' },

    // Central Province
    { name: 'Kandy',          province: 'Central Province', coverImage: 'images/Esala.jpg' },
    { name: 'Matale',         province: 'Central Province', coverImage: 'images/Sigiriya1.jpg' },
    { name: 'Nuwara Eliya',   province: 'Central Province', coverImage: 'images/nuwaraeliya1.jpg' },

    // Sabaragamuwa Province
    { name: 'Ratnapura',      province: 'Sabaragamuwa Province', coverImage: 'images/adamspeak1.jpg' },
    { name: 'Kegalle',        province: 'Sabaragamuwa Province', coverImage: 'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=1200' },

    // Uva Province
    { name: 'Badulla',        province: 'Uva Province', coverImage: 'images/ella1.jpg' },
    { name: 'Monaragala',     province: 'Uva Province', coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200' },

    // Western Province
    { name: 'Colombo',        province: 'Western Province', coverImage: 'images/colombo.jpg' },
    { name: 'Gampaha',        province: 'Western Province', coverImage: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=1200' },
    { name: 'Kalutara',       province: 'Western Province', coverImage: 'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?q=80&w=1200' },

    // Southern Province
    { name: 'Galle',          province: 'Southern Province', coverImage: 'images/gallfort1.jpg' },
    { name: 'Matara',         province: 'Southern Province', coverImage: 'images/mirissa1.jpg' },
    { name: 'Hambantota',     province: 'Southern Province', coverImage: 'images/yala1.jpg' },
];

const seedDestinations = async () => {
    try {
        let created = 0;
        let updated = 0;

        for (const district of DISTRICTS) {
            const result = await Destination.updateOne(
                { name: district.name },               // filter
                { $set: { province: district.province, coverImage: district.coverImage } },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                created++;
            } else {
                updated++;
            }
        }
        console.log(`Seeded destinations: ${created} created, ${updated} updated.`);
    } catch (err) {
        console.error('Seed destinations failed:', err.message);
    }
};

module.exports = seedDestinations;

if (require.main === module) {
    connectDB().then(async () => {
        await seedDestinations();
        process.exit(0);
    });
}
