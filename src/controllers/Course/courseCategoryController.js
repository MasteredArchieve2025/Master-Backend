// ❌ NO: const db = require("../config/db");


// ➕ CREATE
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, image, description, sortOrder } = req.body;

    const [result] = await db.query(
      `INSERT INTO course_categories
       (name, icon, image, description, sortOrder)
       VALUES (?, ?, ?, ?, ?)`,
      [name, icon, image, description, sortOrder ?? 0]
    );

    res.status(201).json({
      success: true,
      message: "Category created",
      id: result.insertId,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// 📄 GET ALL
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM course_categories ORDER BY sortOrder ASC`
    );

    res.json({ success: true, data: rows });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// 📄 GET ONE
exports.getCategoryById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM course_categories WHERE id=?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ success: true, data: rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// ✏️ UPDATE
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, image, description, sortOrder } = req.body;

    await db.query(
      `UPDATE course_categories
       SET name=?, icon=?, image=?, description=?, sortOrder=?
       WHERE id=?`,
      [name, icon, image, description, sortOrder, req.params.id]
    );

    res.json({ success: true, message: "Category updated" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// ❌ DELETE
exports.deleteCategory = async (req, res) => {
  try {
    await db.query(
      `DELETE FROM course_categories WHERE id=?`,
      [req.params.id]
    );

    res.json({ success: true, message: "Category deleted" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
