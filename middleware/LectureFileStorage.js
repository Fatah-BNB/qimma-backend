const multer = require('multer');
const cloudinary = require('../config/cloudinary')
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure multer and Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "courses/lectures/files",
        resource_type: "raw",
    },
});
const upload = multer({ storage: storage });

module.exports = upload