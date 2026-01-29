// tuitionController.js - COMPLETE FIXED VERSION

// Create Tuition
const createTuition = async (req, res) => {
  console.log("🟡 [CREATE TUITION] Function called");
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

    console.log("🟡 Received data:", {
      tuitionName,
      location,
      mobileNumber,
      rating
    });

    // Validate required fields
    if (!tuitionName || !location || !mobileNumber) {
      console.log("❌ Missing required fields");
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
        parseFloat(rating) || 0.0,
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

    console.log("✅ Tuition created with ID:", resultQuery.insertId);

    res.status(201).json({
      success: true,
      message: "Tuition created successfully",
      data: { id: resultQuery.insertId }
    });
  } catch (error) {
    console.error("❌ Error creating tuition:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      hint: "Check database connection and table structure"
    });
  }
};

// Get All Tuitions - FIXED VERSION
const getAllTuitions = async (req, res) => {
  console.log("🟡 [GET ALL TUITIONS] Function called");

  try {
    // 1. First check if we can query at all
    console.log("🟡 Testing database connection...");
    const [testResult] = await global.db.query("SELECT 1 as test");
    console.log("✅ Basic query test passed:", testResult[0].test);

    // 2. Get the data
    console.log("🟡 Querying tuitions table...");
    const [tuitions] = await global.db.query(`
      SELECT * FROM tuitions 
      ORDER BY createdAt DESC
    `);

    console.log(`✅ Query returned ${tuitions.length} tuitions`);

    if (tuitions.length === 0) {
      console.log("ℹ️ No tuitions found in database");
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No tuitions found"
      });
    }

    // 3. Parse JSON fields SAFELY
    const parsedTuitions = tuitions.map((tuition, index) => {
      console.log(`🟡 Processing tuition ${index + 1}: ${tuition.tuitionName}`);

      const parsedTuition = { ...tuition };

      // List of JSON fields
      const jsonFields = [
        "category",
        "subjectsOffered",
        "teachingMode",
        "gallery"
      ];

      jsonFields.forEach((field) => {
        try {
          if (tuition[field]) {
            if (typeof tuition[field] === "string") {
              parsedTuition[field] = JSON.parse(tuition[field]);
            } else if (Array.isArray(tuition[field])) {
              // It might already be an array (MySQL driver sometimes converts)
              parsedTuition[field] = tuition[field];
            } else if (typeof tuition[field] === "object") {
              // Try to convert object to array if needed
              parsedTuition[field] = Object.values(tuition[field]);
            } else {
              parsedTuition[field] = [];
            }
          } else {
            parsedTuition[field] = [];
          }
        } catch (parseError) {
          console.error(
            `❌ Error parsing ${field} for tuition ${tuition.id}:`,
            parseError.message
          );
          console.error(`❌ Raw ${field} value:`, tuition[field]);
          parsedTuition[field] = [];
        }
      });

      // Ensure rating is a number
      parsedTuition.rating = parseFloat(tuition.rating) || 0.0;

      return parsedTuition;
    });

    console.log("✅ Successfully parsed all tuitions");

    // 4. Send response
    res.status(200).json({
      success: true,
      count: parsedTuitions.length,
      data: parsedTuitions
    });

    console.log("✅ Response sent successfully");
  } catch (error) {
    console.error("❌ ERROR in getAllTuitions:", error.message);
    console.error("❌ Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      hint: "Check if 'tuitions' table exists and has correct structure"
    });
  }
};

