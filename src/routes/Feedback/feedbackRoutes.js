const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/Auth/auth.middleware");
const {
  addFeedback,
  getAllFeedback
} = require("../../controllers/Feedback/feedbackController");

// 🌍 PUBLIC
router.get("/", getAllFeedback);

// 🔐 JWT REQUIRED
router.post("/", authMiddleware, addFeedback);

module.exports = router;
