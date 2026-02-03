// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const connectDB = require("./config/db");

// ================= ROUTES =================

// Auth
const authRoutes = require("./routes/Auth/auth.routes");

// Upload
const uploadRoutes = require("./routes/uploadRoutes/uploadRoutes");

// Colleges
const collegeCategoryRoutes = require("./routes/collegeCategory/collegeCategoryRoutes");
const collegeSubcategoryRoutes = require("./routes/collegeCategory/collegeSubcategoryRoutes");

// Schools
const schoolsRoutes = require("./routes/School/schoolsRoutes");
const tuitionsRoutes = require("./routes/School/tuitionsRoutes");
const reviewRoutes = require("./routes/School/reviewRoutes");

// Advertisements
const advertisementRoutes = require("./routes/Advertisement/advertisementRoutes");


//Blogs
const blogRoutes = require("./routes/Blogs/blogRoutes");

// IQ
const iqRoutes = require("./routes/iq/iqRoutes");

// ================= APP INIT =================
const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

// ================= MIDDLEWARE =================

// CORS
app.use(cors());

// ✅ FIXED JSON HANDLER
app.use((req, res, next) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    return next();
  }
  express.json({ limit: "20mb" })(req, res, next);
});

// URL encoded
app.use(express.urlencoded({ extended: true }));



// ================= ROUTES =================

// Auth
app.use("/api/auth", authRoutes);

// Upload
app.use("/api", uploadRoutes);

// Schools
app.use("/api/schools", schoolsRoutes);
app.use("/api/tuitions", tuitionsRoutes);
app.use("/api/reviews", reviewRoutes);

// Advertisements
app.use("/api/advertisements", advertisementRoutes);

// Blogs
app.use("/api/blogs", blogRoutes);

// IQ
app.use("/api/iq", iqRoutes);

// College Categories
app.use("/api/college-categories", collegeCategoryRoutes);
app.use("/api/college-subcategories", collegeSubcategoryRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("🎓 Education API running successfully");
});

// ================= JSON ERROR HANDLER =================
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }
  next(err);
});

// ================= START SERVER =================
(async () => {
  try {
    global.db = await connectDB();
    console.log("🌍 Global DB initialized");

    server.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`🧠 IQ API: http://localhost:${port}/api/iq`);
      console.log(`📢 Ads API: http://localhost:${port}/api/advertisements`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
