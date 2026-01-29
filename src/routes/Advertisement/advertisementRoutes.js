// routes/advertisementRoutes.js
const express = require("express");
const router = express.Router();

// Import all controller functions
const {
  getPageAds,           // GET /?page=home
  updatePageAds,        // POST / or PUT /
  getAllPages,          // GET /all
  addSampleData,        // POST /sample
  deletePageAds,        // DELETE /:page_name
  testEndpoint          // GET /test
} = require("../../controllers/Advertisement/advertisementController");

// ================== PUBLIC ROUTES ==================

// Test endpoint
router.get("/test", testEndpoint);

// Get ads for specific page
// Example: GET /api/advertisements?page=home
router.get("/", getPageAds);

// ================== ADMIN ROUTES ==================

// Create or update page ads (POST or PUT)
// Example: POST /api/advertisements
router.post("/", updatePageAds);
router.put("/", updatePageAds);

// Get all pages data (admin view)
// Example: GET /api/advertisements/all
router.get("/all", getAllPages);

// Add sample data for testing
// Example: POST /api/advertisements/sample
router.post("/sample", addSampleData);

// Delete page ads
// Example: DELETE /api/advertisements/home
router.delete("/:page_name", deletePageAds);

module.exports = router;