// schoolsRoutes.js
const express = require("express");
const router = express.Router();
const {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  searchSchools
} = require("../../controllers/Schools/schoolsController");

// School Routes
router.post("/", createSchool);
router.get("/", getAllSchools);
router.get("/search", searchSchools);
router.get("/:id", getSchoolById);
router.put("/:id", updateSchool);
router.delete("/:id", deleteSchool);

module.exports = router;