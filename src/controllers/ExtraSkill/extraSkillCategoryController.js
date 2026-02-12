/* ===============================
   EXTRA SKILL CATEGORY CONTROLLER
   =============================== */

// GET ALL
exports.getAllExtraSkillCategories = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      "SELECT * FROM extra_skill_categories ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET EXTRA SKILL CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BY ID
exports.getExtraSkillCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await global.db.query(
      "SELECT * FROM extra_skill_categories WHERE id=?",
      [id]
    );

    if (!row)
      return res.status(404).json({ message: "Category not found" });

    res.json(row);
  } catch (err) {
    console.error("GET EXTRA SKILL CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD
exports.addExtraSkillCategory = async (req, res) => {
  try {
    const { name, shortDescription, image } = req.body;

    if (!name)
      return res.status(400).json({ message: "Name is required" });

    await global.db.query(
      `INSERT INTO extra_skill_categories (name, shortDescription, image)
       VALUES (?,?,?)`,
      [name, shortDescription || null, image || null]
    );

    res.json({ message: "Extra Skill Category added successfully" });
  } catch (err) {
    console.error("ADD EXTRA SKILL CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateExtraSkillCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortDescription, image } = req.body;

    await global.db.query(
      `UPDATE extra_skill_categories
       SET name=?, shortDescription=?, image=?
       WHERE id=?`,
      [name, shortDescription, image, id]
    );

    res.json({ message: "Extra Skill Category updated successfully" });
  } catch (err) {
    console.error("UPDATE EXTRA SKILL CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteExtraSkillCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await global.db.query(
      "DELETE FROM extra_skill_categories WHERE id=?",
      [id]
    );

    res.json({ message: "Extra Skill Category deleted successfully" });
  } catch (err) {
    console.error("DELETE EXTRA SKILL CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
