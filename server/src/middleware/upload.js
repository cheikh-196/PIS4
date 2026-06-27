const { upload, hasCloudinary } = require('../config/cloudinary');

const uploadImages = upload.array('images', 5);

const handleUpload = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err) {
      const message = err.message === 'Only image files are allowed'
        ? 'Seuls les fichiers image sont autorisés'
        : err.code === 'LIMIT_FILE_SIZE'
        ? 'Chaque image ne peut pas dépasser 5 Mo'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'Maximum 5 images autorisées par signalement'
        : err.message || 'Erreur lors de l\'upload';

      return res.status(400).json({ success: false, error: message });
    }

    if (!hasCloudinary && req.files) {
      req.files.forEach((f) => {
        f.path = `/uploads/${f.filename}`;
      });
    }

    next();
  });
};

module.exports = handleUpload;
