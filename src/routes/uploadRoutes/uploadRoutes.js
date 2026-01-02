const express = require("express");
const upload = require("../../middlewares/Upload/upload");

const router = express.Router();

// SINGLE FILE
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  res.json({
    success: true,
    fileUrl: req.file.location,
  });
});

// MULTIPLE FILES
router.post("/multiple", upload.array("files", 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ message: "No files uploaded" });

  res.json({
    success: true,
    files: req.files.map(f => f.location),
  });
});

module.exports = router;
