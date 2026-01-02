global.db;

// -------- Helper: convert incoming values to JSON safely ----------
const formatArrayToJson = (data) => {
  if (Array.isArray(data)) return JSON.stringify(data);

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed)
        ? JSON.stringify(parsed)
        : JSON.stringify([data]);
    } catch {
      return JSON.stringify([data]);
    }
  }

  return JSON.stringify([]);
};

// -------- Helper: parse DB JSON safely ----------
const parseJson = (content) => {
  if (!content) return [];
  try {
    if (Array.isArray(content)) return content;
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (typeof content === "string" && content.startsWith("http"))
      return [content];
    return [];
  }
};


//
// 1️⃣ CREATE ADVERTISEMENT
//
exports.createAdvertisement = async (req, res) => {
  const { category, page1id, page2id, page3id, imageUrl, youtubeLinks } =
    req.body;

  try {
    const finalImage = formatArrayToJson(imageUrl);
    const finalLinks = formatArrayToJson(youtubeLinks);

    const [result] = await db.query(
      `INSERT INTO advertisements 
        (category, page1id, page2id, page3id, imageUrl, youtubeLinks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category, page1id, page2id, page3id, finalImage, finalLinks]
    );

    res.json({
      result: "Success",
      message: "Advertisement created successfully",
      insertId: result.insertId,
    });
  } catch (err) {
    console.error("Error in createAdvertisement:", err);
    res.status(500).json({ result: "Failed", message: err.message });
  }
};


//
// 2️⃣ GET ADVERTISEMENTS (with smart fallback like gallery)
//   Filters: category, page1id, page2id, page3id
//
exports.getAdvertisements = async (req, res) => {
  const { category } = req.params;
  const { page1id, page2id, page3id } = req.query;

  try {
    const process = (rows) =>
      rows.map((row) => ({
        id: row.id,
        category: row.category,
        page1id: row.page1id,
        page2id: row.page2id,
        page3id: row.page3id,
        imageUrl: parseJson(row.imageUrl),
        youtubeLinks: parseJson(row.youtubeLinks),
      }));

    // ---------- 1️⃣ Exact match ----------
    let query = `SELECT * FROM advertisements WHERE category = ?`;
    const params = [category];

    page1id ? (query += " AND page1id = ?") && params.push(page1id) : (query += " AND page1id IS NULL");
    page2id ? (query += " AND page2id = ?") && params.push(page2id) : (query += " AND page2id IS NULL");
    page3id ? (query += " AND page3id = ?") && params.push(page3id) : (query += " AND page3id IS NULL");

    let [rows] = await db.query(query, params);
    let resultData = process(rows);

    // ---------- 2️⃣ fallback: category + page1 ----------
    if (!resultData.length && page1id) {
      [rows] = await db.query(
        `SELECT * FROM advertisements
         WHERE category = ? AND page1id = ? 
         AND page2id IS NULL AND page3id IS NULL`,
        [category, page1id]
      );
      resultData = process(rows);
    }

    // ---------- 3️⃣ fallback: only category ----------
    if (!resultData.length) {
      [rows] = await db.query(
        `SELECT * FROM advertisements
         WHERE category = ? AND page1id IS NULL 
         AND page2id IS NULL AND page3id IS NULL`,
        [category]
      );
      resultData = process(rows);
    }

    // ---------- 4️⃣ fallback: default ----------
    if (!resultData.length && category !== "default") {
      [rows] = await db.query(
        `SELECT * FROM advertisements
         WHERE category = 'default'
         AND page1id IS NULL AND page2id IS NULL AND page3id IS NULL`
      );
      resultData = process(rows);
    }

    res.json({
      result: "Success",
      resultData,
      message: resultData.length
        ? "Advertisement found"
        : "No advertisement available",
    });
  } catch (err) {
    console.error("Error in getAdvertisements:", err);
    res.status(500).json({ result: "Failed", message: err.message });
  }
};


//
// 3️⃣ UPDATE
//
exports.updateAdvertisement = async (req, res) => {
  const { id } = req.params;
  const { category, page1id, page2id, page3id, imageUrl, youtubeLinks } =
    req.body;

  try {
    const finalImage = formatArrayToJson(imageUrl);
    const finalLinks = formatArrayToJson(youtubeLinks);

    await db.query(
      `UPDATE advertisements 
       SET category=?, page1id=?, page2id=?, page3id=?, imageUrl=?, youtubeLinks=?
       WHERE id=?`,
      [category, page1id, page2id, page3id, finalImage, finalLinks, id]
    );

    res.json({ result: "Success", message: "Advertisement updated" });
  } catch (err) {
    console.error("Error in updateAdvertisement:", err);
    res.status(500).json({ result: "Failed", message: err.message });
  }
};


//
// 4️⃣ DELETE
//
exports.deleteAdvertisement = async (req, res) => {
  try {
    await db.query(`DELETE FROM advertisements WHERE id=?`, [req.params.id]);
    res.json({ result: "Success", message: "Advertisement deleted" });
  } catch (err) {
    res.status(500).json({ result: "Failed", message: err.message });
  }
};


//
// 5️⃣ GET DISTINCT CATEGORIES
//
exports.getAdvertisementCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT category FROM advertisements WHERE category IS NOT NULL`
    );

    res.json({
      result: "Success",
      resultData: rows.map((r) => r.category),
    });
  } catch (err) {
    console.error("Error in getAdvertisementCategories:", err);
    res.status(500).json({ result: "Failed", message: err.message });
  }
};
 //
// 6️⃣ GET ALL ADVERTISEMENTS (NO FILTERS)
//
exports.getAllAdvertisements = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM advertisements`);

    const resultData = rows.map(row => ({
      id: row.id,
      category: row.category,
      page1id: row.page1id,
      page2id: row.page2id,
      page3id: row.page3id,
      imageUrl: parseJson(row.imageUrl),
      youtubeLinks: parseJson(row.youtubeLinks),
    }));

    res.json({
      result: "Success",
      resultData,
      message: "All advertisements fetched",
    });

  } catch (err) {
    console.error("Error in getAllAdvertisements:", err);
    res.status(500).json({ result: "Failed", message: err.message });
  }
};
