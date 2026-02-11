/* ===============================
   EXAM DETAILS CONTROLLER
   =============================== */

// GET ALL EXAM DETAILS
exports.getAllExamDetails = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      "SELECT * FROM exam_details ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET EXAM DETAILS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET EXAM DETAILS BY ID
exports.getExamDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await global.db.query(
      "SELECT * FROM exam_details WHERE id=?",
      [id]
    );

    if (!row)
      return res.status(404).json({ message: "Exam details not found" });

    res.json(row);
  } catch (err) {
    console.error("GET EXAM DETAILS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD EXAM DETAILS
exports.addExamDetails = async (req, res) => {
  try {
    const {
      typeId,
      name,
      shortDescription,
      board,
      year,
      duration,
      totalMarks,
      subjects,
      detailedSyllabus,
      examPattern,
      questionTypes,
      importantDates,
      image
    } = req.body;

    if (!typeId || !name) {
      return res.status(400).json({
        message: "typeId and name are required"
      });
    }

    await global.db.query(
      `INSERT INTO exam_details 
      (typeId, name, shortDescription, board, year, duration, totalMarks,
       subjects, detailedSyllabus, examPattern, questionTypes,
       importantDates, image)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        typeId,
        name,
        shortDescription || null,
        board || null,
        year || null,
        duration || null,
        totalMarks || null,
        JSON.stringify(subjects || null),
        detailedSyllabus || null,
        JSON.stringify(examPattern || null),
        JSON.stringify(questionTypes || null),
        importantDates || null,
        image || null
      ]
    );

    res.json({ message: "Exam details added successfully" });
  } catch (err) {
    console.error("ADD EXAM DETAILS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE EXAM DETAILS
exports.updateExamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      typeId,
      name,
      shortDescription,
      board,
      year,
      duration,
      totalMarks,
      subjects,
      detailedSyllabus,
      examPattern,
      questionTypes,
      importantDates,
      image
    } = req.body;

    await global.db.query(
      `UPDATE exam_details SET
       typeId=?, name=?, shortDescription=?, board=?, year=?, duration=?, totalMarks=?,
       subjects=?, detailedSyllabus=?, examPattern=?, questionTypes=?,
       importantDates=?, image=?
       WHERE id=?`,
      [
        typeId,
        name,
        shortDescription,
        board,
        year,
        duration,
        totalMarks,
        JSON.stringify(subjects),
        detailedSyllabus,
        JSON.stringify(examPattern),
        JSON.stringify(questionTypes),
        importantDates,
        image,
        id
      ]
    );

    res.json({ message: "Exam details updated successfully" });
  } catch (err) {
    console.error("UPDATE EXAM DETAILS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE EXAM DETAILS
exports.deleteExamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    await global.db.query(
      "DELETE FROM exam_details WHERE id=?",
      [id]
    );

    res.json({ message: "Exam details deleted successfully" });
  } catch (err) {
    console.error("DELETE EXAM DETAILS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
