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

      // ✅ Fix for AWS RDS self-signed cert
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
    schoolLogo VARCHAR(500) NULL,
    bannerImage VARCHAR(500) NULL,
    category VARCHAR(100),
    description TEXT,
    images JSON,
    ourVision TEXT,
    ourMission TEXT,
    address1 VARCHAR(255),
    address2 VARCHAR(255),
    mobileNumber VARCHAR(20),
    whatsappNumber VARCHAR(20),
    emailId VARCHAR(120),
    youtubeUrl VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);




// 5️⃣ ADVERTISEMENTS TABLE
await db.query(`
  CREATE TABLE IF NOT EXISTS advertisements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    page1id VARCHAR(255),
    page2id VARCHAR(255),
    page3id VARCHAR(255),
    imageUrl JSON,
    youtubeLinks JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);



// 6️⃣ COLLEGE CATEGORIES TABLE
await db.query(`
  CREATE TABLE IF NOT EXISTS college_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoryName VARCHAR(150) NOT NULL,
    categoryImage VARCHAR(500) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// 7️⃣ COLLEGE SUBCATEGORIES TABLE (Linked to college_categories)
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

console.log("✅ College Subcategories table created / verified");





    


// Debug: Log number of rows and columns in users table
    const [rows, fields] = await db.query("SELECT * FROM college_subcategories ");
  console.log("📋 Total number:", rows.length);
  console.log("📋 Columns:");
  fields.forEach((field) => {
    console.log("-", field.name);
  });

    console.log("✅ Users table created / verified");

    return db;
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
