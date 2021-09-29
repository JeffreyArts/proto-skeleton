const multer       = require("multer");
const upload       = multer({ dest: "uploads/" });


module.exports = (req, res, next) => {
    if (req.error) {
        return next();
    }

    return upload.single("image")
}