// config/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

const connectDB = async () => {
  try {
    // 1️⃣ Connect to MySQL server
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log("✅ MySQL connected");

    // 2️⃣ Create database if not exists
    const DB_NAME = process.env.DB_NAME || "educationdb";
    await db.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    await db.query(`USE ${DB_NAME}`);

    console.log(`✅ Using database: ${DB_NAME}`);

    // 3️⃣ USERS TABLE (Auth only)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4️⃣ SCHOOLS TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        schoolName VARCHAR(255) NOT NULL,
        category JSON,
        schoolLogo VARCHAR(500),
        rating DECIMAL(3,2) DEFAULT 0.0,
        result TEXT,
        classes JSON,
        classesOffered JSON,
        teachingMode JSON,
        location VARCHAR(500),
        mapLink VARCHAR(1000),
        about TEXT,
        mobileNumber VARCHAR(15),
        whatsappNumber VARCHAR(15),
        gallery JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 5️⃣ TUITIONS TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS tuitions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tuitionName VARCHAR(255) NOT NULL,
        tuitionImage VARCHAR(500),
        category JSON,
        shortDescription TEXT,
        rating DECIMAL(3,2) DEFAULT 0.0,
        result TEXT,
        location VARCHAR(500),
        subjectsOffered JSON,
        teachingMode JSON,
        about TEXT,
        mapLink VARCHAR(1000),
        mobileNumber VARCHAR(15),
        whatsappNumber VARCHAR(15),
        gallery JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 6️⃣ REVIEWS TABLE (Schools & Tuitions – Public Reviews)
await db.query(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,

    userId INT NOT NULL,
    entityType ENUM('school', 'tuition') NOT NULL,
    entityId INT NOT NULL,

    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT NOT NULL,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_review (userId, entityType, entityId),

    FOREIGN KEY (userId) REFERENCES users(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  )
`);


    // 7  Advertisement TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS Advertisement (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(50) NOT NULL,
        images JSON,
        youtube_urls JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_page (page_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);




    

// 8️⃣ IQ_TESTS TABLE
await db.query(`
  CREATE TABLE IF NOT EXISTS iq_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    total_questions INT DEFAULT 30,
    time_limit INT DEFAULT 2700,
    points_per_question INT DEFAULT 2,
    negative_marking BOOLEAN DEFAULT FALSE,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  )
`);

// 9️⃣ IQ_QUESTIONS TABLE
await db.query(`
  CREATE TABLE IF NOT EXISTS iq_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('numerical', 'verbal', 'logical', 'spatial') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    options JSON NOT NULL,
    correct_answer INT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES iq_tests(id) ON DELETE CASCADE,
    UNIQUE KEY unique_test_question (test_id, question_number)
  )
`);

// 🔟 IQ_TEST_SESSIONS TABLE
await db.query(`
  CREATE TABLE IF NOT EXISTS iq_test_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    session_token VARCHAR(100) UNIQUE NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    time_spent INT DEFAULT 0,
    answers JSON,
    total_score INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    wrong_answers INT DEFAULT 0,
    unanswered INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES iq_tests(id) ON DELETE CASCADE,
    INDEX idx_user_test (user_id, test_id),
    INDEX idx_session_token (session_token)
  )
`);

// 1️⃣1️⃣ IQ_RESULTS TABLE
await db.query(`
  CREATE TABLE IF NOT EXISTS iq_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    total_score INT NOT NULL,
    max_score INT NOT NULL,
    iq_score INT NOT NULL,
    performance_level VARCHAR(50),
    percentage DECIMAL(5,2),
    category_scores JSON,
    time_taken INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES iq_test_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES iq_tests(id) ON DELETE CASCADE,
    INDEX idx_user_results (user_id, created_at)
  )
`);

    // 7️⃣ COLLEGE CATEGORIES TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS college_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        categoryName VARCHAR(150) NOT NULL,
        categoryImage VARCHAR(500) NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8️⃣ COLLEGE SUBCATEGORIES TABLE
    await db.query(`
      CREATE TABLE IF NOT EXISTS college_subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        categoryId INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        image VARCHAR(500) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES college_categories(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      )
    `);

    // Debug: Log number of rows and columns in Advertisement table
    const [rows, fields] = await db.query("SELECT * FROM reviews");
    console.log("📋 Advertisement table rows:", rows.length);
    console.log("📋 Advertisement columns:");
    fields.forEach((field) => {
      console.log("-", field.name);
    });

    console.log("✅ All tables created / verified");

    return db;
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;