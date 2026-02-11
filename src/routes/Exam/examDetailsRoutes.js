const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Exam/examDetailsController");

router.get("/", controller.getAllExamDetails);
router.get("/:id", controller.getExamDetailsById);
router.post("/", controller.addExamDetails);
router.put("/:id", controller.updateExamDetails);
router.delete("/:id", controller.deleteExamDetails);

module.exports = router;
