// Create Tuition
const createTuition = async (req, res) => {
  try {
    const {
      tuitionName,
      tuitionImage,
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

    // Validate required fields
    if (!tuitionName || !location || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Tuition name, location, and mobile number are required"
      });
    }

    const [resultQuery] = await global.db.query(
      `INSERT INTO tuitions (
        tuitionName, tuitionImage, category, shortDescription, rating,
        result, location, subjectsOffered, teachingMode, about,
        mapLink, mobileNumber, whatsappNumber, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tuitionName,
        tuitionImage || null,
        JSON.stringify(category || []),
        shortDescription || null,
        rating || 0.0,
        result || null,
        location,
        JSON.stringify(subjectsOffered || []),
        JSON.stringify(teachingMode || []),
        about || null,
        mapLink || null,
        mobileNumber,
        whatsappNumber || mobileNumber,
        JSON.stringify(gallery || [])
      ]
    );

    res.status(201).json({
      success: true,
      message: "Tuition created successfully",
      data: { id: resultQuery.insertId }
    });
  } catch (error) {
    console.error("Error creating tuition:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Tuitions
const getAllTuitions = async (req, res) => {
  try {
    const [tuitions] = await global.db.query(`
      SELECT * FROM tuitions 
      ORDER BY createdAt DESC
    `);

    // Parse JSON fields
    const parsedTuitions = tuitions.map(tuition => ({
      ...tuition,
      category: JSON.parse(tuition.category || '[]'),
      subjectsOffered: JSON.parse(tuition.subjectsOffered || '[]'),
      teachingMode: JSON.parse(tuition.teachingMode || '[]'),
      gallery: JSON.parse(tuition.gallery || '[]')
    }));

    res.status(200).json({
      success: true,
      count: parsedTuitions.length,
      data: parsedTuitions
    });
  } catch (error) {
    console.error("Error fetching tuitions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Tuition
const getTuitionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tuitions] = await global.db.query(
      `SELECT * FROM tuitions WHERE id = ?`,
      [id]
    );

    if (tuitions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found"
      });
    }

    const tuition = tuitions[0];
    // Parse JSON fields
    const parsedTuition = {
      ...tuition,
      category: JSON.parse(tuition.category || '[]'),
      subjectsOffered: JSON.parse(tuition.subjectsOffered || '[]'),
      teachingMode: JSON.parse(tuition.teachingMode || '[]'),
      gallery: JSON.parse(tuition.gallery || '[]')
    };

    res.status(200).json({
      success: true,
      data: parsedTuition
    });
  } catch (error) {
    console.error("Error fetching tuition:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Tuition
const updateTuition = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Check if tuition exists
    const [existing] = await global.db.query(
      `SELECT id FROM tuitions WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found"
      });
    }

    // Prepare update query dynamically
    const fields = [];
    const values = [];

    Object.keys(updateFields).forEach(key => {
      if (key === 'category' || key === 'subjectsOffered' || 
          key === 'teachingMode' || key === 'gallery') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(updateFields[key]));
      } else {
        fields.push(`${key} = ?`);
        values.push(updateFields[key]);
      }
    });

    values.push(id);

    const query = `UPDATE tuitions SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await global.db.query(query, values);

    res.status(200).json({
      success: true,
      message: "Tuition updated successfully"
    });
  } catch (error) {
    console.error("Error updating tuition:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Tuition
const deleteTuition = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await global.db.query(
      `DELETE FROM tuitions WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Tuition deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting tuition:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search Tuitions
const searchTuitions = async (req, res) => {
  try {
    const { location, subject, category, minRating, name } = req.query;
    
    let query = `SELECT * FROM tuitions WHERE 1=1`;
    const params = [];

    if (name) {
      query += ` AND tuitionName LIKE ?`;
      params.push(`%${name}%`);
    }

    if (location) {
      query += ` AND location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (subject) {
      query += ` AND JSON_SEARCH(subjectsOffered, 'one', ?) IS NOT NULL`;
      params.push(subject);
    }

    if (category) {
      query += ` AND JSON_SEARCH(category, 'one', ?) IS NOT NULL`;
      params.push(category);
    }

    if (minRating) {
      query += ` AND rating >= ?`;
      params.push(parseFloat(minRating));
    }

    query += ` ORDER BY rating DESC`;

    const [tuitions] = await global.db.query(query, params);

    // Parse JSON fields
    const parsedTuitions = tuitions.map(tuition => ({
      ...tuition,
      category: JSON.parse(tuition.category || '[]'),
      subjectsOffered: JSON.parse(tuition.subjectsOffered || '[]'),
      teachingMode: JSON.parse(tuition.teachingMode || '[]'),
      gallery: JSON.parse(tuition.gallery || '[]')
    }));

    res.status(200).json({
      success: true,
      count: parsedTuitions.length,
      data: parsedTuitions
    });
  } catch (error) {
    console.error("Error searching tuitions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTuition,
  getAllTuitions,
  getTuitionById,
  updateTuition,
  deleteTuition,
  searchTuitions
};