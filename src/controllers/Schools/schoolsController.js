// schoolsController.js - COMPLETE FIXED VERSION

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
      gallery,
    } = req.body;

    // Validate required fields
    if (!schoolName || !location || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "School name, location, and mobile number are required",
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
        JSON.stringify(gallery || []),
      ],
    );

    res.status(201).json({
      success: true,
      message: "School created successfully",
      data: { id: resultQuery.insertId },
    });
  } catch (error) {
    console.error("Error creating school:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Schools - FIXED VERSION
const getAllSchools = async (req, res) => {
  console.log("🟡 [GET ALL SCHOOLS] Function called");

  try {
    // 1. First check if we can query at all
    console.log("🟡 Trying to query database...");

    // Try a simple query first
    const [testResult] = await global.db.query("SELECT 1 as test");
    console.log("✅ Basic query test passed:", testResult[0].test);

    // 2. Get the data
    const [schools] = await global.db.query(`
      SELECT * FROM schools 
      ORDER BY createdAt DESC
    `);

    console.log(`✅ Query returned ${schools.length} schools`);

    if (schools.length === 0) {
      console.log("ℹ️ No schools found in database");
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No schools found",
      });
    }

    // 3. Parse JSON fields SAFELY
    const parsedSchools = schools.map((school, index) => {
      console.log(`🟡 Processing school ${index + 1}: ${school.schoolName}`);

      const parsedSchool = { ...school };

      // List of JSON fields
      const jsonFields = [
        "category",
        "classes",
        "classesOffered",
        "teachingMode",
        "gallery",
      ];

      jsonFields.forEach((field) => {
        try {
          if (school[field]) {
            if (typeof school[field] === "string") {
              parsedSchool[field] = JSON.parse(school[field]);
            } else if (typeof school[field] === "object") {
              // It might already be parsed by MySQL driver
              parsedSchool[field] = school[field];
            } else {
              parsedSchool[field] = [];
            }
          } else {
            parsedSchool[field] = [];
          }
        } catch (parseError) {
          console.error(
            `❌ Error parsing ${field} for school ${school.id}:`,
            parseError,
          );
          console.error(`❌ Problematic ${field} value:`, school[field]);
          parsedSchool[field] = [];
        }
      });

      return parsedSchool;
    });

    console.log("✅ Successfully parsed all schools");

    // 4. Send response
    res.status(200).json({
      success: true,
      count: parsedSchools.length,
      data: parsedSchools,
    });

    console.log("✅ Response sent successfully");
  } catch (error) {
    console.error("❌ ERROR in getAllSchools:", error.message);
    console.error("❌ Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      hint: "Check server logs for details",
    });
  }
};

