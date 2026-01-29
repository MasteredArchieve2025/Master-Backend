// server.js or app.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/Auth/auth.routes");
const uploadRoutes = require("./routes/uploadRoutes/uploadRoutes");

// colleges
const collegeCategoryRoutes = require("./routes/collegeCategory/collegeCategoryRoutes");
const collegeSubcategoryRoutes = require("./routes/collegeCategory/collegeSubcategoryRoutes");

// schools 
const schoolsRoutes = require("./routes/School/schoolsRoutes");
const tuitionsRoutes = require("./routes/School/tuitionsRoutes");

// advertisements
const advertisementRoutes = require("./routes/Advertisement/advertisementRoutes");

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================

// Auth
app.use("/api/auth", authRoutes);

// Upload
app.use("/api", uploadRoutes);

// Schools ✅
app.use("/api/schools", schoolsRoutes);
// Tuitions ✅
app.use("/api/tuitions", tuitionsRoutes);

// Advertisements ✅
app.use("/api/advertisements", advertisementRoutes);

// College Categories ✅
app.use("/api/college-categories", collegeCategoryRoutes);
app.use("/api/college-subcategories", collegeSubcategoryRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("🎓 Education Auth API running");
});

// Test Advertisement endpoint (add this for debugging)
app.get("/api/test-advertisement", async (req, res) => {
  try {
    if (!global.db) {
      return res.status(500).json({ 
        success: false, 
        message: "global.db is not defined" 
      });
    }
    
    const [result] = await global.db.query("SELECT COUNT(*) as count FROM Advertisement");
    
    res.json({
      success: true,
      message: "Advertisement system is working",
      table_count: result[0].count,
      global_db_defined: !!global.db
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ================= START SERVER =================
(async () => {
  try {
    global.db = await connectDB();
    console.log("🌍 Global DB initialized");

    server.listen(port, () => {
      console.log(`🚀 Server running at port ${port}`);
      console.log(`📢 Advertisement API: http://localhost:${port}/api/advertisements`);
      console.log(`🔗 Test endpoint: http://localhost:${port}/api/advertisements/test`);
      console.log(`🔗 Debug endpoint: http://localhost:${port}/api/test-advertisement`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();