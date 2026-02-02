const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../../config/s3");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "master-education-images",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // 🔥 Dynamic folder based on request
      // default folder: uploads
      const folder = req.body.folder || "uploads";

      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
