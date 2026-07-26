const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Vercel compatible temporary path (/tmp)
const baseDir = process.env.VERCEL ? os.tmpdir() : process.cwd();

// Create required upload directories
const uploadDirs = [
    'uploads/logos',
    'uploads/covers',
    'uploads/gallery',
    'uploads/licenses',
    'uploads/nic',
    'uploads/listings',
    'uploads/spots',
    'uploads/misc'
];

uploadDirs.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
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
                folder += 'listings';
                break;
            case 'spotPhotos':
                folder += 'spots';
                break;
            default:
                folder += 'misc';
        }
        cb(null, path.join(baseDir, folder));
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
        if (file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
        }
    } else if (isDocField) {
        if (file.mimetype.match(/^image\/(jpeg|jpg|png)$/) || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
        }
    } else {
        cb(null, false);
    }
};

// Multer base config
const multerBase = { storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } };

const businessUpload = multer(multerBase).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 6 },
    { name: 'license', maxCount: 1 },
    { name: 'nic', maxCount: 1 }
]);

const businessImageUpload = multer(multerBase).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 6 }
]);

const listingUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
    { name: 'photos', maxCount: 5 }
]);

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