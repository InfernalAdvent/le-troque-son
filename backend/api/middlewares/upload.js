const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Créer le sous-dossier avatars s'il n'existe pas
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
}

// Génère un nom de fichier aléatoire sécurisé
const generateFilename = (req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomName}${ext}`);
};

// Storage pour les photos d'annonces
const photosStorage = multer.diskStorage({
    destination: "uploads/",
    filename: generateFilename
});

// Storage pour les avatars
const avatarStorage = multer.diskStorage({
    destination: "uploads/avatars/",
    filename: generateFilename
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

const photos = multer({ 
    storage: photosStorage, 
    fileFilter, 
    limits: { 
        fileSize: 5 * 1024 * 1024,  // 5MB
        files: 5                    // max 5 fichiers par requête
    } 
});

const avatar = multer({ 
    storage: avatarStorage, 
    fileFilter, 
    limits: { 
        fileSize: 2 * 1024 * 1024,  // 2MB pour les avatars
        files: 1                    // 1 seul fichier
    } 
});

module.exports = { photos, avatar };