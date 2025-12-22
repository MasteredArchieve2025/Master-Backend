const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { username, phone, email, password } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const [exists] = await global.db.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );

    if (exists.length) {
      return res.status(409).json({ message: "Mobile number already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await global.db.query(
      "INSERT INTO users (username, phone, email, password) VALUES (?, ?, ?, ?)",
      [username, phone, email || null, hashed]
    );

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const [users] = await global.db.query(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );

    if (!users.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { phone, newPassword, confirmPassword } = req.body;

    if (!phone || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const [users] = await global.db.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await global.db.query(
      "UPDATE users SET password = ? WHERE phone = ?",
      [hashed, phone]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
