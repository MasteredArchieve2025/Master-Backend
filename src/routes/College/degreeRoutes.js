const express = require("express");
const router = express.Router();
const controller = require("../../controllers/College/degreeController");

router.get("/", controller.getAllDegrees);
router.get("/:id", controller.getDegreeById);
router.post("/", controller.addDegree);
router.put("/:id", controller.updateDegree);
router.delete("/:id", controller.deleteDegree);

module.exports = router;
