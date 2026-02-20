const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Course/courseProviderController");


// ➕ CREATE
router.post("/", controller.createProvider);

// 📄 GET ALL
router.get("/", controller.getAllProviders);

// 📄 GET BY COURSE ITEM 🔥
router.get("/by-course-item/:courseItemId", controller.getProvidersByCourseItem);

// 📄 GET SINGLE
router.get("/:id", controller.getProviderById);

// ✏️ UPDATE
router.put("/:id", controller.updateProvider);

// ❌ DELETE
router.delete("/:id", controller.deleteProvider);

module.exports = router;
