// ➕ CREATE PROVIDER
exports.createProvider = async (req, res) => {
  try {
    const {
      courseItemId,
      name,
      image,
      shortDescription,
      about,
      location,
      area,
      district,
      state,
      mapLink,
      rating,
      teachingMode,
      coursesOffered,
      benefits,
      mobileNumber,
      whatsappNumber,
      websiteUrl,
      gallery
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO course_providers
      (courseItemId, name, image, shortDescription, about, location, area,
       district, state, mapLink, rating, teachingMode, coursesOffered,
       benefits, mobileNumber, whatsappNumber, websiteUrl, gallery)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseItemId,
        name,
        image,
        shortDescription,
        about,
        location,
        area,
        district,
        state,
        mapLink,
        rating ?? 0,
        JSON.stringify(teachingMode),
        JSON.stringify(coursesOffered),
        benefits,
        mobileNumber,
        whatsappNumber,
        websiteUrl,
        JSON.stringify(gallery)
      ]
    );

    res.status(201).json({
      success: true,
      message: "Provider created",
      id: result.insertId
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// 📄 GET ALL PROVIDERS
exports.getAllProviders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cp.*, ci.name AS courseItemName
      FROM course_providers cp
      JOIN course_items ci ON ci.id = cp.courseItemId
      ORDER BY cp.id DESC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// 📄 GET BY COURSE ITEM ID  🔥 (MAIN FOR APP)
exports.getProvidersByCourseItem = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM course_providers WHERE courseItemId=?`,
      [req.params.courseItemId]
    );

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// 📄 GET SINGLE PROVIDER
exports.getProviderById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM course_providers WHERE id=?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// ✏️ UPDATE PROVIDER
exports.updateProvider = async (req, res) => {
  try {
    const {
      courseItemId,
      name,
      image,
      shortDescription,
      about,
      location,
      area,
      district,
      state,
      mapLink,
      rating,
      teachingMode,
      coursesOffered,
      benefits,
      mobileNumber,
      whatsappNumber,
      websiteUrl,
      gallery
    } = req.body;

    await db.query(
      `UPDATE course_providers SET
       courseItemId=?, name=?, image=?, shortDescription=?, about=?,
       location=?, area=?, district=?, state=?, mapLink=?, rating=?,
       teachingMode=?, coursesOffered=?, benefits=?, mobileNumber=?,
       whatsappNumber=?, websiteUrl=?, gallery=?
       WHERE id=?`,
      [
        courseItemId,
        name,
        image,
        shortDescription,
        about,
        location,
        area,
        district,
        state,
        mapLink,
        rating,
        JSON.stringify(teachingMode),
        JSON.stringify(coursesOffered),
        benefits,
        mobileNumber,
        whatsappNumber,
        websiteUrl,
        JSON.stringify(gallery),
        req.params.id
      ]
    );

    res.json({ success: true, message: "Provider updated" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// ❌ DELETE PROVIDER
exports.deleteProvider = async (req, res) => {
  try {
    await db.query(`DELETE FROM course_providers WHERE id=?`, [
      req.params.id
    ]);

    res.json({ success: true, message: "Provider deleted" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
