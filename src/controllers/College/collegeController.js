/* ===============================
   COLLEGE CONTROLLER
   =============================== */

const safeParse = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val || [];
  } catch {
    return [];
  }
};

// GET ALL COLLEGES
exports.getAllColleges = async (req, res) => {
  try {
    const [rows] = await global.db.query(`
      SELECT c.*, cat.categoryName, d.name AS degreeName
      FROM colleges c
      JOIN college_categories cat ON cat.id = c.categoryId
      JOIN degrees d ON d.id = c.degreeId
      ORDER BY c.id DESC
    `);

    rows.forEach(c => {
      c.departments = safeParse(c.departments);
      c.facilities = safeParse(c.facilities);
    });

    res.json(rows);
  } catch (err) {
    console.error("GET COLLEGES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET COLLEGE BY ID
exports.getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[c]] = await global.db.query(
      "SELECT * FROM colleges WHERE id=?",
      [id]
    );

    if (!c) return res.status(404).json({ message: "College not found" });

    c.departments = safeParse(c.departments);
    c.facilities = safeParse(c.facilities);

    res.json(c);
  } catch (err) {
    console.error("GET COLLEGE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD COLLEGE
exports.addCollege = async (req, res) => {
  try {
    const c = req.body;

    if (!c.name || !c.categoryId || !c.degreeId || !c.ownership) {
      return res.status(400).json({
        message: "name, categoryId, degreeId & ownership are required",
      });
    }

    await global.db.query(
      `INSERT INTO colleges (
        name, shortName, categoryId, degreeId,
        ownership, collegeStatus, affiliatedUniversity,
        address, city, state,
        aboutCollege, academics,
        departments, facilities,
        placementInfo, admissionInfo,
        phone, whatsapp, email, website, mapLink,
        logo, collegeImage
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        c.name,
        c.shortName || null,
        c.categoryId,
        c.degreeId,
        c.ownership,
        c.collegeStatus || "Affiliated",
        c.affiliatedUniversity || null,
        c.address || null,
        c.city || null,
        c.state || null,
        c.aboutCollege || null,
        c.academics || null,
        JSON.stringify(c.departments || []),
        JSON.stringify(c.facilities || []),
        c.placementInfo || null,
        c.admissionInfo || null,
        c.phone || null,
        c.whatsapp || null,
        c.email || null,
        c.website || null,
        c.mapLink || null,
        c.logo || null,
        c.collegeImage || null,
      ]
    );

    res.json({ message: "College added successfully" });
  } catch (err) {
    console.error("ADD COLLEGE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE COLLEGE
exports.updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;

    await global.db.query(
      `UPDATE colleges SET
        name=?, shortName=?, categoryId=?, degreeId=?,
        ownership=?, collegeStatus=?, affiliatedUniversity=?,
        address=?, city=?, state=?,
        aboutCollege=?, academics=?,
        departments=?, facilities=?,
        placementInfo=?, admissionInfo=?,
        phone=?, whatsapp=?, email=?, website=?, mapLink=?,
        logo=?, collegeImage=?
       WHERE id=?`,
      [
        c.name,
        c.shortName,
        c.categoryId,
        c.degreeId,
        c.ownership,
        c.collegeStatus,
        c.affiliatedUniversity,
        c.address,
        c.city,
        c.state,
        c.aboutCollege,
        c.academics,
        JSON.stringify(c.departments || []),
        JSON.stringify(c.facilities || []),
        c.placementInfo,
        c.admissionInfo,
        c.phone,
        c.whatsapp,
        c.email,
        c.website,
        c.mapLink,
        c.logo,
        c.collegeImage,
        id,
      ]
    );

    res.json({ message: "College updated successfully" });
  } catch (err) {
    console.error("UPDATE COLLEGE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE COLLEGE
exports.deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    await global.db.query(
      "DELETE FROM colleges WHERE id=?",
      [id]
    );
    res.json({ message: "College deleted successfully" });
  } catch (err) {
    console.error("DELETE COLLEGE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
