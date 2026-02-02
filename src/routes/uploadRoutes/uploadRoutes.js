const express = require("express");
const upload = require("../../middlewares/Upload/upload");

const router = express.Router();

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: req.file.location,
      key: req.file.key,
    });
  } catch (err) {
    console.error("UPLOAD ERROR ❌", err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
});

module.exports = router;
