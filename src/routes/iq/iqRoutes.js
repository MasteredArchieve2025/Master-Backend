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
  
  // Debug functions
  debugIQ,
  getAllTestsSimple
} = require("../../controllers/iq/iqController");

const router = express.Router();

// ================== PUBLIC ROUTES ==================

// Get all available IQ tests
router.get("/tests", getAllTests);

// Get simple tests list
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

// Create new IQ test
router.post("/admin/tests", createTest);

// Add questions to test
router.post("/admin/tests/:testId/questions", addQuestionsToTest);

// Update test
router.put("/admin/tests/:id", updateTest);

// Delete test
router.delete("/admin/tests/:id", deleteTest);

// Get all results (admin view)
router.get("/admin/results", getAllResults);

// ================== DEBUG ROUTES ==================

// Debug endpoint
router.get("/debug", debugIQ);

module.exports = router;