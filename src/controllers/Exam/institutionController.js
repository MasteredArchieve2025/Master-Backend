/* ===============================
   INSTITUTION CONTROLLER
   =============================== */

// GET ALL INSTITUTIONS
exports.getAllInstitutions = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      "SELECT * FROM institutions ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET INSTITUTIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET INSTITUTIONS BY TYPE
exports.getInstitutionsByType = async (req, res) => {
  try {
    const { typeId } = req.params;

    const [rows] = await global.db.query(
      "SELECT * FROM institutions WHERE typeId=? ORDER BY id DESC",
      [typeId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET INSTITUTIONS BY TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET INSTITUTION BY ID
exports.getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await global.db.query(
      "SELECT * FROM institutions WHERE id=?",
      [id]
    );

    if (!row)
      return res.status(404).json({ message: "Institution not found" });

    res.json(row);
  } catch (err) {
    console.error("GET INSTITUTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD INSTITUTION
exports.addInstitution = async (req, res) => {
  try {
    const {
      typeId,
      institutionName,
      institutionImage,
      category,
      shortDescription,
      rating,
      result,
      location,
      subjectsOffered,
      teachingMode,
      about,
      mapLink,
      mobileNumber,
      whatsappNumber,
      gallery
    } = req.body;

    if (!typeId || !institutionName) {
      return res.status(400).json({
        message: "typeId and institutionName are required"
      });
    }

    await global.db.query(
      `INSERT INTO institutions
      (typeId, institutionName, institutionImage, category, shortDescription,
       rating, result, location, subjectsOffered, teachingMode,
       about, mapLink, mobileNumber, whatsappNumber, gallery)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        typeId,
        institutionName,
        institutionImage || null,
        JSON.stringify(category || null),
        shortDescription || null,
        rating || 0.0,
        result || null,
        location || null,
        JSON.stringify(subjectsOffered || null),
        JSON.stringify(teachingMode || null),
        about || null,
        mapLink || null,
        mobileNumber || null,
        whatsappNumber || null,
        JSON.stringify(gallery || null)
      ]
    );

    res.json({ message: "Institution added successfully" });

  } catch (err) {
    console.error("ADD INSTITUTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE INSTITUTION
exports.updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      typeId,
      institutionName,
      institutionImage,
      category,
      shortDescription,
      rating,
      result,
      location,
      subjectsOffered,
      teachingMode,
      about,
      mapLink,
      mobileNumber,
      whatsappNumber,
      gallery
    } = req.body;

    await global.db.query(
      `UPDATE institutions SET
       typeId=?, institutionName=?, institutionImage=?, category=?, shortDescription=?,
       rating=?, result=?, location=?, subjectsOffered=?, teachingMode=?,
       about=?, mapLink=?, mobileNumber=?, whatsappNumber=?, gallery=?
       WHERE id=?`,
      [
        typeId,
        institutionName,
        institutionImage,
        JSON.stringify(category),
        shortDescription,
        rating,
        result,
        location,
        JSON.stringify(subjectsOffered),
        JSON.stringify(teachingMode),
        about,
        mapLink,
        mobileNumber,
        whatsappNumber,
        JSON.stringify(gallery),
        id
      ]
    );

    res.json({ message: "Institution updated successfully" });

  } catch (err) {
    console.error("UPDATE INSTITUTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE INSTITUTION
exports.deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    await global.db.query(
      "DELETE FROM institutions WHERE id=?",
      [id]
    );

    res.json({ message: "Institution deleted successfully" });

  } catch (err) {
    console.error("DELETE INSTITUTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
