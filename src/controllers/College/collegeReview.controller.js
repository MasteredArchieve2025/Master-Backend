// controllers/College/collegeReview.controller.js

// ➕ ADD COLLEGE REVIEW (JWT REQUIRED)
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { collegeId, rating, review } = req.body;

    if (!collegeId || !rating || !review) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const [college] = await db.query(
      "SELECT id FROM colleges WHERE id = ?",
      [collegeId]
    );

    if (!college.length) {
      return res.status(404).json({ message: "College not found" });
    }

    await db.query(
      `INSERT INTO college_reviews (collegeId, userId, rating, review)
       VALUES (?, ?, ?, ?)`,
      [collegeId, userId, rating, review]
    );

    await db.query(
      `UPDATE colleges
       SET rating = (
         SELECT ROUND(AVG(rating),1)
         FROM college_reviews
         WHERE collegeId = ?
       )
       WHERE id = ?`,
      [collegeId, collegeId]
    );

    res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "You already reviewed this college" });
    }
    res.status(500).json({ message: "Server error" });
  }
};



// 📥 GET ALL REVIEWS FOR A COLLEGE (PUBLIC)
exports.getCollegeReviews = async (req, res) => {
  try {
    const { collegeId } = req.params;

    const [reviews] = await db.query(
      `SELECT
        r.id,
        r.rating,
        r.review,
        r.createdAt,
        u.id AS userId,
        u.username
       FROM college_reviews r
       JOIN users u ON r.userId = u.id
       WHERE r.collegeId = ?
       ORDER BY r.createdAt DESC`,
      [collegeId]
    );

    res.json({
      totalReviews: reviews.length,
      reviews
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// ⭐ GET COLLEGE RATING SUMMARY (PUBLIC)
exports.getCollegeRating = async (req, res) => {
  try {
    const { collegeId } = req.params;

    const [[data]] = await db.query(
      `SELECT
        ROUND(AVG(rating),1) AS avgRating,
        COUNT(*) AS totalReviews
       FROM college_reviews
       WHERE collegeId = ?`,
      [collegeId]
    );

    res.json({
      avgRating: data.avgRating || 0,
      totalReviews: data.totalReviews
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// ✏️ UPDATE REVIEW (JWT – OWNER ONLY)
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, review } = req.body;

    if (!rating || !review) {
      return res
        .status(400)
        .json({ message: "Rating and review required" });
    }

    const [existing] = await db.query(
      `SELECT collegeId
       FROM college_reviews
       WHERE id = ? AND userId = ?`,
      [reviewId, userId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Review not found" });
    }

    const collegeId = existing[0].collegeId;

    await db.query(
      `UPDATE college_reviews
       SET rating = ?, review = ?
       WHERE id = ?`,
      [rating, review, reviewId]
    );

    await db.query(
      `UPDATE colleges
       SET rating = (
         SELECT ROUND(AVG(rating),1)
         FROM college_reviews
         WHERE collegeId = ?
       )
       WHERE id = ?`,
      [collegeId, collegeId]
    );

    res.json({ message: "Review updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// ❌ DELETE REVIEW (JWT – OWNER ONLY)
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const [existing] = await db.query(
      `SELECT collegeId
       FROM college_reviews
       WHERE id = ? AND userId = ?`,
      [reviewId, userId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Review not found" });
    }

    const collegeId = existing[0].collegeId;

    await db.query(
      `DELETE FROM college_reviews WHERE id = ?`,
      [reviewId]
    );

    await db.query(
      `UPDATE colleges
       SET rating = (
         SELECT ROUND(AVG(rating),1)
         FROM college_reviews
         WHERE collegeId = ?
       )
       WHERE id = ?`,
      [collegeId, collegeId]
    );

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
