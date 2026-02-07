const express = require("express");
const router = express.Router();
const controller = require("../../controllers/College/collegeController");

router.get("/", controller.getAllColleges);
router.get("/:id", controller.getCollegeById);
router.post("/", controller.addCollege);
router.put("/:id", controller.updateCollege);
router.delete("/:id", controller.deleteCollege);

module.exports = router;