// Get Single Tuition
const getTuitionById = async (req, res) => {
  console.log("🟡 [GET TUITION BY ID] Function called for ID:", req.params.id);
  
  try {
    const { id } = req.params;
    
    const [tuitions] = await global.db.query(
      `SELECT * FROM tuitions WHERE id = ?`,
      [id]
    );

    if (tuitions.length === 0) {
      console.log(`❌ Tuition with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Tuition not found"
      });
    }

    const tuition = tuitions[0];
    console.log(`✅ Found tuition: ${tuition.tuitionName}`);
    
    // Parse JSON fields SAFELY
    const parsedTuition = { ...tuition };
    
    const jsonFields = ["category", "subjectsOffered", "teachingMode", "gallery"];
    jsonFields.forEach((field) => {
      try {
        if (tuition[field] && typeof tuition[field] === "string") {
          parsedTuition[field] = JSON.parse(tuition[field]);
        } else {
          parsedTuition[field] = tuition[field] || [];
        }
      } catch (error) {
        console.error(`Error parsing ${field}:`, error);
        parsedTuition[field] = [];
      }
    });
    
    // Ensure rating is a number
    parsedTuition.rating = parseFloat(tuition.rating) || 0.0;

    res.status(200).json({
      success: true,
      data: parsedTuition
    });
  } catch (error) {
    console.error("❌ Error fetching tuition:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update Tuition
const updateTuition = async (req, res) => {
  console.log("🟡 [UPDATE TUITION] Function called for ID:", req.params.id);
  
  try {
    const { id } = req.params;
    const updateFields = req.body;

    console.log("🟡 Update data received:", updateFields);

    // Check if tuition exists
    const [existing] = await global.db.query(
      `SELECT id FROM tuitions WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      console.log(`❌ Tuition with ID ${id} not found`);
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
        values.push(JSON.stringify(updateFields[key] || []));
      } else if (key === 'rating') {
        fields.push(`${key} = ?`);
        values.push(parseFloat(updateFields[key]) || 0.0);
      } else {
        fields.push(`${key} = ?`);
        values.push(updateFields[key] || null);
      }
    });

    values.push(id);

    const query = `UPDATE tuitions SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    console.log("🟡 Update query:", query);
    console.log("🟡 Update values:", values);
    
    await global.db.query(query, values);

    console.log(`✅ Tuition ${id} updated successfully`);

    res.status(200).json({
      success: true,
      message: "Tuition updated successfully"
    });
  } catch (error) {
    console.error("❌ Error updating tuition:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete Tuition
const deleteTuition = async (req, res) => {
  console.log("🟡 [DELETE TUITION] Function called for ID:", req.params.id);
  
  try {
    const { id } = req.params;
    
    const [result] = await global.db.query(
      `DELETE FROM tuitions WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      console.log(`❌ Tuition with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Tuition not found"
      });
    }

    console.log(`✅ Tuition ${id} deleted successfully`);

    res.status(200).json({
      success: true,
      message: "Tuition deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting tuition:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Search Tuitions
const searchTuitions = async (req, res) => {
  console.log("🟡 [SEARCH TUITIONS] Function called");
  console.log("🟡 Query parameters:", req.query);
  
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

    console.log("🟡 Search query:", query);
    console.log("🟡 Search params:", params);

    const [tuitions] = await global.db.query(query, params);

    // Parse JSON fields safely
    const parsedTuitions = tuitions.map(tuition => {
      const parsedTuition = { ...tuition };
      
      const jsonFields = ["category", "subjectsOffered", "teachingMode", "gallery"];
      jsonFields.forEach((field) => {
        try {
          if (tuition[field] && typeof tuition[field] === "string") {
            parsedTuition[field] = JSON.parse(tuition[field]);
          } else {
            parsedTuition[field] = tuition[field] || [];
          }
        } catch (error) {
          parsedTuition[field] = [];
        }
      });
      
      // Ensure rating is a number
      parsedTuition.rating = parseFloat(tuition.rating) || 0.0;
      
      return parsedTuition;
    });

    console.log(`✅ Found ${parsedTuitions.length} tuitions`);

    res.status(200).json({
      success: true,
      count: parsedTuitions.length,
      data: parsedTuitions
    });
  } catch (error) {
    console.error("❌ Error searching tuitions:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ================== DEBUG/HELPER FUNCTIONS ==================

// Get All Tuitions - SIMPLE VERSION (No JSON parsing issues)
const getAllTuitionsSimple = async (req, res) => {
  console.log("🟡 [GET ALL TUITIONS SIMPLE] Function called");
  
  try {
    const [tuitions] = await global.db.query(`
      SELECT 
        id,
        tuitionName,
        tuitionImage,
        shortDescription,
        rating,
        result,
        location,
        about,
        mapLink,
        mobileNumber,
        whatsappNumber,
        createdAt,
        updatedAt
      FROM tuitions 
      ORDER BY createdAt DESC
    `);
    
    // Don't parse JSON fields at all
    const tuitionsWithStringFields = tuitions.map(tuition => ({
      ...tuition,
      category: tuition.category || '[]',
      subjectsOffered: tuition.subjectsOffered || '[]',
      teachingMode: tuition.teachingMode || '[]',
      gallery: tuition.gallery || '[]',
      rating: parseFloat(tuition.rating) || 0.0
    }));
    
    console.log(`✅ Simple version returned ${tuitionsWithStringFields.length} tuitions`);
    
    res.status(200).json({
      success: true,
      count: tuitionsWithStringFields.length,
      data: tuitionsWithStringFields,
      note: "JSON fields returned as strings"
    });
    
  } catch (error) {
    console.error("❌ Simple version error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Debug endpoint for testing
const debugTuitions = async (req, res) => {
  console.log("🔍 [DEBUG TUITIONS] Endpoint called");
  
  try {
    // 1. Test database connection
    const [dbTest] = await global.db.query("SELECT 1 as test, NOW() as time");
    console.log("✅ Database connection:", dbTest[0]);
    
    // 2. Check table exists
    const [tables] = await global.db.query("SHOW TABLES LIKE 'tuitions'");
    console.log("✅ Tuitions table exists:", tables.length > 0);
    
    if (tables.length === 0) {
      const [allTables] = await global.db.query("SHOW TABLES");
      console.log("❌ Tuitions table does not exist");
      return res.json({
        success: false,
        message: "Tuitions table does not exist",
        allTables: allTables.map(t => t[Object.keys(t)[0]])
      });
    }
    
    // 3. Get table structure
    const [structure] = await global.db.query("DESCRIBE tuitions");
    console.log("✅ Table structure loaded");
    
    // 4. Count rows
    const [countResult] = await global.db.query("SELECT COUNT(*) as count FROM tuitions");
    const rowCount = countResult[0].count;
    console.log(`✅ Row count: ${rowCount}`);
    
    // 5. Get sample data
    const [sampleData] = await global.db.query("SELECT * FROM tuitions LIMIT 1");
    
    const debugInfo = {
      success: true,
      database: "connected",
      tableExists: true,
      rowCount: rowCount,
      tableStructure: structure,
      sampleData: sampleData.length > 0 ? {
        id: sampleData[0].id,
        tuitionName: sampleData[0].tuitionName,
        location: sampleData[0].location,
        rating: sampleData[0].rating,
        mobileNumber: sampleData[0].mobileNumber,
        category: sampleData[0].category,
        categoryType: typeof sampleData[0].category,
        subjectsOffered: sampleData[0].subjectsOffered,
        subjectsOfferedType: typeof sampleData[0].subjectsOffered
      } : null,
      note: sampleData.length > 0 ? "Check console for detailed logs" : "Table is empty"
    };
    
    console.log("✅ Debug info:", JSON.stringify(debugInfo, null, 2));
    
    res.json(debugInfo);
    
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
  console.log("🔍 [TEST RAW TUITIONS] Endpoint called");
  
  try {
    // Test 1: Simple count
    const [count] = await global.db.query("SELECT COUNT(*) as count FROM tuitions");
    console.log("✅ Total tuitions:", count[0].count);
    
    // Test 2: Get raw data without JSON parsing
    const [tuitions] = await global.db.query(`
      SELECT 
        id,
        tuitionName,
        location,
        mobileNumber,
        rating,
        category,
        subjectsOffered,
        createdAt
      FROM tuitions 
      ORDER BY createdAt DESC
      LIMIT 5
    `);
    
    console.log(`✅ Raw tuitions data (${tuitions.length} records):`);
    
    // Show what's in the JSON fields
    tuitions.forEach((tuition, index) => {
      console.log(`Tuition ${index + 1}:`, {
        id: tuition.id,
        name: tuition.tuitionName,
        rating: tuition.rating,
        category: tuition.category,
        categoryType: typeof tuition.category,
        subjectsOffered: tuition.subjectsOffered,
        subjectsOfferedType: typeof tuition.subjectsOffered
      });
    });
    
    res.json({
      success: true,
      count: count[0].count,
      rawData: tuitions,
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
const minimalTuitions = async (req, res) => {
  console.log("🟡 [MINIMAL TUITIONS] Endpoint called");
  
  try {
    // Simple query without JSON fields
    const [tuitions] = await global.db.query(`
      SELECT 
        id,
        tuitionName,
        location,
        mobileNumber,
        rating,
        shortDescription
      FROM tuitions 
      ORDER BY createdAt DESC
      LIMIT 10
    `);
    
    console.log(`✅ Minimal data returned: ${tuitions.length} records`);
    
    res.json({
      success: true,
      count: tuitions.length,
      data: tuitions.map(t => ({
        ...t,
        rating: parseFloat(t.rating) || 0.0
      })),
      note: "Minimal data without JSON fields"
    });
  } catch (error) {
    console.error("❌ Minimal endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create tuitions table if not exists (for testing)
const setupTuitionsTable = async (req, res) => {
  console.log("🟡 [SETUP TUITIONS TABLE] Function called");
  
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tuitions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tuitionName VARCHAR(255) NOT NULL,
        tuitionImage VARCHAR(500),
        category JSON,
        shortDescription TEXT,
        rating DECIMAL(3,2) DEFAULT 0.00,
        result VARCHAR(255),
        location TEXT NOT NULL,
        subjectsOffered JSON,
        teachingMode JSON,
        about TEXT,
        mapLink TEXT,
        mobileNumber VARCHAR(20) NOT NULL,
        whatsappNumber VARCHAR(20),
        gallery JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await global.db.query(createTableQuery);
    
    console.log("✅ Tuitions table setup/verified successfully");
    
    res.json({
      success: true,
      message: "Tuitions table setup/verified successfully"
    });
    
  } catch (error) {
    console.error("❌ Error setting up tuitions table:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Export ALL functions
module.exports = {
  // Main CRUD functions
  createTuition,
  getAllTuitions,
  getTuitionById,
  updateTuition,
  deleteTuition,
  searchTuitions,
  
  // Debug functions
  getAllTuitionsSimple,
  debugTuitions,
  testRaw,
  minimalTuitions,
  setupTuitionsTable
};