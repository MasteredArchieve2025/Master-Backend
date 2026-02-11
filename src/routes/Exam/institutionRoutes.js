const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Exam/institutionController");

router.get("/", controller.getAllInstitutions);
router.get("/type/:typeId", controller.getInstitutionsByType);
router.get("/:id", controller.getInstitutionById);
router.post("/", controller.addInstitution);
router.put("/:id", controller.updateInstitution);
router.delete("/:id", controller.deleteInstitution);

module.exports = router;
