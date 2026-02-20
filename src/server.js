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

// Schools
const schoolsRoutes = require("./routes/School/schoolsRoutes");
const tuitionsRoutes = require("./routes/School/tuitionsRoutes");
const reviewRoutes = require("./routes/School/reviewRoutes");

// Advertisements
const advertisementRoutes = require("./routes/Advertisement/advertisementRoutes");

//Blogs
const blogRoutes = require("./routes/Blogs/blogRoutes");

//feedback
const feedbackRoutes = require("./routes/Feedback/feedbackRoutes");

// IQ
const iqRoutes = require("./routes/iq/iqRoutes");


//exam
const examCategoryRoutes = require("./routes/Exam/examCategoryRoutes");
const examTypeRoutes = require("./routes/Exam/examTypeRoutes");
const examDetailsRoutes = require("./routes/Exam/examDetailsRoutes");
const institutionRoutes = require("./routes/Exam/institutionRoutes");

//course
const courseCategoryRoutes = require("./routes/Course/courseCategoryRoutes");
const courseItemRoutes = require("./routes/Course/courseItemRoutes");
const courseProviderRoutes = require("./routes/Course/courseProviderRoutes");
const courseProviderReviewRoutes = require("./routes/Course/courseProviderReview");


//Extra Skill
const extraSkillCategoryRoutes = require("./routes/ExtraSkill/extraSkillCategoryRoutes");
const extraSkillTypeRoutes = require("./routes/ExtraSkill/extraSkillTypeRoutes");
const extraSkillInstitutionRoutes = require("./routes/ExtraSkill/extraSkillInstitutionRoutes");
const extraSkillReviewRoutes = require("./routes/ExtraSkill/extraSkillReviewRoutes");

//Colleges
const collegeCategoryRoutes = require("./routes/College/collegeCategoryRoutes");
const degreeRoutes = require("./routes/College/degreeRoutes");
const collegeRoutes = require("./routes/College/collegeRoutes");
const collegeReviewRoutes = require("./routes/College/collegeReview.routes");

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

// Colleges
app.use("/api/college-categories", collegeCategoryRoutes);
app.use("/api/degrees", degreeRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/college-reviews", collegeReviewRoutes);

// Advertisements
app.use("/api/advertisements", advertisementRoutes);

// Blogs
app.use("/api/blogs", blogRoutes);

// Extra Skill
app.use("/api/extra-skill-categories", extraSkillCategoryRoutes);
app.use("/api/extra-skill-types", extraSkillTypeRoutes);
app.use("/api/extra-skill-institutions", extraSkillInstitutionRoutes);
app.use("/api/extra-skill-reviews", extraSkillReviewRoutes);

// Course
app.use("/api/course-categories", courseCategoryRoutes);
app.use("/api/course-items", courseItemRoutes);
app.use("/api/course-providers", courseProviderRoutes);
app.use("/api/course-provider-reviews", courseProviderReviewRoutes);



// Exam
app.use("/api/exam-categories", examCategoryRoutes);
app.use("/api/exam-types", examTypeRoutes);
app.use("/api/exam-details", examDetailsRoutes);
app.use("/api/institutions", institutionRoutes);


// Feedback
app.use("/api/feedback", feedbackRoutes);

// IQ
app.use("/api/iq", iqRoutes);

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
