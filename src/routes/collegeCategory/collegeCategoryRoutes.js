const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require("../../controllers/collegeCategory/collegeCategorycontroller");

const router = express.Router();

// 🚫 NO multer here
router.post("/category", createCategory);        // Create
router.get("/category", getAllCategories);       // Get all
router.get("/category/:id", getCategoryById);    // Get one
router.put("/category/:id", updateCategory);     // Update
router.delete("/category/:id", deleteCategory);  // Delete

module.exports = router;
