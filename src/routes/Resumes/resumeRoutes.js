const express = require("express");
const router = express.Router();

const upload = require("../../middlewares/uploadResume");
const verifyToken = require("../../middlewares/Auth/auth.middleware"); // JWT middleware
const resumeController = require("../../controllers/Resumes/resumeController");


// POST - Upload Resume (User)
router.post(
  "/upload-resume",
  verifyToken,                // 👈 check JWT token
  upload.single("resume"),
  resumeController.uploadResume
);

// GET - My Resume (User)
router.get(
  "/my-resume",
  verifyToken,
  resumeController.getMyResume
);


// PUT - Update Resume (User)
router.put(
  "/update-resume",
  verifyToken,
  upload.single("resume"),
  resumeController.updateResume
);


// GET - Admin View All Resumes
router.get(
  "/admin/resumes",
  verifyToken,
  resumeController.getAllResumes
);


// DELETE - Remove Resume (Admin)
router.delete(
  "/delete-resume/:user_id",
  verifyToken,
  resumeController.deleteResume
);

module.exports = router;