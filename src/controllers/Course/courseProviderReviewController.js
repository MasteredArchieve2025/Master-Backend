/* =========================================================
   COURSE PROVIDER REVIEW CONTROLLER
   ========================================================= */


// ➕ ADD REVIEW (JWT REQUIRED)
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseProviderId, rating, review } = req.body;

    if (!courseProviderId || !rating || !review) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1–5" });
    }

    const [provider] = await db.query(
      "SELECT id FROM course_providers WHERE id = ?",
      [courseProviderId]
    );

    if (!provider.length) {
      return res.status(404).json({ message: "Provider not found" });
    }

    await db.query(
      `INSERT INTO course_provider_reviews
       (courseProviderId, userId, rating, review)
       VALUES (?, ?, ?, ?)`,
      [courseProviderId, userId, rating, review]
    );

    await updateProviderRating(courseProviderId);

    res.status(201).json({ message: "Review added successfully" });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "You already reviewed this provider" });
    }
    res.status(500).json({ message: "Server error" });
  }
};



// 📥 GET REVIEWS BY PROVIDER (PUBLIC)
exports.getProviderReviews = async (req, res) => {
  try {
    const { courseProviderId } = req.params;

    const [reviews] = await db.query(
      `SELECT
        r.id,
        r.rating,
        r.review,
        r.createdAt,
        u.id AS userId,
        u.username
       FROM course_provider_reviews r
       JOIN users u ON r.userId = u.id
       WHERE r.courseProviderId = ?
       ORDER BY r.createdAt DESC`,
      [courseProviderId]
    );

    res.json({
      totalReviews: reviews.length,
      reviews,
    });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};



// ⭐ GET PROVIDER RATING SUMMARY
exports.getProviderRating = async (req, res) => {
  try {
    const { courseProviderId } = req.params;

    const [[data]] = await db.query(
      `SELECT
        ROUND(AVG(rating),1) AS avgRating,
        COUNT(*) AS totalReviews
       FROM course_provider_reviews
       WHERE courseProviderId = ?`,
      [courseProviderId]
    );

    res.json({
      avgRating: data.avgRating || 0,
      totalReviews: data.totalReviews,
    });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};



// ✏️ UPDATE REVIEW (OWNER ONLY)
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, review } = req.body;

    if (!rating || !review) {
      return res
        .status(400)
        .json({ message: "Rating & review required" });
    }

    const [existing] = await db.query(
      `SELECT courseProviderId
       FROM course_provider_reviews
       WHERE id = ? AND userId = ?`,
      [reviewId, userId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Review not found" });
    }

    const providerId = existing[0].courseProviderId;

    await db.query(
      `UPDATE course_provider_reviews
       SET rating = ?, review = ?
       WHERE id = ?`,
      [rating, review, reviewId]
    );

    await updateProviderRating(providerId);

    res.json({ message: "Review updated successfully" });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};



// ❌ DELETE REVIEW (OWNER ONLY)
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const [existing] = await db.query(
      `SELECT courseProviderId
       FROM course_provider_reviews
       WHERE id = ? AND userId = ?`,
      [reviewId, userId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Review not found" });
    }

    const providerId = existing[0].courseProviderId;

    await db.query(
      `DELETE FROM course_provider_reviews WHERE id = ?`,
      [reviewId]
    );

    await updateProviderRating(providerId);

    res.json({ message: "Review deleted successfully" });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};




/* =========================================================
   COMMON FUNCTION – UPDATE PROVIDER RATING
   ========================================================= */
const updateProviderRating = async (providerId) => {
  await db.query(
    `UPDATE course_providers
     SET rating = (
       SELECT ROUND(AVG(rating),1)
       FROM course_provider_reviews
       WHERE courseProviderId = ?
     )
     WHERE id = ?`,
    [providerId, providerId]
  );
};
