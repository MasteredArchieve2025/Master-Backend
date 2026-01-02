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
      fileUrl: req.file.location, // <-- S3 URL
    });
  });
});

const uploadMultiple = async (files) => {
  setUploading(true);
  try {
    const fd = new FormData();

    for (let f of files) {
      fd.append("files", f); // ✅ MUST MATCH backend
    }

    const res = await axios.post(`${UPLOAD}/multiple`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.files; // ✅ backend key
  } catch (err) {
    console.log("UPLOAD ERROR ===>", err.response?.data || err.message);
    throw err;
  } finally {
    setUploading(false);
  }
};

module.exports = router;
