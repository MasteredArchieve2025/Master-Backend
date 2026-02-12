/* ===============================
   EXTRA SKILL REVIEW CONTROLLER
   =============================== */

// 🌍 GET REVIEWS BY INSTITUTION
exports.getEntityReviews = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const [rows] = await global.db.query(
      `SELECT * 
       FROM extra_skill_institution_reviews
       WHERE institutionId=?
       ORDER BY id DESC`,
      [institutionId]
    );

    res.json(rows);

  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🌍 GET AVERAGE RATING
exports.getAverageRating = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const [[result]] = await global.db.query(
      `SELECT 
         COUNT(*) AS totalReviews,
         ROUND(AVG(rating),1) AS averageRating
       FROM extra_skill_institution_reviews
       WHERE institutionId=?`,
      [institutionId]
    );

    res.json(result);

  } catch (err) {
    console.error("GET AVG ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 ADD REVIEW (UserId from token)
exports.addReview = async (req, res) => {
  try {
    const { institutionId, rating, review } = req.body;
    const userId = req.user.id; // 🔥 from auth middleware

    if (!institutionId || !rating || !review) {
      return res.status(400).json({
        message: "institutionId, rating and review are required"
      });
    }

    // Prevent duplicate review by same user
    const [[existing]] = await global.db.query(
      `SELECT id FROM extra_skill_institution_reviews
       WHERE institutionId=? AND userId=?`,
      [institutionId, userId]
    );

    if (existing) {
      return res.status(400).json({
        message: "You already reviewed this institution"
      });
    }

    await global.db.query(
      `INSERT INTO extra_skill_institution_reviews
       (institutionId, userId, rating, review)
       VALUES (?,?,?,?)`,
      [institutionId, userId, rating, review]
    );

    res.json({ message: "Review added successfully" });

  } catch (err) {
    console.error("ADD REVIEW ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 UPDATE REVIEW
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Ensure user updating their own review
    const [[existing]] = await global.db.query(
      `SELECT id FROM extra_skill_institution_reviews
       WHERE id=? AND userId=?`,
      [id, userId]
    );

    if (!existing) {
      return res.status(403).json({
        message: "You can only update your own review"
      });
    }

    await global.db.query(
      `UPDATE extra_skill_institution_reviews
       SET rating=?, review=?
       WHERE id=?`,
      [rating, review, id]
    );

    res.json({ message: "Review updated successfully" });

  } catch (err) {
    console.error("UPDATE REVIEW ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 DELETE REVIEW
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [[existing]] = await global.db.query(
      `SELECT id FROM extra_skill_institution_reviews
       WHERE id=? AND userId=?`,
      [id, userId]
    );

    if (!existing) {
      return res.status(403).json({
        message: "You can only delete your own review"
      });
    }

    await global.db.query(
      "DELETE FROM extra_skill_institution_reviews WHERE id=?",
      [id]
    );

    res.json({ message: "Review deleted successfully" });

  } catch (err) {
    console.error("DELETE REVIEW ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
