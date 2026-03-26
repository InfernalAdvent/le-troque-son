const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        // Nom aléatoire — supprime tout risque lié au nom original
        const randomName = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${randomName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Double vérification : mimetype ET extension
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        return cb(new Error('Type de fichier non autorisé'), false);
    }
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error('Extension de fichier non autorisée'), false);
    }
    // Bloque les doubles extensions ex: "photo.php.jpg"
    if (file.originalname.split('.').length > 2) {
        return cb(new Error('Nom de fichier invalide'), false);
    }

    cb(null, true);
};

module.exports = multer({ 
    storage, 
    fileFilter, 
    limits: { 
        fileSize: 5 * 1024 * 1024,  // 5MB
        files: 5                    // max 5 fichiers par requête
    } 
});