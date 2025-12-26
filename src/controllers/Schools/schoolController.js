//
// controllers/Schools/schoolController.js
//

// helper to safely parse JSON arrays
const safeJson = (value) => {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch {
    return [];
  }
};

// ========== CREATE SCHOOL ==========
exports.createSchool = async (req, res) => {
  try {
    const {
      schoolName,
      category,
      description,
      ourVision,
      ourMission,
      address1,
      address2,
      mobileNumber,
      whatsappNumber,
      emailId,
      youtubeUrl,
      schoolLogo,
      bannerImage,
      images
    } = req.body;

    if (!schoolName)
      return res.status(400).json({ message: "schoolName is required" });

    const [result] = await global.db.query(
      `INSERT INTO schools 
      (schoolName, schoolLogo, bannerImage, category, description, images, 
       ourVision, ourMission, address1, address2, mobileNumber, whatsappNumber,
       emailId, youtubeUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        schoolName,
        schoolLogo || null,
        bannerImage || null,
        category || null,
        description || null,
        JSON.stringify(images || []),
        ourVision || null,
        ourMission || null,
        address1 || null,
        address2 || null,
        mobileNumber || null,
        whatsappNumber || null,
        emailId || null,
        youtubeUrl || null,
      ]
    );

    res.json({
      success: true,
      message: "School created successfully",
      id: result.insertId
    });

  } catch (err) {
    console.error("❌ Create School Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== GET ALL ==========
exports.getSchools = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      `SELECT * FROM schools ORDER BY id DESC`
    );

    const data = rows.map((s) => ({
      ...s,
      images: safeJson(s.images),
    }));

    res.json({ success: true, data });

  } catch (err) {
    console.error("❌ Get Schools Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== GET BY ID ==========
exports.getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await global.db.query(
      `SELECT * FROM schools WHERE id = ?`,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "School not found" });

    const school = rows[0];
    school.images = safeJson(school.images);

    res.json({ success: true, data: school });

  } catch (err) {
    console.error("❌ Get School By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== UPDATE ==========
exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const [exists] = await global.db.query(
      `SELECT * FROM schools WHERE id = ?`,
      [id]
    );

    if (!exists.length)
      return res.status(404).json({ message: "School not found" });

    const old = exists[0];

    const {
      schoolName,
      category,
      description,
      ourVision,
      ourMission,
      address1,
      address2,
      mobileNumber,
      whatsappNumber,
      emailId,
      youtubeUrl,
      schoolLogo,
      bannerImage,
      images
    } = req.body;

    await global.db.query(
      `UPDATE schools SET 
        schoolName=?, schoolLogo=?, bannerImage=?, category=?, description=?, images=?,
        ourVision=?, ourMission=?, address1=?, address2=?, mobileNumber=?, whatsappNumber=?,
        emailId=?, youtubeUrl=?
       WHERE id=?`,
      [
        schoolName || old.schoolName,
        schoolLogo || old.schoolLogo,
        bannerImage || old.bannerImage,
        category || old.category,
        description || old.description,
        JSON.stringify(images || safeJson(old.images)),
        ourVision || old.ourVision,
        ourMission || old.ourMission,
        address1 || old.address1,
        address2 || old.address2,
        mobileNumber || old.mobileNumber,
        whatsappNumber || old.whatsappNumber,
        emailId || old.emailId,
        youtubeUrl || old.youtubeUrl,
        id,
      ]
    );

    res.json({
      success: true,
      message: "School updated successfully",
    });

  } catch (err) {
    console.error("❌ Update School Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ========== DELETE ==========
exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await global.db.query(
      `SELECT * FROM schools WHERE id = ?`,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "School not found" });

    await global.db.query(`DELETE FROM schools WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: "School deleted successfully",
    });

  } catch (err) {
    console.error("❌ Delete School Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
