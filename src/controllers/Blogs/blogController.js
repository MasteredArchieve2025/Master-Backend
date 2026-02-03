/* =========================
   BLOG & NEWS CONTROLLER
   ========================= */

// 🌍 GET ALL BLOGS (PUBLIC)
exports.getAllBlogs = async (req, res) => {
  try {
    const { type } = req.query;

    let query = `
      SELECT *
      FROM blogs
      WHERE publishStatus = 'PUBLISHED'
    `;
    const params = [];

    if (type && ["BLOG", "NEWS"].includes(type)) {
      query += " AND type = ?";
      params.push(type);
    }

    query += " ORDER BY publishedAt DESC";

    const [rows] = await global.db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🌍 GET SINGLE BLOG (PUBLIC)
exports.getBlogById = async (req, res) => {
  try {
    const [[blog]] = await global.db.query(
      `SELECT * FROM blogs
       WHERE id = ? AND publishStatus = 'PUBLISHED'`,
      [req.params.id]
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➕ CREATE BLOG (NO AUTH)
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      type,
      category,
      image,
      mainImage,
      readTime,
      author,
      authorRole,
      authorBio,
      authorImage,
      publishStatus
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "Title and type required" });
    }

    await global.db.query(
      `INSERT INTO blogs
       (title, description, content, type, category,
        image, mainImage, readTime,
        author, authorRole, authorBio, authorImage,
        publishStatus, publishedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
               IF(?='PUBLISHED', NOW(), NULL))`,
      [
        title,
        description,
        content,
        type,
        category,
        image,
        mainImage,
        readTime,
        author,
        authorRole,
        authorBio,
        authorImage,
        publishStatus,
        publishStatus
      ]
    );

    res.json({ message: "Blog created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ UPDATE BLOG
exports.updateBlog = async (req, res) => {
  try {
    await global.db.query(
      `UPDATE blogs SET
        title = ?,
        description = ?,
        content = ?,
        type = ?,
        category = ?,
        image = ?,
        mainImage = ?,
        readTime = ?,
        author = ?,
        authorRole = ?,
        authorBio = ?,
        authorImage = ?,
        publishStatus = ?,
        publishedAt = IF(?='PUBLISHED', NOW(), publishedAt)
       WHERE id = ?`,
      [
        req.body.title,
        req.body.description,
        req.body.content,
        req.body.type,
        req.body.category,
        req.body.image,
        req.body.mainImage,
        req.body.readTime,
        req.body.author,
        req.body.authorRole,
        req.body.authorBio,
        req.body.authorImage,
        req.body.publishStatus,
        req.body.publishStatus,
        req.params.id
      ]
    );

    res.json({ message: "Blog updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ DELETE BLOG
exports.deleteBlog = async (req, res) => {
  try {
    await global.db.query(
      "DELETE FROM blogs WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
