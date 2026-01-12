const express = require("express");
const {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory
} = require("../../controllers/collegeCategory/collegeSubcategoryController");

const router = express.Router();

// 🚫 NO multer here
router.post("/subcategory", createSubcategory);        // Create
router.get("/subcategory", getAllSubcategories);       // Get all
router.get("/subcategory/:id", getSubcategoryById);    // Get one
router.put("/subcategory/:id", updateSubcategory);     // Update
router.delete("/subcategory/:id", deleteSubcategory);  // Delete

module.exports = router;
