const express = require("express");
const router = express.Router();
const controller = require("../../controllers/ExtraSkill/extraSkillInstitutionController");

router.get("/", controller.getAllExtraSkillInstitutions);
router.get("/type/:typeId", controller.getExtraSkillInstitutionsByType);
router.get("/:id", controller.getExtraSkillInstitutionById);
router.post("/", controller.addExtraSkillInstitution);
router.put("/:id", controller.updateExtraSkillInstitution);
router.delete("/:id", controller.deleteExtraSkillInstitution);

module.exports = router;
