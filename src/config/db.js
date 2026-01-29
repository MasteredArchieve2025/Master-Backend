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

    // 6️⃣ Advertisement TABLE
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
    const [rows, fields] = await db.query("SELECT * FROM Advertisement");
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