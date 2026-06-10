const multer = require('multer');

// Hum file ko memory mein store karenge taaki direct Cloudinary pe upload kar sakein,
// bina local disk pe save kiye hue.
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB ki file size limit
    },
});

module.exports = upload;
