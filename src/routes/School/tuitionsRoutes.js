// tuitionsRoutes.js - COMPLETE FIXED VERSION
const express = require("express");
const router = express.Router();

// Import ALL functions from tuitionController
const {
  // Main CRUD functions
  createTuition,
  getAllTuitions,
  getTuitionById,
  updateTuition,
  deleteTuition,
  searchTuitions,
  
  // Debug functions
  getAllTuitionsSimple,
  debugTuitions,
  testRaw,
  minimalTuitions,
  setupTuitionsTable
} = require("../../controllers/Schools/tuitionsController");

// ========== MAIN ROUTES ==========
router.post("/", createTuition);
router.get("/", getAllTuitions); // Main GET endpoint
router.get("/search", searchTuitions);
router.get("/:id", getTuitionById);
router.put("/:id", updateTuition);
router.delete("/:id", deleteTuition);

// ========== DEBUG/TEST ROUTES ==========
router.get("/test/simple", getAllTuitionsSimple); // Simple version without JSON parsing
router.get("/test/debug", debugTuitions); // Debug database info
router.get("/test/raw", testRaw); // Raw data test
router.get("/test/minimal", minimalTuitions); // Minimal data test
router.post("/test/setup-table", setupTuitionsTable); // Create table if not exists

module.exports = router;