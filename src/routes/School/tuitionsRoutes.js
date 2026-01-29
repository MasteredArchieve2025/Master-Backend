// tuitionsRoutes.js
const express = require("express");
const router = express.Router();
const {
  createTuition,
  getAllTuitions,
  getTuitionById,
  updateTuition,
  deleteTuition,
  searchTuitions
} = require("../../controllers/Schools/tuitionsController");

// Tuition Routes
router.post("/", createTuition);
router.get("/", getAllTuitions);
router.get("/search", searchTuitions);
router.get("/:id", getTuitionById);
router.put("/:id", updateTuition);
router.delete("/:id", deleteTuition);

module.exports = router;