const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },

    category: { 
        type: String, 
        enum: [
            'Hotel','Restaurant','Rental','Vehicle Rental','Supermarket','Pharmacy','Cafe','TourGuide','Tour Guide',
            'TravelAgency','SouvenirShop','LaundryService','SpaWellness','MedicalCenter','FuelStation','ATM',
            'Camping','Adventure','Homestay'
        ], 
        required: true 
    },
    registrationNumber: { type: String },
    ownerFullName: { type: String, required: true },
    ownerNIC: { type: String },

    location: {
        province: { type: String, required: true },
        district: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        streetAddress: { type: String, required: true },
        latitude: { type: Number },
        longitude: { type: Number }
    },

    contact: {
        businessPhone: { type: String, required: true },
        whatsapp: { type: String },
        businessEmail: { type: String, required: true },
        website: { type: String }
    },

    operatingHours: {
        open24: { type: Boolean, default: false },
        openTime: { type: String },
        closeTime: { type: String },
        openDays: { type: String, enum: ['Everyday','Weekdays Only','Weekends Only','Custom'] }
    },

    priceTier: { type: String, enum: ['$', '$$', '$$$', '$$$$'], required: true },
    startingPriceLKR: { type: Number },
    
    facilities: [{ type: String }],
    
    images: {
        logo: { type: String },
        cover: { type: String },
        gallery: [{ type: String }]
    },

    verification: {
        licenseDocUrl: { type: String, required: true },
        nicDocUrl: { type: String }
    },

    socials: {
        facebook: { type: String },
        instagram: { type: String },
        tiktok: { type: String },
        youtube: { type: String }
    },

    rejectionReason: { type: String },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BusinessSchema.index({ name: 'text', description: 'text' });

BusinessSchema.virtual('listings', {
    ref: 'Listing',
    localField: '_id',
    foreignField: 'business',
    justOne: false
});

module.exports = mongoose.model('Business', BusinessSchema);
