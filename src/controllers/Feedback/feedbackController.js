/* =========================
   FEEDBACK CONTROLLER
   ========================= */

// ➕ ADD FEEDBACK (JWT REQUIRED)
exports.addFeedback = async (req, res) => {
  try {
    const userId = req.user.id; // 👈 from JWT
    const { name, email, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({
        message: "Name, rating and comment are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    await global.db.query(
      `INSERT INTO feedbacks (userId, name, email, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, email || null, rating, comment]
    );

    res.status(201).json({
      message: "Feedback submitted successfully ✅"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// 📥 GET ALL FEEDBACK (PUBLIC)
exports.getAllFeedback = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      `SELECT
        f.id,
        f.name,
        f.rating,
        f.comment,
        f.createdAt
       FROM feedbacks f
       ORDER BY f.createdAt DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
