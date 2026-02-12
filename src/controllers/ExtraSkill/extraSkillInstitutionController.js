/* ===============================
   EXTRA SKILL INSTITUTION CONTROLLER
   =============================== */

// GET ALL
exports.getAllExtraSkillInstitutions = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      "SELECT * FROM extra_skill_institutions ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET EXTRA SKILL INSTITUTIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BY TYPE
exports.getExtraSkillInstitutionsByType = async (req, res) => {
  try {
    const { typeId } = req.params;

    const [rows] = await global.db.query(
      "SELECT * FROM extra_skill_institutions WHERE typeId=? ORDER BY id DESC",
      [typeId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET INSTITUTIONS BY TYPE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BY ID
exports.getExtraSkillInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await global.db.query(
      "SELECT * FROM extra_skill_institutions WHERE id=?",
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

// ADD
exports.addExtraSkillInstitution = async (req, res) => {
  try {
    const {
      typeId,
      image,
      name,
      shortDescription,
      area,
      district,
      state,
      about,
      weOffer,
      websiteUrl,
      gallery,
      aboutOurTrainers
    } = req.body;

    if (!typeId || !name) {
      return res.status(400).json({
        message: "typeId and name are required"
      });
    }

    await global.db.query(
      `INSERT INTO extra_skill_institutions
      (typeId, image, name, shortDescription, area, district, state,
       about, weOffer, websiteUrl, gallery, aboutOurTrainers)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        typeId,
        image || null,
        name,
        JSON.stringify(shortDescription || null),
        area || null,
        district || null,
        state || null,
        about || null,
        JSON.stringify(weOffer || null),
        websiteUrl || null,
        JSON.stringify(gallery || null),
        aboutOurTrainers || null
      ]
    );

    res.json({ message: "Extra Skill Institution added successfully" });

  } catch (err) {
    console.error("ADD EXTRA SKILL INSTITUTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateExtraSkillInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      typeId,
      image,
      name,
      shortDescription,
      area,
      district,
      state,
      about,
      weOffer,
      websiteUrl,
      gallery,
      aboutOurTrainers
    } = req.body;

    await global.db.query(
      `UPDATE extra_skill_institutions SET
       typeId=?, image=?, name=?, shortDescription=?, area=?, district=?, state=?,
       about=?, weOffer=?, websiteUrl=?, gallery=?, aboutOurTrainers=?
       WHERE id=?`,
      [
        typeId,
        image,
        name,
        JSON.stringify(shortDescription),
        area,
        district,
        state,
        about,
        JSON.stringify(weOffer),
        websiteUrl,
        JSON.stringify(gallery),
        aboutOurTrainers,
        id
      ]
    );

    res.json({ message: "Extra Skill Institution updated successfully" });

  } catch (err) {
    console.error("UPDATE EXTRA SKILL INSTITUTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteExtraSkillInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    await global.db.query(
      "DELETE FROM extra_skill_institutions WHERE id=?",
      [id]
    );

    res.json({ message: "Extra Skill Institution deleted successfully" });

  } catch (err) {
    console.error("DELETE EXTRA SKILL INSTITUTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
