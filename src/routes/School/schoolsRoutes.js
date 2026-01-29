const express = require("express");
const router = express.Router();

// Import ALL functions from controller
const {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  searchSchools,
  // Debug functions
  getAllSchoolsSimple,
  debugSchools,
  testRaw,
  minimalSchools,
} = require("../../controllers/Schools/schoolsController");

// ========== MAIN ROUTES ==========
router.post("/", createSchool);
router.get("/", getAllSchools); // Main GET endpoint
router.get("/search", searchSchools);
router.get("/:id", getSchoolById);
router.put("/:id", updateSchool);
router.delete("/:id", deleteSchool);

// ========== DEBUG/TEST ROUTES ==========
router.get("/test/simple", getAllSchoolsSimple); // Simple version
router.get("/test/debug", debugSchools); // Debug info
router.get("/test/raw", testRaw); // Raw data test
router.get("/test/minimal", minimalSchools); // Minimal test

module.exports = router;
