const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Exam/examTypeController");

router.get("/", controller.getAllExamTypes);
router.get("/:id", controller.getExamTypeById);
router.get("/category/:categoryId", controller.getExamTypesByCategoryId);
router.post("/", controller.addExamType);
router.put("/:id", controller.updateExamType);
router.delete("/:id", controller.deleteExamType);

module.exports = router;
