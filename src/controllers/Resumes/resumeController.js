// POST - Upload Resume
const uploadResume = async (req, res) => {
  try {

    const user_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        message: "Resume file required"
      });
    }

    const resume = req.file.filename;

    await global.db.query(
      `INSERT INTO resumes (user_id, resume)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE resume=?`,
      [user_id, resume, resume]
    );

    res.json({
      success: true,
      message: "Resume uploaded successfully"
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};




// GET - User Resume
const getMyResume = async (req, res) => {
  try {

    const user_id = req.user.id;

    const [[resume]] = await global.db.query(
      `SELECT * FROM resumes WHERE user_id=?`,
      [user_id]
    );

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    res.json({
      success: true,
      data: resume
    });

  } catch (error) {
    console.error("GET MY RESUME ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



// PUT - Update Resume
const updateResume = async (req, res) => {
  try {

    const { user_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Resume file required"
      });
    }

    const resume = req.file.filename;

    await global.db.query(
      `UPDATE resumes SET resume=? WHERE user_id=?`,
      [resume, user_id]
    );

    res.json({
      success: true,
      message: "Resume updated successfully"
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



// GET - Admin View All Resumes
const getAllResumes = async (req, res) => {
  try {

    const [rows] = await global.db.query(`
      SELECT r.id, r.resume, r.createdAt,
      u.username, u.phone, u.email
      FROM resumes r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.id DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("GET RESUMES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



// DELETE - Remove Resume
const deleteResume = async (req, res) => {
  try {

    const { user_id } = req.params;

    await global.db.query(
      `DELETE FROM resumes WHERE user_id=?`,
      [user_id]
    );

    res.json({
      success: true,
      message: "Resume deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  uploadResume,
  getMyResume,
  updateResume,
  getAllResumes,
  deleteResume
};