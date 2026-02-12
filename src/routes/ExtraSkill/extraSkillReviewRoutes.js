const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/Auth/auth.middleware");

const {
  addReview,
  getEntityReviews,
  getAverageRating,
  updateReview,
  deleteReview
} = require("../../controllers/ExtraSkill/extraSkillReviewController");

// 🌍 PUBLIC – view reviews for institution
router.get("/:institutionId", getEntityReviews);
router.get("/:institutionId/average", getAverageRating);

// 🔐 PROTECTED – review actions
router.post("/", authMiddleware, addReview);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
