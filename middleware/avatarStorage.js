const multer = require('multer');
const cloudinary = require('../config/cloudinary')
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure multer and Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'users/avatar',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});
const upload = multer({ storage: storage });

module.exports = upload