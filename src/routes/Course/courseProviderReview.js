const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/Auth/auth.middleware");

const {
  createReview,
  getProviderReviews,
  getProviderRating,
  updateReview,
  deleteReview
} = require("../../controllers/Course/courseProviderReviewController");


// 🌍 PUBLIC
router.get("/:courseProviderId", getProviderReviews);
router.get("/:courseProviderId/rating", getProviderRating);


// 🔐 PROTECTED
router.post("/", authMiddleware, createReview);
router.put("/:reviewId", authMiddleware, updateReview);
router.delete("/:reviewId", authMiddleware, deleteReview);


module.exports = router;
