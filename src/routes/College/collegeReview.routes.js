const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/Auth/auth.middleware");

const {
  createReview,
  getCollegeReviews,
  getCollegeRating,
  updateReview,
  deleteReview
} = require("../../controllers/College/collegeReview.controller");

// 🌍 PUBLIC
router.get("/:collegeId", getCollegeReviews);
router.get("/:collegeId/rating", getCollegeRating);

// 🔐 PROTECTED
router.post("/", authMiddleware, createReview);
router.put("/:reviewId", authMiddleware, updateReview);
router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;
