/* ===============================
   DEGREE CONTROLLER
   =============================== */

// GET ALL DEGREES
exports.getAllDegrees = async (req, res) => {
  try {
    const [rows] = await global.db.query(`
      SELECT d.*, c.categoryName
      FROM degrees d
      JOIN college_categories c ON c.id = d.categoryId
      ORDER BY d.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET DEGREE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET DEGREE BY ID
exports.getDegreeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await global.db.query(
      "SELECT * FROM degrees WHERE id=?",
      [id]
    );

    if (!row) return res.status(404).json({ message: "Degree not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD DEGREE
exports.addDegree = async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        message: "name & categoryId are required",
      });
    }

    await global.db.query(
      `INSERT INTO degrees (name, categoryId, description)
       VALUES (?,?,?)`,
      [name, categoryId, description || null]
    );

    res.json({ message: "Degree added successfully" });
  } catch (err) {
    console.error("ADD DEGREE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE DEGREE
exports.updateDegree = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, description } = req.body;

    await global.db.query(
      `UPDATE degrees
       SET name=?, categoryId=?, description=?
       WHERE id=?`,
      [name, categoryId, description, id]
    );

    res.json({ message: "Degree updated successfully" });
  } catch (err) {
    console.error("UPDATE DEGREE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE DEGREE
exports.deleteDegree = async (req, res) => {
  try {
    const { id } = req.params;
    await global.db.query(
      "DELETE FROM degrees WHERE id=?",
      [id]
    );
    res.json({ message: "Degree deleted successfully" });
  } catch (err) {
    console.error("DELETE DEGREE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
