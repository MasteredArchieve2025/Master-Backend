/* ===============================
   EXTRA SKILL TYPE CONTROLLER
   =============================== */

// GET ALL
exports.getAllExtraSkillTypes = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      "SELECT * FROM extra_skill_types ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET EXTRA SKILL TYPES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BY CATEGORY
exports.getExtraSkillTypesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [rows] = await global.db.query(
      "SELECT * FROM extra_skill_types WHERE categoryId=? ORDER BY id DESC",
      [categoryId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET TYPES BY CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BY ID
exports.getExtraSkillTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await global.db.query(
      "SELECT * FROM extra_skill_types WHERE id=?",
      [id]
    );

    if (!row)
      return res.status(404).json({ message: "Type not found" });

    res.json(row);
  } catch (err) {
    console.error("GET TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD
exports.addExtraSkillType = async (req, res) => {
  try {
    const { categoryId, name, shortDescription, image } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({
        message: "categoryId and name are required"
      });
    }

    await global.db.query(
      `INSERT INTO extra_skill_types (categoryId, name, shortDescription, image)
       VALUES (?,?,?,?)`,
      [categoryId, name, shortDescription || null, image || null]
    );

    res.json({ message: "Extra Skill Type added successfully" });
  } catch (err) {
    console.error("ADD EXTRA SKILL TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateExtraSkillType = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, shortDescription, image } = req.body;

    await global.db.query(
      `UPDATE extra_skill_types
       SET categoryId=?, name=?, shortDescription=?, image=?
       WHERE id=?`,
      [categoryId, name, shortDescription, image, id]
    );

    res.json({ message: "Extra Skill Type updated successfully" });
  } catch (err) {
    console.error("UPDATE EXTRA SKILL TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteExtraSkillType = async (req, res) => {
  try {
    const { id } = req.params;

    await global.db.query(
      "DELETE FROM extra_skill_types WHERE id=?",
      [id]
    );

    res.json({ message: "Extra Skill Type deleted successfully" });
  } catch (err) {
    console.error("DELETE EXTRA SKILL TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
