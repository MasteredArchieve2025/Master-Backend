const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../../config/s3");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "master-education-images",
    // acl: "public-read",   // enable if you want open URLs
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
