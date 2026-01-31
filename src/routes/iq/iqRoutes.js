// routes/iqRoutes.js
const express = require("express");
const {
  // Main functions
  getAllTests,
  getTestById,
  startTestSession,
  getSessionQuestions,
  saveAnswer,
  submitTest,
  getTestResult,
  getUserTestHistory,
  
  // Admin functions
  createTest,
  addQuestionsToTest,
  updateTest,
  deleteTest,
  getAllResults,
  getAllTestsSimple,
  
  // New admin management functions
  getAllTestsAdmin,
  getTestDetailsAdmin,
  updateTestStatus,
  getTestQuestions,
  updateQuestion,
  deleteQuestion,
  getTestStatistics,
  
  // Debug functions
  debugIQ
} = require("../../controllers/iq/iqController");

const router = express.Router();

// ================== PUBLIC ROUTES ==================

// Get all available IQ tests
router.get("/tests", getAllTests);

// Get simple tests list (for dropdowns)
router.get("/tests/simple", getAllTestsSimple);

// Get specific test details
router.get("/tests/:id", getTestById);

// Start a test session
router.post("/sessions/start", startTestSession);

// Get questions for a session
router.get("/sessions/:sessionToken/questions", getSessionQuestions);

// Save an answer
router.post("/sessions/:sessionToken/answer", saveAnswer);

// Submit test
router.post("/sessions/:sessionToken/submit", submitTest);

// Get test result
router.get("/results/:resultId", getTestResult);

// Get user's test history
router.get("/users/:userId/history", getUserTestHistory);

// ================== ADMIN ROUTES ==================

// Test Management
router.get("/admin/tests", getAllTestsAdmin); // Get all tests with pagination
router.post("/admin/tests", createTest); // Create new test
router.get("/admin/tests/:testId", getTestDetailsAdmin); // Get test details with questions
router.put("/admin/tests/:id", updateTest); // Update test
router.put("/admin/tests/:testId/status", updateTestStatus); // Activate/deactivate test
router.delete("/admin/tests/:id", deleteTest); // Delete test

// Question Management
router.post("/admin/tests/:testId/questions", addQuestionsToTest); // Add questions
router.get("/admin/tests/:testId/questions", getTestQuestions); // Get all questions for a test
router.put("/admin/questions/:questionId", updateQuestion); // Update specific question
router.delete("/admin/questions/:questionId", deleteQuestion); // Delete specific question

// Results & Analytics
router.get("/admin/results", getAllResults); // Get all results
router.get("/admin/tests/:testId/stats", getTestStatistics); // Get test statistics

// ================== DEBUG ROUTES ==================

// Debug endpoint
router.get("/debug", debugIQ);

module.exports = router;