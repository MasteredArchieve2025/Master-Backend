/* ===============================
   EXAM CATEGORY CONTROLLER
   =============================== */

// GET ALL EXAM CATEGORIES
exports.getAllExamCategories = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      "SELECT * FROM exam_categories ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET EXAM CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET EXAM CATEGORY BY ID
exports.getExamCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await global.db.query(
      "SELECT * FROM exam_categories WHERE id=?",
      [id]
    );

    if (!row)
      return res.status(404).json({ message: "Exam category not found" });

    res.json(row);
  } catch (err) {
    console.error("GET EXAM CATEGORY BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD EXAM CATEGORY
exports.addExamCategory = async (req, res) => {
  try {
    const { name, shortDescription, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    await global.db.query(
      `INSERT INTO exam_categories (name, shortDescription, image)
       VALUES (?,?,?)`,
      [name, shortDescription || null, image || null]
    );

    res.json({ message: "Exam category added successfully" });
  } catch (err) {
    console.error("ADD EXAM CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE EXAM CATEGORY
exports.updateExamCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortDescription, image } = req.body;

    await global.db.query(
      `UPDATE exam_categories
       SET name=?, shortDescription=?, image=?
       WHERE id=?`,
      [name, shortDescription, image, id]
    );

    res.json({ message: "Exam category updated successfully" });
  } catch (err) {
    console.error("UPDATE EXAM CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE EXAM CATEGORY
exports.deleteExamCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await global.db.query(
      "DELETE FROM exam_categories WHERE id=?",
      [id]
    );

    res.json({ message: "Exam category deleted successfully" });
  } catch (err) {
    console.error("DELETE EXAM CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
