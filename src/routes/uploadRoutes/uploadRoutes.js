const express = require("express");
const upload = require("../../middlewares/Upload/upload");

const router = express.Router();

// ===== Single file upload =====
router.post("/upload", (req, res, next) => {
  upload.single("file")(req, res, function (err) {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    return res.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: req.file.location,   // <-- S3 URL
    });
  });
});

// ===== Multiple file upload =====
router.post("/upload/multiple", (req, res, next) => {
  upload.array("files", 5)(req, res, function (err) {
    if (err) return next(err);
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const urls = req.files.map((file) => file.location);

    return res.json({
      success: true,
      message: "Files uploaded successfully",
      files: urls,
    });
  });
});

module.exports = router;
