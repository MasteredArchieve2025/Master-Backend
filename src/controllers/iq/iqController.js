// controllers/iq/iqController.js

// ================== MAIN FUNCTIONS ==================

// Get All IQ Tests
const getAllTests = async (req, res) => {
  console.log("🟡 [GET ALL IQ TESTS] Function called");

  try {
    console.log("🟡 Querying database for IQ tests...");

    const [tests] = await global.db.query(`
      SELECT 
        id,
        title,
        description,
        instructions,
        total_questions,
        time_limit,
        points_per_question,
        negative_marking,
        difficulty_level,
        is_active,
        created_at,
        updated_at
      FROM iq_tests 
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);

    console.log(`✅ Query returned ${tests.length} tests`);

    if (tests.length === 0) {
      console.log("ℹ️ No IQ tests found");
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No IQ tests available",
      });
    }

    // Format time limit to minutes
    const formattedTests = tests.map((test) => ({
      ...test,
      time_limit_minutes: Math.floor(test.time_limit / 60),
      time_limit_seconds: test.time_limit % 60,
    }));

    res.status(200).json({
      success: true,
      count: formattedTests.length,
      data: formattedTests,
    });

    console.log("✅ Response sent successfully");
  } catch (error) {
    console.error("❌ ERROR in getAllTests:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Single IQ Test with Questions
const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🟡 Fetching IQ test ID: ${id}`);

    // Get test details
    const [tests] = await global.db.query(
      `SELECT * FROM iq_tests WHERE id = ? AND is_active = TRUE`,
      [id],
    );

    if (tests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "IQ test not found",
      });
    }

    const test = tests[0];

    // Get questions for this test
    const [questions] = await global.db.query(
      `SELECT 
        id,
        question_number,
        question_text,
        question_type,
        difficulty,
        options,
        explanation
      FROM iq_questions 
      WHERE test_id = ? 
      ORDER BY question_number`,
      [id],
    );

    // Parse JSON fields
    const parsedTest = {
      ...test,
      time_limit_minutes: Math.floor(test.time_limit / 60),
      questions: questions.map((q) => ({
        ...q,
        options:
          typeof q.options === "string"
            ? JSON.parse(q.options)
            : q.options ?? [],
      })),
    };

    res.status(200).json({
      success: true,
      data: parsedTest,
    });
  } catch (error) {
    console.error("Error fetching IQ test:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start Test Session
const startTestSession = async (req, res) => {
  try {
    const { userId, testId } = req.body;
    console.log(`🟡 Starting test session for user ${userId}, test ${testId}`);

    if (!userId || !testId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Test ID are required",
      });
    }

    // Validate user
    const [users] = await global.db.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate test
    const [tests] = await global.db.query(
      "SELECT id FROM iq_tests WHERE id = ? AND is_active = TRUE",
      [testId],
    );

    if (tests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "IQ test not found",
      });
    }

    // Generate session token
    const sessionToken = require("crypto").randomBytes(32).toString("hex");

    // Check for existing active session
    const [existingSession] = await global.db.query(
      `SELECT id, session_token 
       FROM iq_test_sessions 
       WHERE user_id = ? AND test_id = ? AND is_completed = FALSE`,
      [userId, testId],
    );

    let sessionId;
    if (existingSession.length > 0) {
      // Resume existing session
      sessionId = existingSession[0].id;
      const existingToken = existingSession[0].session_token;

      console.log(`✅ Resuming existing session: ${sessionId}`);

      res.status(200).json({
        success: true,
        message: "Resuming existing session",
        sessionToken: existingToken,
        sessionId: sessionId,
      });
    } else {
      // Create new session
      const [result] = await global.db.query(
        `INSERT INTO iq_test_sessions 
         (user_id, test_id, session_token) 
         VALUES (?, ?, ?)`,
        [userId, testId, sessionToken],
      );

      sessionId = result.insertId;

      console.log(`✅ New session created: ${sessionId}`);

      res.status(201).json({
        success: true,
        message: "Test session started",
        sessionToken: sessionToken,
        sessionId: sessionId,
      });
    }
  } catch (error) {
    console.error("Error starting test session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Session Questions
const getSessionQuestions = async (req, res) => {
  try {
    const { sessionToken } = req.params;
    console.log(`🟡 Getting questions for session: ${sessionToken}`);

    // Get session info
    const [sessions] = await global.db.query(
      `SELECT s.*, t.title, t.total_questions, t.time_limit 
       FROM iq_test_sessions s
       JOIN iq_tests t ON s.test_id = t.id
       WHERE s.session_token = ?`,
      [sessionToken],
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];
    const testId = session.test_id;

    // Get questions
    const [questions] = await global.db.query(
      `SELECT 
        id,
        question_number,
        question_text,
        question_type,
        difficulty,
        options
      FROM iq_questions 
      WHERE test_id = ? 
      ORDER BY question_number`,
      [testId],
    );

    // Parse JSON and format (SAFE)
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: (() => {
        if (!q.options) return [];
        if (typeof q.options === "string") {
          try {
            return JSON.parse(q.options);
          } catch (err) {
            console.error("Invalid options JSON for question:", q.id);
            return [];
          }
        }
        return q.options;
      })(),
    }));

    // Get existing answers
    const answers = session.answers
      ? typeof session.answers === "string"
        ? JSON.parse(session.answers)
        : session.answers
      : {};

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        testId: testId,
        testTitle: session.title,
        totalQuestions: session.total_questions,
        timeLimit: session.time_limit,
        timeSpent: session.time_spent || 0,
        questions: formattedQuestions,
        answers: answers,
      },
    });
  } catch (error) {
    console.error("Error getting session questions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save Answer
const saveAnswer = async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const { questionId, selectedOption, timeSpent } = req.body;

    console.log(
      `🟡 Saving answer for session: ${sessionToken}, question: ${questionId}`,
    );

    // Get current session
    const [sessions] = await global.db.query(
      `SELECT id, answers, time_spent 
       FROM iq_test_sessions 
       WHERE session_token = ?`,
      [sessionToken],
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const session = sessions[0];
    let answers = session.answers
      ? typeof session.answers === "string"
        ? JSON.parse(session.answers)
        : session.answers
      : {};

    // Update answer
    answers[questionId] = selectedOption;

    // Update database
    await global.db.query(
      `UPDATE iq_test_sessions 
       SET answers = ?, time_spent = ?
       WHERE session_token = ?`,
      [JSON.stringify(answers), timeSpent, sessionToken],
    );

    res.status(200).json({
      success: true,
      message: "Answer saved successfully",
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Test
const submitTest = async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const { timeSpent } = req.body;

    console.log(`🟡 Submitting test for session: ${sessionToken}`);

    // Get session with test details
    const [sessions] = await global.db.query(
      `SELECT s.*, t.points_per_question, t.total_questions 
       FROM iq_test_sessions s
       JOIN iq_tests t ON s.test_id = t.id
       WHERE s.session_token = ? AND s.is_completed = FALSE`,
      [sessionToken],
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active session not found",
      });
    }

    const session = sessions[0];
    const testId = session.test_id;
    const userId = session.user_id;

    // Get user's answers (SAFE PARSING)
    const answers = session.answers
      ? typeof session.answers === "string"
        ? JSON.parse(session.answers)
        : session.answers
      : {};

    // Get all questions for this test
    const [questions] = await global.db.query(
      `SELECT id, correct_answer, question_type 
       FROM iq_questions 
       WHERE test_id = ?`,
      [testId],
    );

    // Calculate results
    let totalScore = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = questions.length;

    // Category tracking
    const categoryScores = {
      numerical: { correct: 0, total: 0 },
      verbal: { correct: 0, total: 0 },
      logical: { correct: 0, total: 0 },
      spatial: { correct: 0, total: 0 },
    };

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const category = question.question_type;

      // Initialize category if not exists
      if (!categoryScores[category]) {
        categoryScores[category] = { correct: 0, total: 0 };
      }

      categoryScores[category].total++;

      if (userAnswer !== undefined && userAnswer !== null) {
        unanswered--;
        if (userAnswer === question.correct_answer) {
          correctAnswers++;
          totalScore += session.points_per_question;
          categoryScores[category].correct++;
        } else {
          wrongAnswers++;
        }
      }
    });

    const maxScore = questions.length * session.points_per_question;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Calculate IQ score
    const iqScore = Math.floor(85 + (percentage / 100) * 40);

    // Determine performance
    let performanceLevel;
    if (percentage >= 90) performanceLevel = "Exceptional";
    else if (percentage >= 75) performanceLevel = "Excellent";
    else if (percentage >= 60) performanceLevel = "Above Average";
    else if (percentage >= 40) performanceLevel = "Average";
    else performanceLevel = "Below Average";

    // Update session as completed
    await global.db.query(
      `UPDATE iq_test_sessions 
       SET end_time = NOW(),
           time_spent = ?,
           total_score = ?,
           correct_answers = ?,
           wrong_answers = ?,
           unanswered = ?,
           is_completed = TRUE
       WHERE session_token = ?`,
      [
        timeSpent,
        totalScore,
        correctAnswers,
        wrongAnswers,
        unanswered,
        sessionToken,
      ],
    );

    // Save to results table
    const [result] = await global.db.query(
      `INSERT INTO iq_results 
       (session_id, user_id, test_id, total_score, max_score, 
        iq_score, performance_level, percentage, category_scores, time_taken)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        userId,
        testId,
        totalScore,
        maxScore,
        iqScore,
        performanceLevel,
        percentage,
        JSON.stringify(categoryScores),
        timeSpent,
      ],
    );

    // Get the saved result
    const [savedResults] = await global.db.query(
      `SELECT * FROM iq_results WHERE id = ?`,
      [result.insertId],
    );

    const savedResult = savedResults[0];

    // Parse JSON fields
    const parsedResult = {
      ...savedResult,
      category_scores:
        typeof savedResult.category_scores === "string"
          ? JSON.parse(savedResult.category_scores)
          : savedResult.category_scores ?? {},
    };

    res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      data: parsedResult,
      summary: {
        score: totalScore,
        maxScore: maxScore,
        correctAnswers: correctAnswers,
        totalQuestions: questions.length,
        wrongAnswers: wrongAnswers,
        unanswered: unanswered,
        percentage: Math.round(percentage * 100) / 100,
        iqScore: iqScore,
        performanceLevel: performanceLevel,
        timeTaken: timeSpent,
      },
    });

    console.log(`✅ Test submitted successfully for session: ${sessionToken}`);
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Test Results
const getTestResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    console.log(`🟡 Getting result: ${resultId}`);

    const [results] = await global.db.query(
      `SELECT r.*, t.title as test_title
       FROM iq_results r
       JOIN iq_tests t ON r.test_id = t.id
       WHERE r.id = ?`,
      [resultId],
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const result = results[0];

    // Parse JSON fields
    const parsedResult = {
      ...result,
      category_scores:
        typeof result.category_scores === "string"
          ? JSON.parse(result.category_scores)
          : result.category_scores ?? {},
    };

    res.status(200).json({
      success: true,
      data: parsedResult,
    });
  } catch (error) {
    console.error("Error getting test result:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User's Test History
const getUserTestHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    console.log(`🟡 Getting test history for user: ${userId}`);

    // Get history
    const [history] = await global.db.query(
      `SELECT 
        r.id,
        r.total_score,
        r.max_score,
        r.iq_score,
        r.performance_level,
        r.percentage,
        r.time_taken,
        r.created_at,
        t.title as test_title
       FROM iq_results r
       JOIN iq_tests t ON r.test_id = t.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)],
    );

    // Get total count
    const [[{ total }]] = await global.db.query(
      "SELECT COUNT(*) as total FROM iq_results WHERE user_id = ?",
      [userId],
    );

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total: total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("Error getting user history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== ADMIN FUNCTIONS ==================

// Create IQ Test (Admin) - FIXED for frontend
const createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      total_questions = 10,
      time_limit, // In minutes from frontend
      points_per_question = 1,
      difficulty_level = "medium",
      created_by = 1, // Default admin user ID
    } = req.body;

    console.log(`🟡 [CREATE TEST] Creating: ${title}, Time: ${time_limit} mins`);

    if (!title || !time_limit) {
      return res.status(400).json({
        success: false,
        message: "Title and time limit are required",
      });
    }

    // Convert minutes to seconds for database
    const timeInSeconds = parseInt(time_limit) * 60;

    const [result] = await global.db.query(
      `INSERT INTO iq_tests 
       (title, description, instructions, total_questions, time_limit,
        points_per_question, difficulty_level, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        instructions || null,
        parseInt(total_questions),
        timeInSeconds,
        parseInt(points_per_question) || 1,
        difficulty_level,
        created_by,
      ],
    );

    console.log(`✅ Test created with ID: ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: "IQ test created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("❌ Error creating IQ test:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Questions to Test (Admin) - FIXED for frontend
const addQuestionsToTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { questions } = req.body;

    console.log(`🟡 [ADD QUESTIONS] To test: ${testId}, Count: ${questions.length}`);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required",
      });
    }

    // Validate test exists
    const [tests] = await global.db.query(
      "SELECT id FROM iq_tests WHERE id = ?",
      [testId],
    );

    if (tests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Get current question count
    const [currentCount] = await global.db.query(
      `SELECT COUNT(*) as count FROM iq_questions WHERE test_id = ?`,
      [testId],
    );

    let questionNumber = currentCount[0].count + 1;
    const insertedQuestions = [];

    // Insert each question individually for better error handling
    for (const q of questions) {
      const {
        question_text,
        question_type = "logical",
        difficulty = "medium",
        options = ["", "", "", ""],
        correct_answer = 0,
        explanation = null,
      } = q;

      // Validate question
      if (!question_text || !Array.isArray(options)) {
        return res.status(400).json({
          success: false,
          message: `Question ${questionNumber} is invalid`,
        });
      }

      // Ensure we have 4 options
      const optionsArray = options.length === 4 ? options : [...options, ...Array(4 - options.length).fill("")];

      const [result] = await global.db.query(
        `INSERT INTO iq_questions 
         (test_id, question_number, question_text, question_type, 
          difficulty, options, correct_answer, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testId,
          questionNumber,
          question_text,
          question_type,
          difficulty,
          JSON.stringify(optionsArray),
          parseInt(correct_answer),
          explanation,
        ],
      );

      insertedQuestions.push({
        id: result.insertId,
        question_number: questionNumber,
      });

      questionNumber++;
    }

    console.log(`✅ ${questions.length} questions added to test ${testId}`);

    res.status(201).json({
      success: true,
      message: `${questions.length} questions added successfully`,
      data: insertedQuestions,
    });
  } catch (error) {
    console.error("❌ Error adding questions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Test (Admin)
const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    console.log(`🟡 Updating IQ test ID: ${id}`);

    // Check if test exists
    const [existing] = await global.db.query(
      "SELECT id FROM iq_tests WHERE id = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "IQ test not found",
      });
    }

    // Prepare update
    const fields = [];
    const values = [];

    Object.keys(updateFields).forEach((key) => {
      if (key !== "id") {
        fields.push(`${key} = ?`);
        values.push(updateFields[key]);
      }
    });

    values.push(id);

    const query = `UPDATE iq_tests SET ${fields.join(", ")} WHERE id = ?`;

    await global.db.query(query, values);

    res.status(200).json({
      success: true,
      message: "IQ test updated successfully",
    });
  } catch (error) {
    console.error("Error updating IQ test:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Test (Admin)
const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🟡 Deleting IQ test ID: ${id}`);

    const [result] = await global.db.query(
      "DELETE FROM iq_tests WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "IQ test not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "IQ test deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting IQ test:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Results (Admin) - FIXED for dashboard
const getAllResults = async (req, res) => {
  try {
    console.log("🟡 [GET ALL RESULTS] For admin dashboard");

    const [results] = await global.db.query(`
      SELECT 
        r.id,
        r.total_score,
        r.max_score,
        r.iq_score,
        r.performance_level,
        r.time_taken,
        r.created_at,
        t.title as test_title,
        u.username as user_name,
        u.email as user_email
      FROM iq_results r
      JOIN iq_tests t ON r.test_id = t.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 1000
    `);

    console.log(`✅ Found ${results.length} results`);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("❌ Error getting all results:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== HELPER FUNCTIONS ==================

// Get simple tests list (for dropdowns) - FIXED
const getAllTestsSimple = async (req, res) => {
  try {
    console.log("🟡 [GET SIMPLE TESTS] For dropdown");
    
    const [tests] = await global.db.query(`
      SELECT 
        id,
        title,
        total_questions,
        time_limit
      FROM iq_tests 
      WHERE is_active = TRUE
      ORDER BY title ASC
    `);

    console.log(`✅ Found ${tests.length} tests for dropdown`);

    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error("❌ Error getting simple tests:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================== DEBUG/HELPER FUNCTIONS ==================

// Debug endpoint
const debugIQ = async (req, res) => {
  try {
    console.log("🔍 IQ Debug endpoint called");

    // Test database connection
    const [dbTest] = await global.db.query("SELECT 1 as test, NOW() as time");
    console.log("✅ Database connection:", dbTest[0]);

    // Check tables exist
    const tables = [
      "iq_tests",
      "iq_questions",
      "iq_test_sessions",
      "iq_results",
    ];
    const tableStatus = {};

    for (const table of tables) {
      const [tableCheck] = await global.db.query(`SHOW TABLES LIKE '${table}'`);
      tableStatus[table] = tableCheck.length > 0;
    }

    console.log("✅ Table status:", tableStatus);

    // Get counts
    const counts = {};
    for (const table of tables) {
      if (tableStatus[table]) {
        const [countResult] = await global.db.query(
          `SELECT COUNT(*) as count FROM ${table}`,
        );
        counts[table] = countResult[0].count;
      }
    }

    res.json({
      success: true,
      database: "connected",
      tables: tableStatus,
      counts: counts,
      note: "Check console for detailed logs",
    });
  } catch (error) {
    console.error("❌ Debug error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack,
    });
  }
};


// ================== NEW ADMIN MANAGEMENT FUNCTIONS ==================

// Get all tests with pagination for admin
const getAllTestsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "all" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id,
        title,
        description,
        total_questions,
        time_limit,
        points_per_question,
        difficulty_level,
        is_active,
        created_at,
        (SELECT COUNT(*) FROM iq_questions WHERE test_id = iq_tests.id) as question_count,
        (SELECT COUNT(*) FROM iq_results WHERE test_id = iq_tests.id) as attempt_count
      FROM iq_tests 
      WHERE 1=1
    `;
    
    const queryParams = [];

    if (search) {
      query += ` AND (title LIKE ? OR description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status === "active") {
      query += ` AND is_active = TRUE`;
    } else if (status === "inactive") {
      query += ` AND is_active = FALSE`;
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [tests] = await global.db.query(query, queryParams);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM iq_tests WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (title LIKE ? OR description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (status === "active") {
      countQuery += ` AND is_active = TRUE`;
    } else if (status === "inactive") {
      countQuery += ` AND is_active = FALSE`;
    }

    const [[{ total }]] = await global.db.query(countQuery, countParams);

    // Format time limit to minutes
    const formattedTests = tests.map(test => ({
      ...test,
      time_limit_minutes: Math.floor(test.time_limit / 60),
      time_limit_seconds: test.time_limit % 60
    }));

    res.json({
      success: true,
      data: formattedTests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error in getAllTestsAdmin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get test details with questions for admin
const getTestDetailsAdmin = async (req, res) => {
  try {
    const { testId } = req.params;

    console.log(`🟡 [GET TEST DETAILS ADMIN] Test ID: ${testId}`);

    // Get test info
    const [tests] = await global.db.query(
      `SELECT * FROM iq_tests WHERE id = ?`,
      [testId]
    );

    if (!tests.length) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    const test = tests[0];

    // Get questions
    const [questions] = await global.db.query(
      `SELECT 
        id,
        question_number,
        question_text,
        question_type,
        difficulty,
        options,
        correct_answer,
        explanation,
        created_at
      FROM iq_questions 
      WHERE test_id = ?
      ORDER BY question_number`,
      [testId]
    );

    // Get test statistics
    const [stats] = await global.db.query(
      `SELECT 
        COUNT(DISTINCT user_id) as total_attempts,
        AVG(total_score) as avg_score,
        MAX(total_score) as max_score,
        MIN(total_score) as min_score
      FROM iq_results 
      WHERE test_id = ?`,
      [testId]
    );

    // Parse JSON options
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    res.json({
      success: true,
      data: {
        ...test,
        time_limit_minutes: Math.floor(test.time_limit / 60),
        questions: parsedQuestions,
        question_count: questions.length,
        statistics: stats[0] || {
          total_attempts: 0,
          avg_score: 0,
          max_score: 0,
          min_score: 0
        }
      }
    });
  } catch (error) {
    console.error("Error in getTestDetailsAdmin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update test status (active/inactive)
const updateTestStatus = async (req, res) => {
  try {
    const { testId } = req.params;
    const { is_active } = req.body;

    console.log(`🟡 [UPDATE TEST STATUS] Test: ${testId}, Status: ${is_active}`);

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean"
      });
    }

    const [result] = await global.db.query(
      `UPDATE iq_tests SET is_active = ? WHERE id = ?`,
      [is_active, testId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    res.json({
      success: true,
      message: `Test ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("Error in updateTestStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get questions by test ID (for viewing/managing questions)
const getTestQuestions = async (req, res) => {
  try {
    const { testId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log(`🟡 [GET TEST QUESTIONS] Test ID: ${testId}`);

    // Verify test exists
    const [tests] = await global.db.query(
      "SELECT id, title FROM iq_tests WHERE id = ?",
      [testId]
    );

    if (!tests.length) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    const test = tests[0];

    // Get questions with pagination
    const [questions] = await global.db.query(
      `SELECT 
        id,
        question_number,
        question_text,
        question_type,
        difficulty,
        options,
        correct_answer,
        explanation,
        created_at
      FROM iq_questions 
      WHERE test_id = ?
      ORDER BY question_number
      LIMIT ? OFFSET ?`,
      [testId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [[{ total }]] = await global.db.query(
      "SELECT COUNT(*) as total FROM iq_questions WHERE test_id = ?",
      [testId]
    );

    // Parse JSON options
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    res.json({
      success: true,
      data: {
        test: {
          id: test.id,
          title: test.title
        },
        questions: parsedQuestions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Error in getTestQuestions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a specific question
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      question_text,
      question_type,
      difficulty,
      options,
      correct_answer,
      explanation
    } = req.body;

    console.log(`🟡 [UPDATE QUESTION] Question ID: ${questionId}`);

    // Verify question exists
    const [questions] = await global.db.query(
      "SELECT id, test_id FROM iq_questions WHERE id = ?",
      [questionId]
    );

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (question_text !== undefined) {
      updateFields.push("question_text = ?");
      values.push(question_text);
    }
    if (question_type !== undefined) {
      updateFields.push("question_type = ?");
      values.push(question_type);
    }
    if (difficulty !== undefined) {
      updateFields.push("difficulty = ?");
      values.push(difficulty);
    }
    if (options !== undefined) {
      updateFields.push("options = ?");
      values.push(JSON.stringify(options));
    }
    if (correct_answer !== undefined) {
      updateFields.push("correct_answer = ?");
      values.push(parseInt(correct_answer));
    }
    if (explanation !== undefined) {
      updateFields.push("explanation = ?");
      values.push(explanation);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    updateFields.push("updated_at = NOW()");
    values.push(questionId);

    const query = `UPDATE iq_questions SET ${updateFields.join(", ")} WHERE id = ?`;
    
    await global.db.query(query, values);

    // Get updated question
    const [updatedQuestion] = await global.db.query(
      "SELECT * FROM iq_questions WHERE id = ?",
      [questionId]
    );

    res.json({
      success: true,
      message: "Question updated successfully",
      data: {
        ...updatedQuestion[0],
        options: typeof updatedQuestion[0].options === 'string' 
          ? JSON.parse(updatedQuestion[0].options) 
          : updatedQuestion[0].options
      }
    });
  } catch (error) {
    console.error("Error in updateQuestion:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    console.log(`🟡 [DELETE QUESTION] Question ID: ${questionId}`);

    // Get question details for response
    const [questions] = await global.db.query(
      "SELECT id, test_id, question_number FROM iq_questions WHERE id = ?",
      [questionId]
    );

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    const question = questions[0];

    // Delete the question
    const [result] = await global.db.query(
      "DELETE FROM iq_questions WHERE id = ?",
      [questionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    // Renumber remaining questions
    await global.db.query(
      `UPDATE iq_questions 
       SET question_number = question_number - 1 
       WHERE test_id = ? AND question_number > ?`,
      [question.test_id, question.question_number]
    );

    res.json({
      success: true,
      message: "Question deleted successfully",
      data: {
        deleted_question_id: questionId,
        test_id: question.test_id
      }
    });
  } catch (error) {
    console.error("Error in deleteQuestion:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get test statistics
const getTestStatistics = async (req, res) => {
  try {
    const { testId } = req.params;

    console.log(`🟡 [GET TEST STATISTICS] Test ID: ${testId}`);

    // Verify test exists
    const [tests] = await global.db.query(
      "SELECT id, title FROM iq_tests WHERE id = ?",
      [testId]
    );

    if (!tests.length) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    // Basic test stats
    const [basicStats] = await global.db.query(
      `SELECT 
        COUNT(DISTINCT r.user_id) as total_users,
        COUNT(r.id) as total_attempts,
        AVG(r.total_score) as avg_score,
        AVG(r.iq_score) as avg_iq_score,
        MAX(r.total_score) as highest_score,
        MIN(r.total_score) as lowest_score,
        AVG(r.time_taken) as avg_time_taken
      FROM iq_results r
      WHERE r.test_id = ?`,
      [testId]
    );

    // Performance level distribution
    const [performanceStats] = await global.db.query(
      `SELECT 
        performance_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM iq_results WHERE test_id = ?), 2) as percentage
      FROM iq_results 
      WHERE test_id = ?
      GROUP BY performance_level
      ORDER BY FIELD(performance_level, 'Exceptional', 'Excellent', 'Above Average', 'Average', 'Below Average')`,
      [testId, testId]
    );

    // Category-wise performance
    const [categoryStats] = await global.db.query(
      `SELECT 
        q.question_type,
        COUNT(*) as total_questions,
        AVG(CASE WHEN r.answers->>'$.\"' || q.id || '\"' IS NOT NULL THEN 1 ELSE 0 END) as attempted_rate,
        AVG(CASE 
          WHEN r.answers->>'$.\"' || q.id || '\"' = q.correct_answer THEN 1 
          ELSE 0 
        END) as accuracy_rate
      FROM iq_questions q
      LEFT JOIN iq_test_sessions s ON q.test_id = s.test_id
      LEFT JOIN iq_results r ON s.id = r.session_id
      WHERE q.test_id = ?
      GROUP BY q.question_type`,
      [testId]
    );

    // Recent attempts (last 10)
    const [recentAttempts] = await global.db.query(
      `SELECT 
        r.id,
        u.username as user_name,
        r.total_score,
        r.max_score,
        r.iq_score,
        r.performance_level,
        r.time_taken,
        r.created_at
      FROM iq_results r
      JOIN users u ON r.user_id = u.id
      WHERE r.test_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10`,
      [testId]
    );

    res.json({
      success: true,
      data: {
        test: tests[0],
        basic_statistics: basicStats[0] || {
          total_users: 0,
          total_attempts: 0,
          avg_score: 0,
          avg_iq_score: 0,
          highest_score: 0,
          lowest_score: 0,
          avg_time_taken: 0
        },
        performance_distribution: performanceStats,
        category_performance: categoryStats,
        recent_attempts: recentAttempts,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getTestStatistics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== EXPORT ALL FUNCTIONS ==================

module.exports = {
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
  debugIQ,
};