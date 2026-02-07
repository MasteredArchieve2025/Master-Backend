/* ===============================
   COLLEGE CATEGORY CONTROLLER
   =============================== */

// GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      "SELECT * FROM college_categories ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CATEGORY BY ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await global.db.query(
      "SELECT * FROM college_categories WHERE id=?",
      [id]
    );

    if (!row) return res.status(404).json({ message: "Category not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD CATEGORY
exports.addCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage, description } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "categoryName is required" });
    }

    await global.db.query(
      `INSERT INTO college_categories (categoryName, categoryImage, description)
       VALUES (?,?,?)`,
      [categoryName, categoryImage || null, description || null]
    );

    res.json({ message: "Category added successfully" });
  } catch (err) {
    console.error("ADD CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, categoryImage, description } = req.body;

    await global.db.query(
      `UPDATE college_categories
       SET categoryName=?, categoryImage=?, description=?
       WHERE id=?`,
      [categoryName, categoryImage, description, id]
    );

    res.json({ message: "Category updated successfully" });
  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await global.db.query(
      "DELETE FROM college_categories WHERE id=?",
      [id]
    );
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
