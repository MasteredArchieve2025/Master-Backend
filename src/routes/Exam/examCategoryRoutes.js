const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Exam/examCategoryController");

router.get("/", controller.getAllExamCategories);
router.get("/:id", controller.getExamCategoryById);
router.post("/", controller.addExamCategory);
router.put("/:id", controller.updateExamCategory);
router.delete("/:id", controller.deleteExamCategory);

module.exports = router;
