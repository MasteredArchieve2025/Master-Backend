const express = require("express");
const router = express.Router();
const controller = require("../../controllers/ExtraSkill/extraSkillCategoryController");

router.get("/", controller.getAllExtraSkillCategories);
router.get("/:id", controller.getExtraSkillCategoryById);
router.post("/", controller.addExtraSkillCategory);
router.put("/:id", controller.updateExtraSkillCategory);
router.delete("/:id", controller.deleteExtraSkillCategory);

module.exports = router;
