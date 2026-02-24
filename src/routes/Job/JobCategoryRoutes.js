const express = require("express");
const router = express.Router();

const {
  createJobCategory,
  getAllJobCategories,
  getJobCategoryById,
  updateJobCategory,
  deleteJobCategory
} = require("../../controllers/Job/JobCategoryController");

router.post("/", createJobCategory);
router.get("/", getAllJobCategories);
router.get("/:id", getJobCategoryById);
router.put("/:id", updateJobCategory);
router.delete("/:id", deleteJobCategory);

module.exports = router;