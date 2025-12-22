require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("././routes/Auth/auth.routes");


const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🎓 Education Auth API running");
});

(async () => {
  try {
    // Initialize DB
    global.db = await connectDB();
    console.log("🌍 Global DB initialized");

    // Start server
    server.listen(port, () => {
      console.log(`🚀 Server running at port ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
