// ➕ CREATE
exports.createJobCategory = async (req, res) => {
  try {
    const { name, description, image, sortOrder } = req.body;

    const [result] = await db.query(
      `INSERT INTO job_categories
       (name, description, image, sortOrder)
       VALUES (?, ?, ?, ?)`,
      [name, description, image, sortOrder ?? 0]
    );

    res.status(201).json({
      success: true,
      message: "Job category created",
      id: result.insertId
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// 📄 GET ALL
exports.getAllJobCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM job_categories ORDER BY sortOrder ASC`
    );

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// 📄 GET SINGLE
exports.getJobCategoryById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM job_categories WHERE id=?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// ✏️ UPDATE
exports.updateJobCategory = async (req, res) => {
  try {
    const { name, description, image, sortOrder } = req.body;

    await db.query(
      `UPDATE job_categories
       SET name=?, description=?, image=?, sortOrder=?
       WHERE id=?`,
      [name, description, image, sortOrder ?? 0, req.params.id]
    );

    res.json({ success: true, message: "Category updated" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// ❌ DELETE
exports.deleteJobCategory = async (req, res) => {
  try {
    await db.query(
      `DELETE FROM job_categories WHERE id=?`,
      [req.params.id]
    );

    res.json({ success: true, message: "Category deleted" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};