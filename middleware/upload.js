const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create required upload directories
const uploadDirs = [
    'uploads/logos',
    'uploads/covers',
    'uploads/gallery',
    'uploads/licenses',
    'uploads/nic',
    'uploads/listings',
    'uploads/spots'
];

uploadDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'uploads/';
        switch (file.fieldname) {
            case 'logo':
                folder += 'logos';
                break;
            case 'cover':
                folder += 'covers';
                break;
            case 'gallery':
                folder += 'gallery';
                break;
            case 'license':
                folder += 'licenses';
                break;
            case 'nic':
                folder += 'nic';
                break;
            case 'photos':
                // 'spotPhotos' field → spots folder; 'photos' → listings folder
                folder += 'listings';
                break;
            case 'spotPhotos':
                folder += 'spots';
                break;
            default:
                folder += 'misc';
        }
        cb(null, path.join(process.cwd(), folder));
    },
    filename: function (req, file, cb) {
        const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}-${sanitizedOriginal}`);
    }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    const isImageField = ['logo', 'cover', 'gallery', 'photos', 'spotPhotos'].includes(file.fieldname);
    const isDocField = ['license', 'nic'].includes(file.fieldname);

    if (isImageField) {
        // Accept jpg/jpeg/png/webp
        if (file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
        }
    } else if (isDocField) {
        // Accept jpg/jpeg/png/pdf
        if (file.mimetype.match(/^image\/(jpeg|jpg|png)$/) || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
        }
    } else {
        cb(null, false);
    }
};

// Multer base config (shared storage, filter)
const multerBase = { storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } };

// Business registration upload (logo, cover, gallery, license, nic)
const businessUpload = multer(multerBase).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 6 },
    { name: 'license', maxCount: 1 },
    { name: 'nic', maxCount: 1 }
]);

// Business image update upload (logo, cover, gallery only)
const businessImageUpload = multer(multerBase).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 6 }
]);

// Listing photos upload (up to 5 photos, 5MB max)
const listingUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
    { name: 'photos', maxCount: 5 }
]);

// Tourist spot photos upload (up to 5 photos, 5MB max, jpg/jpeg/png/webp)
const spotUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
    { name: 'spotPhotos', maxCount: 5 }
]);

module.exports = businessUpload;
module.exports.businessUpload = businessUpload;
module.exports.businessImageUpload = businessImageUpload;
module.exports.listingUpload = listingUpload;
module.exports.spotUpload = spotUpload;
