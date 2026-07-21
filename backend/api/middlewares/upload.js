const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        return cb(new Error('Type de fichier non autorisé'), false);
    }
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error('Extension de fichier non autorisée'), false);
    }
    if (file.originalname.split('.').length > 2) {
        return cb(new Error('Nom de fichier invalide'), false);
    }
    cb(null, true);
};

// Multer utilise la mémoire au lieu du disque
const storage = multer.memoryStorage();

const photos = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    }
});

const avatar = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1
    }
});

// Fonction utilitaire pour uploader un buffer vers Cloudinary
const uploadToCloudinary = (buffer, folder, options = {}) => {
    return new Promise((resolve, reject) => {
        const randomName = crypto.randomBytes(16).toString('hex');
        const uploadOptions = {
            folder,
            public_id: `${Date.now()}-${randomName}`,
            ...options
        };

        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }).end(buffer);
    });
};

module.exports = { photos, avatar, uploadToCloudinary };