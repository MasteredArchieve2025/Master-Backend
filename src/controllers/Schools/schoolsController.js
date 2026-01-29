// Create School
const createSchool = async (req, res) => {
  try {
    const {
      schoolName,
      category,
      schoolLogo,
      rating,
      result,
      classes,
      classesOffered,
      teachingMode,
      location,
      mapLink,
      about,
      mobileNumber,
      whatsappNumber,
      gallery
    } = req.body;

    // Validate required fields
    if (!schoolName || !location || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "School name, location, and mobile number are required"
      });
    }

    const [resultQuery] = await global.db.query(
      `INSERT INTO schools (
        schoolName, category, schoolLogo, rating, result,
        classes, classesOffered, teachingMode, location,
        mapLink, about, mobileNumber, whatsappNumber, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        schoolName,
        JSON.stringify(category || []),
        schoolLogo || null,
        rating || 0.0,
        result || null,
        JSON.stringify(classes || []),
        JSON.stringify(classesOffered || []),
        JSON.stringify(teachingMode || []),
        location,
        mapLink || null,
        about || null,
        mobileNumber,
        whatsappNumber || mobileNumber,
        JSON.stringify(gallery || [])
      ]
    );

    res.status(201).json({
      success: true,
      message: "School created successfully",
      data: { id: resultQuery.insertId }
    });
  } catch (error) {
    console.error("Error creating school:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Schools
const getAllSchools = async (req, res) => {
  try {
    const [schools] = await global.db.query(`
      SELECT * FROM schools 
      ORDER BY createdAt DESC
    `);

    // Parse JSON fields
    const parsedSchools = schools.map(school => ({
      ...school,
      category: JSON.parse(school.category || '[]'),
      classes: JSON.parse(school.classes || '[]'),
      classesOffered: JSON.parse(school.classesOffered || '[]'),
      teachingMode: JSON.parse(school.teachingMode || '[]'),
      gallery: JSON.parse(school.gallery || '[]')
    }));

    res.status(200).json({
      success: true,
      count: parsedSchools.length,
      data: parsedSchools
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single School
const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [schools] = await global.db.query(
      `SELECT * FROM schools WHERE id = ?`,
      [id]
    );

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    const school = schools[0];
    // Parse JSON fields
    const parsedSchool = {
      ...school,
      category: JSON.parse(school.category || '[]'),
      classes: JSON.parse(school.classes || '[]'),
      classesOffered: JSON.parse(school.classesOffered || '[]'),
      teachingMode: JSON.parse(school.teachingMode || '[]'),
      gallery: JSON.parse(school.gallery || '[]')
    };

    res.status(200).json({
      success: true,
      data: parsedSchool
    });
  } catch (error) {
    console.error("Error fetching school:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update School
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Check if school exists
    const [existing] = await global.db.query(
      `SELECT id FROM schools WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    // Prepare update query dynamically
    const fields = [];
    const values = [];

    Object.keys(updateFields).forEach(key => {
      if (key === 'category' || key === 'classes' || key === 'classesOffered' || 
          key === 'teachingMode' || key === 'gallery') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(updateFields[key]));
      } else {
        fields.push(`${key} = ?`);
        values.push(updateFields[key]);
      }
    });

    values.push(id);

    const query = `UPDATE schools SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await global.db.query(query, values);

    res.status(200).json({
      success: true,
      message: "School updated successfully"
    });
  } catch (error) {
    console.error("Error updating school:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete School
const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await global.db.query(
      `DELETE FROM schools WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "School deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting school:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search Schools
const searchSchools = async (req, res) => {
  try {
    const { location, category, minRating, name } = req.query;
    
    let query = `SELECT * FROM schools WHERE 1=1`;
    const params = [];

    if (name) {
      query += ` AND schoolName LIKE ?`;
      params.push(`%${name}%`);
    }

    if (location) {
      query += ` AND location LIKE ?`;
      params.push(`%${location}%`);
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

    const [schools] = await global.db.query(query, params);

    // Parse JSON fields
    const parsedSchools = schools.map(school => ({
      ...school,
      category: JSON.parse(school.category || '[]'),
      classes: JSON.parse(school.classes || '[]'),
      classesOffered: JSON.parse(school.classesOffered || '[]'),
      teachingMode: JSON.parse(school.teachingMode || '[]'),
      gallery: JSON.parse(school.gallery || '[]')
    }));

    res.status(200).json({
      success: true,
      count: parsedSchools.length,
      data: parsedSchools
    });
  } catch (error) {
    console.error("Error searching schools:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  searchSchools
};