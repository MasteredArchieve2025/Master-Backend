const express = require("express");
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobsByCategory,
  getJobById,
  updateJob,
  deleteJob
} = require("../../controllers/Job/JobDeatilsController");

router.post("/", createJob);

router.get("/", getAllJobs);
router.get("/category/:jobCategoryId", getJobsByCategory);
router.get("/:id", getJobById);

router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;