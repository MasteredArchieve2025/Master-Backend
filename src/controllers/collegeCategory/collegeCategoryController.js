//
// controllers/CollegeCategories/collegeCategoryController.js
//

// ========== CREATE CATEGORY ==========
exports.createCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage, description } = req.body;

    if (!categoryName)
      return res.status(400).json({ message: "categoryName is required" });

    if (!categoryImage)
      return res.status(400).json({ message: "categoryImage is required" });

    const [result] = await global.db.query(
      `INSERT INTO college_categories 
       (categoryName, categoryImage, description)
       VALUES (?, ?, ?)`,
      [categoryName, categoryImage, description || null]
    );

    res.json({
      success: true,
      message: "Category created successfully",
      id: result.insertId
    });

  } catch (err) {
    console.error("❌ Create Category Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== GET ALL ==========
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      `SELECT * FROM college_categories ORDER BY id DESC`
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (err) {
    console.error("❌ Get Categories Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== GET BY ID ==========
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await global.db.query(
      `SELECT * FROM college_categories WHERE id = ?`,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Category not found" });

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error("❌ Get Category By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== UPDATE CATEGORY ==========
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [exists] = await global.db.query(
      `SELECT * FROM college_categories WHERE id = ?`,
      [id]
    );

    if (!exists.length)
      return res.status(404).json({ message: "Category not found" });

    const old = exists[0];

    const { categoryName, categoryImage, description } = req.body;

    await global.db.query(
      `UPDATE college_categories SET 
        categoryName = ?, 
        categoryImage = ?, 
        description = ?
       WHERE id = ?`,
      [
        categoryName || old.categoryName,
        categoryImage || old.categoryImage,
        description || old.description,
        id
      ]
    );

    res.json({
      success: true,
      message: "Category updated successfully"
    });

  } catch (err) {
    console.error("❌ Update Category Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== DELETE ==========
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await global.db.query(
      `SELECT * FROM college_categories WHERE id = ?`,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Category not found" });

    await global.db.query(
      `DELETE FROM college_categories WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (err) {
    console.error("❌ Delete Category Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
