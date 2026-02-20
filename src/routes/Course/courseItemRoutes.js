const express = require("express");
const router = express.Router();

const courseItemController = require("../../controllers/Course/courseItemController");


// ===============================
// COURSE ITEMS ROUTES
// Base → /api/course-items
// ===============================

// ➕ CREATE
router.post("/", courseItemController.createCourseItem);

// 📄 GET ALL
router.get("/", courseItemController.getAllCourseItems);

// 📄 GET BY CATEGORY
router.get(
  "/by-category/:categoryId",
  courseItemController.getItemsByCategory
);

// 📄 GET SINGLE
router.get("/:id", courseItemController.getCourseItemById);

// ✏️ UPDATE
router.put("/:id", courseItemController.updateCourseItem);

// ❌ DELETE
router.delete("/:id", courseItemController.deleteCourseItem);


module.exports = router;
