// ➕ CREATE COURSE ITEM
exports.createCourseItem = async (req, res) => {
  try {
    const { categoryId, name, icon, description, sortOrder } = req.body;

    const [result] = await db.query(
      `INSERT INTO course_items
       (categoryId, name, icon, description, sortOrder)
       VALUES (?, ?, ?, ?, ?)`,
      [categoryId, name, icon, description, sortOrder ?? 0]
    );

    res.status(201).json({
      success: true,
      message: "Course item created",
      id: result.insertId,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// 📄 GET ALL COURSE ITEMS
exports.getAllCourseItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ci.*, cc.name AS categoryName
      FROM course_items ci
      JOIN course_categories cc ON cc.id = ci.categoryId
      ORDER BY ci.sortOrder ASC
    `);

    res.json({ success: true, data: rows });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// 📄 GET COURSE ITEMS BY CATEGORY ID
exports.getItemsByCategory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM course_items
       WHERE categoryId = ?
       ORDER BY sortOrder ASC`,
      [req.params.categoryId]
    );

    res.json({ success: true, data: rows });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// 📄 GET SINGLE COURSE ITEM
exports.getCourseItemById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM course_items WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Course item not found" });
    }

    res.json({ success: true, data: rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// ✏️ UPDATE COURSE ITEM
exports.updateCourseItem = async (req, res) => {
  try {
    const { categoryId, name, icon, description, sortOrder } = req.body;

    await db.query(
      `UPDATE course_items
       SET categoryId=?, name=?, icon=?, description=?, sortOrder=?
       WHERE id=?`,
      [categoryId, name, icon, description, sortOrder, req.params.id]
    );

    res.json({ success: true, message: "Course item updated" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// ❌ DELETE COURSE ITEM
exports.deleteCourseItem = async (req, res) => {
  try {
    await db.query(
      `DELETE FROM course_items WHERE id=?`,
      [req.params.id]
    );

    res.json({ success: true, message: "Course item deleted" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
