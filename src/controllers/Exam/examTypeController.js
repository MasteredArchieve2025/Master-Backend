/* ===============================
   EXAM TYPE CONTROLLER
   =============================== */

// GET ALL EXAM TYPES
exports.getAllExamTypes = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      `SELECT * FROM exam_types ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET EXAM TYPES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET EXAM TYPE BY ID
exports.getExamTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await global.db.query(
      "SELECT * FROM exam_types WHERE id=?",
      [id]
    );

    if (!row) return res.status(404).json({ message: "Exam type not found" });
    res.json(row);
  } catch (err) {
    console.error("GET EXAM TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET EXAM TYPES BY CATEGORY ID
exports.getExamTypesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [rows] = await global.db.query(
      "SELECT * FROM exam_types WHERE categoryId=? ORDER BY id DESC",
      [categoryId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET EXAM TYPES BY CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD EXAM TYPE
exports.addExamType = async (req, res) => {
  try {
    const { categoryId, name, shortDescription, image } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({
        message: "categoryId and name are required",
      });
    }

    await global.db.query(
      `INSERT INTO exam_types (categoryId, name, shortDescription, image)
       VALUES (?,?,?,?)`,
      [categoryId, name, shortDescription || null, image || null]
    );

    res.json({ message: "Exam type added successfully" });
  } catch (err) {
    console.error("ADD EXAM TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE EXAM TYPE
exports.updateExamType = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, shortDescription, image } = req.body;

    await global.db.query(
      `UPDATE exam_types
       SET categoryId=?, name=?, shortDescription=?, image=?
       WHERE id=?`,
      [categoryId, name, shortDescription, image, id]
    );

    res.json({ message: "Exam type updated successfully" });
  } catch (err) {
    console.error("UPDATE EXAM TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE EXAM TYPE
exports.deleteExamType = async (req, res) => {
  try {
    const { id } = req.params;

    await global.db.query(
      "DELETE FROM exam_types WHERE id=?",
      [id]
    );

    res.json({ message: "Exam type deleted successfully" });
  } catch (err) {
    console.error("DELETE EXAM TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
