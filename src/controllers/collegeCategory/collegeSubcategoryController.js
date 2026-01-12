//
// controllers/CollegeSubcategories/collegeSubcategoryController.js
//

// ========== CREATE SUBCATEGORY ==========
exports.createSubcategory = async (req, res) => {
  try {
    const { categoryId, name, description, image } = req.body;

    if (!categoryId)
      return res.status(400).json({ message: "categoryId is required" });

    if (!name)
      return res.status(400).json({ message: "name is required" });

    if (!image)
      return res.status(400).json({ message: "image is required" });

    // Check category exists
    const [cat] = await global.db.query(
      `SELECT id FROM college_categories WHERE id = ?`,
      [categoryId]
    );

    if (!cat.length)
      return res.status(404).json({ message: "Category not found" });

    const [result] = await global.db.query(
      `INSERT INTO college_subcategories 
       (categoryId, name, description, image)
       VALUES (?, ?, ?, ?)`,
      [categoryId, name, description || null, image]
    );

    res.json({
      success: true,
      message: "Subcategory created successfully",
      id: result.insertId
    });

  } catch (err) {
    console.error("❌ Create Subcategory Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== GET ALL SUBCATEGORIES ==========
exports.getAllSubcategories = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      `SELECT sc.*, c.categoryName 
       FROM college_subcategories sc
       JOIN college_categories c ON sc.categoryId = c.id
       ORDER BY sc.id DESC`
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (err) {
    console.error("❌ Get Subcategories Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== GET SUBCATEGORY BY ID ==========
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await global.db.query(
      `SELECT * FROM college_subcategories WHERE id = ?`,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Subcategory not found" });

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error("❌ Get Subcategory By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== UPDATE SUBCATEGORY ==========
exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [exists] = await global.db.query(
      `SELECT * FROM college_subcategories WHERE id = ?`,
      [id]
    );

    if (!exists.length)
      return res.status(404).json({ message: "Subcategory not found" });

    const old = exists[0];

    const { categoryId, name, description, image } = req.body;

    await global.db.query(
      `UPDATE college_subcategories SET
        categoryId = ?,
        name = ?,
        description = ?,
        image = ?
       WHERE id = ?`,
      [
        categoryId || old.categoryId,
        name || old.name,
        description || old.description,
        image || old.image,
        id
      ]
    );

    res.json({
      success: true,
      message: "Subcategory updated successfully"
    });

  } catch (err) {
    console.error("❌ Update Subcategory Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== DELETE SUBCATEGORY ==========
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await global.db.query(
      `SELECT * FROM college_subcategories WHERE id = ?`,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Subcategory not found" });

    await global.db.query(
      `DELETE FROM college_subcategories WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Subcategory deleted successfully"
    });

  } catch (err) {
    console.error("❌ Delete Subcategory Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
