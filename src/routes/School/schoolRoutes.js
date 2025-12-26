const express = require("express");
const {
  createSchool,
  getSchools,
  getSchoolById,
  updateSchool,
  deleteSchool
} = require("../../controllers/Schools/schoolController");

const router = express.Router();

// 🚫 NO multer here anymore
router.post("/school", createSchool);        // Create
router.get("/school", getSchools);           // Get all
router.get("/school/:id", getSchoolById);    // Get one
router.put("/school/:id", updateSchool);     // Update
router.delete("/school/:id", deleteSchool);  // Delete

module.exports = router;
