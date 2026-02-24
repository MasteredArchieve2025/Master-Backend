// ➕ CREATE JOB
exports.createJob = async (req, res) => {
  try {
    const {
      jobCategoryId,
      companyName,
      jobName,
      area,
      district,
      state,
      tags,
      salaryRange,
      jobDescription,
      requirements,
      experience,
      applicationDeadline,
      mapLink,
      applyLink
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO job_details
       (jobCategoryId, companyName, jobName, area, district, state,
        tags, salaryRange, jobDescription, requirements, experience,
        applicationDeadline, mapLink, applyLink)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobCategoryId,
        companyName,
        jobName,
        area,
        district,
        state,
        JSON.stringify(tags || []),
        salaryRange,
        jobDescription,
        requirements,
        experience,
        applicationDeadline,
        mapLink,
        applyLink
      ]
    );

    res.status(201).json({
      success: true,
      message: "Job created",
      id: result.insertId
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// 📄 GET ALL JOBS
exports.getAllJobs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT j.*, c.name AS categoryName
      FROM job_details j
      JOIN job_categories c ON c.id = j.jobCategoryId
      ORDER BY j.createdAt DESC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// 📄 GET JOBS BY CATEGORY
exports.getJobsByCategory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM job_details
       WHERE jobCategoryId = ?
       ORDER BY createdAt DESC`,
      [req.params.jobCategoryId]
    );

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// 📄 GET SINGLE JOB
exports.getJobById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM job_details WHERE id=?`,
      [req.params.id]
    );

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// ✏️ UPDATE JOB
exports.updateJob = async (req, res) => {
  try {
    const {
      jobCategoryId,
      companyName,
      jobName,
      area,
      district,
      state,
      tags,
      salaryRange,
      jobDescription,
      requirements,
      experience,
      applicationDeadline,
      mapLink,
      applyLink
    } = req.body;

    await db.query(
      `UPDATE job_details SET
        jobCategoryId=?,
        companyName=?,
        jobName=?,
        area=?,
        district=?,
        state=?,
        tags=?,
        salaryRange=?,
        jobDescription=?,
        requirements=?,
        experience=?,
        applicationDeadline=?,
        mapLink=?,
        applyLink=?
       WHERE id=?`,
      [
        jobCategoryId,
        companyName,
        jobName,
        area,
        district,
        state,
        JSON.stringify(tags || []),
        salaryRange,
        jobDescription,
        requirements,
        experience,
        applicationDeadline,
        mapLink,
        applyLink,
        req.params.id
      ]
    );

    res.json({ success: true, message: "Job updated" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// ❌ DELETE JOB
exports.deleteJob = async (req, res) => {
  try {
    await db.query(`DELETE FROM job_details WHERE id=?`, [req.params.id]);

    res.json({ success: true, message: "Job deleted" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};