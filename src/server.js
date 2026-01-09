require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/Auth/auth.routes");
const uploadRoutes = require("./routes/uploadRoutes/uploadRoutes");
const schoolRoutes = require("./routes/School/schoolRoutes");
const advertisementRoutes = require("./routes/Advertisements/advertisementsRoutes");
const collegeCategoryRoutes = require("./routes/collegeCategory/collegeCategoryroutes");
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

// Schools
app.use("/api/schools", schoolRoutes);

// Advertisements
app.use("/api/advertisements", advertisementRoutes);

// College Categories ✅
app.use("/api/college-categories", collegeCategoryRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("🎓 Education Auth API running");
});

// ================= START SERVER =================
(async () => {
  try {
    global.db = await connectDB();
    console.log("🌍 Global DB initialized");

    server.listen(port, () => {
      console.log(`🚀 Server running at port ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
