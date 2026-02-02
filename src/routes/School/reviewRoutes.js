const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/Auth/auth.middleware");
const {
  addReview,
  getEntityReviews,
  getAverageRating,
  updateReview,
  deleteReview
} = require("../../controllers/Schools/reviewController");

// 🌍 PUBLIC – view reviews for one school / tuition
router.get("/:type/:id", getEntityReviews);
router.get("/:type/:id/average", getAverageRating);

// 🔐 PROTECTED – review actions
router.post("/", authMiddleware, addReview);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
