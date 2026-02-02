// ⭐ HELPER: Check entity exists
const checkEntityExists = async (entityType, entityId) => {
  if (entityType === "school") {
    const [rows] = await global.db.query(
      "SELECT id FROM schools WHERE id = ?",
      [entityId]
    );
    return rows.length > 0;
  }

  if (entityType === "tuition") {
    const [rows] = await global.db.query(
      "SELECT id FROM tuitions WHERE id = ?",
      [entityId]
    );
    return rows.length > 0;
  }

  return false;
};

// ⭐ HELPER: Auto-update rating
const updateEntityRating = async (entityType, entityId) => {
  const [[data]] = await global.db.query(
    `SELECT ROUND(AVG(rating), 1) AS avgRating
     FROM reviews
     WHERE entityType = ? AND entityId = ?`,
    [entityType, entityId]
  );

  const avgRating = data.avgRating || 0;

  if (entityType === "school") {
    await global.db.query(
      "UPDATE schools SET rating = ? WHERE id = ?",
      [avgRating, entityId]
    );
  }

  if (entityType === "tuition") {
    await global.db.query(
      "UPDATE tuitions SET rating = ? WHERE id = ?",
      [avgRating, entityId]
    );
  }
};



// ➕ ADD REVIEW (JWT REQUIRED + VALIDATION)
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { entityType, entityId, rating, review } = req.body;

    // Basic validation
    if (!entityType || !entityId || !rating || !review) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["school", "tuition"].includes(entityType)) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // 🔒 ENTITY EXISTENCE VALIDATION
    const exists = await checkEntityExists(entityType, entityId);
    if (!exists) {
      return res.status(404).json({
        message:
          entityType === "school"
            ? "School not found"
            : "Tuition not found"
      });
    }

    await global.db.query(
      `INSERT INTO reviews (userId, entityType, entityId, rating, review)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, entityType, entityId, rating, review]
    );

    // ⭐ AUTO UPDATE RATING
    await updateEntityRating(entityType, entityId);

    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "You already reviewed this"
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};



// 📥 GET ALL REVIEWS FOR ONE SCHOOL / TUITION (PUBLIC)
exports.getEntityReviews = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!["school", "tuition"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    const [reviews] = await global.db.query(
      `SELECT
        r.id,
        r.rating,
        r.review,
        r.createdAt,
        u.id AS userId,
        u.username
       FROM reviews r
       JOIN users u ON r.userId = u.id
       WHERE r.entityType = ? AND r.entityId = ?
       ORDER BY r.createdAt DESC`,
      [type, id]
    );

    res.json({
      totalReviews: reviews.length,
      reviews
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// ⭐ GET AVERAGE RATING (PUBLIC)
exports.getAverageRating = async (req, res) => {
  try {
    const { type, id } = req.params;

    const [[data]] = await global.db.query(
      `SELECT 
        ROUND(AVG(rating), 1) AS avgRating,
        COUNT(*) AS totalReviews
       FROM reviews
       WHERE entityType = ? AND entityId = ?`,
      [type, id]
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
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!rating || !review) {
      return res.status(400).json({ message: "Rating and review required" });
    }

    const [existing] = await global.db.query(
      `SELECT entityType, entityId FROM reviews WHERE id = ? AND userId = ?`,
      [id, userId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Review not found" });
    }

    const { entityType, entityId } = existing[0];

    await global.db.query(
      "UPDATE reviews SET rating = ?, review = ? WHERE id = ?",
      [rating, review, id]
    );

    await updateEntityRating(entityType, entityId);

    res.json({ message: "Review updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// ❌ DELETE REVIEW (JWT – OWNER ONLY)
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [existing] = await global.db.query(
      `SELECT entityType, entityId FROM reviews WHERE id = ? AND userId = ?`,
      [id, userId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Review not found" });
    }

    const { entityType, entityId } = existing[0];

    await global.db.query("DELETE FROM reviews WHERE id = ?", [id]);

    await updateEntityRating(entityType, entityId);

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