// Get Single School
const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;

    const [schools] = await global.db.query(
      `SELECT * FROM schools WHERE id = ?`,
      [id],
    );

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const school = schools[0];
    // Parse JSON fields
    const parsedSchool = {
      ...school,
      category: JSON.parse(school.category || "[]"),
      classes: JSON.parse(school.classes || "[]"),
      classesOffered: JSON.parse(school.classesOffered || "[]"),
      teachingMode: JSON.parse(school.teachingMode || "[]"),
      gallery: JSON.parse(school.gallery || "[]"),
    };

    res.status(200).json({
      success: true,
      data: parsedSchool,
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
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Prepare update query dynamically
    const fields = [];
    const values = [];

    Object.keys(updateFields).forEach((key) => {
      if (
        key === "category" ||
        key === "classes" ||
        key === "classesOffered" ||
        key === "teachingMode" ||
        key === "gallery"
      ) {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(updateFields[key]));
      } else {
        fields.push(`${key} = ?`);
        values.push(updateFields[key]);
      }
    });

    values.push(id);

    const query = `UPDATE schools SET ${fields.join(", ")}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

    await global.db.query(query, values);

    res.status(200).json({
      success: true,
      message: "School updated successfully",
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

    const [result] = await global.db.query(`DELETE FROM schools WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "School deleted successfully",
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
    const parsedSchools = schools.map((school) => ({
      ...school,
      category: JSON.parse(school.category || "[]"),
      classes: JSON.parse(school.classes || "[]"),
      classesOffered: JSON.parse(school.classesOffered || "[]"),
      teachingMode: JSON.parse(school.teachingMode || "[]"),
      gallery: JSON.parse(school.gallery || "[]"),
    }));

    res.status(200).json({
      success: true,
      count: parsedSchools.length,
      data: parsedSchools,
    });
  } catch (error) {
    console.error("Error searching schools:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== DEBUG/HELPER FUNCTIONS ==================

// Get All Schools - SIMPLE VERSION (No JSON parsing issues)
const getAllSchoolsSimple = async (req, res) => {
  try {
    console.log("🟡 Getting schools (simple version)...");
    
    const [schools] = await global.db.query(`
      SELECT 
        id,
        schoolName,
        location,
        mobileNumber,
        whatsappNumber,
        rating,
        result,
        schoolLogo,
        about,
        mapLink,
        createdAt,
        updatedAt
      FROM schools 
      ORDER BY createdAt DESC
    `);
    
    // Don't parse JSON fields at all
    const schoolsWithStringFields = schools.map(school => ({
      ...school,
      category: school.category || '[]',
      classes: school.classes || '[]',
      classesOffered: school.classesOffered || '[]',
      teachingMode: school.teachingMode || '[]',
      gallery: school.gallery || '[]'
    }));
    
    res.status(200).json({
      success: true,
      count: schoolsWithStringFields.length,
      data: schoolsWithStringFields,
      note: "JSON fields returned as strings"
    });
    
  } catch (error) {
    console.error("Simple version error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Debug endpoint for testing
const debugSchools = async (req, res) => {
  try {
    console.log("🔍 Debug endpoint called");
    
    // 1. Test database connection
    const [dbTest] = await global.db.query("SELECT 1 as test, NOW() as time");
    console.log("✅ Database connection:", dbTest[0]);
    
    // 2. Check table exists
    const [tables] = await global.db.query("SHOW TABLES LIKE 'schools'");
    console.log("✅ Schools table exists:", tables.length > 0);
    
    if (tables.length === 0) {
      const [allTables] = await global.db.query("SHOW TABLES");
      return res.json({
        success: false,
        message: "Schools table does not exist",
        allTables: allTables
      });
    }
    
    // 3. Get table structure
    const [structure] = await global.db.query("DESCRIBE schools");
    console.log("✅ Table structure loaded");
    
    // 4. Count rows
    const [countResult] = await global.db.query("SELECT COUNT(*) as count FROM schools");
    const rowCount = countResult[0].count;
    console.log(`✅ Row count: ${rowCount}`);
    
    // 5. Get sample data
    const [sampleData] = await global.db.query("SELECT * FROM schools LIMIT 1");
    
    res.json({
      success: true,
      database: "connected",
      tableExists: true,
      rowCount: rowCount,
      tableStructure: structure,
      sampleData: sampleData.length > 0 ? sampleData[0] : null,
      note: sampleData.length > 0 ? "Check console for detailed logs" : "Table is empty"
    });
    
  } catch (error) {
    console.error("❌ Debug error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack
    });
  }
};

// Raw test endpoint
const testRaw = async (req, res) => {
  try {
    console.log("🔍 Testing raw SQL query...");
    
    // Test 1: Simple count
    const [count] = await global.db.query("SELECT COUNT(*) as count FROM schools");
    console.log("✅ Total schools:", count[0].count);
    
    // Test 2: Get raw data without JSON parsing
    const [schools] = await global.db.query(`
      SELECT 
        id,
        schoolName,
        location,
        mobileNumber,
        rating,
        category,  -- This is JSON
        createdAt
      FROM schools 
      ORDER BY createdAt DESC
      LIMIT 5
    `);
    
    console.log("✅ Raw schools data:", schools);
    
    // Show what's in the category field
    schools.forEach((school, index) => {
      console.log(`School ${index + 1}:`, {
        id: school.id,
        name: school.schoolName,
        category: school.category,
        categoryType: typeof school.category
      });
    });
    
    res.json({
      success: true,
      count: count[0].count,
      rawData: schools,
      note: "This is raw data from database"
    });
    
  } catch (error) {
    console.error("❌ Test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};

// Minimal endpoint (no JSON fields)
const minimalSchools = async (req, res) => {
  try {
    // Simple query without JSON fields
    const [schools] = await global.db.query(`
      SELECT 
        id,
        schoolName,
        location,
        mobileNumber,
        rating
      FROM schools 
      LIMIT 5
    `);
    
    res.json({
      success: true,
      data: schools,
      note: "Minimal data without JSON fields"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Export ALL functions
module.exports = {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  searchSchools,
  // Debug functions
  getAllSchoolsSimple,
  debugSchools,
  testRaw,
  minimalSchools
};