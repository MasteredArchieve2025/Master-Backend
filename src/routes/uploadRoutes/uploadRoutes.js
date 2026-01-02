const express = require("express");
const upload = require("../../middlewares/Upload/upload");

const router = express.Router();

router.post("/upload", (req, res, next) => {
  upload.array("file", 10)(req, res, function (err) {
    if (err) return next(err);

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const urls = req.files.map(f => f.location);

    return res.json({
      success: true,
      message: "Uploaded successfully",
      files: urls,   // ALWAYS ARRAY
    });
  });
});

module.exports = router;
