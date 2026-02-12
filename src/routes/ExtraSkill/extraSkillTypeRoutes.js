const express = require("express");
const router = express.Router();
const controller = require("../../controllers/ExtraSkill/extraSkillTypeController");

router.get("/", controller.getAllExtraSkillTypes);
router.get("/category/:categoryId", controller.getExtraSkillTypesByCategory);
router.get("/:id", controller.getExtraSkillTypeById);
router.post("/", controller.addExtraSkillType);
router.put("/:id", controller.updateExtraSkillType);
router.delete("/:id", controller.deleteExtraSkillType);

module.exports = router;
