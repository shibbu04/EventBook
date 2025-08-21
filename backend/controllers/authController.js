const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Login validation rules
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
];

// Register validation rules
const validateRegister = [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('mobile').isLength({ min: 10, max: 15 })
];

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Login controller
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { email, password } = req.body;
    const pool = getPool();

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log(`Login attempt failed: User not found for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    console.log(`Login attempt for user: ${user.name} (${user.email})`);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match result for ${email}: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    console.log(`Login successful for: ${user.name} (${user.email}) - Role: ${user.role}`);
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Register controller
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { name, email, password, mobile } = req.body;
    const pool = getPool();

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, mobile, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, mobile, 'user']
    );

    // Get created user
    const [newUsers] = await pool.execute(
      'SELECT id, name, email, mobile, role FROM users WHERE id = ?',
      [result.insertId]
    );

    const newUser = newUsers[0];

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Logout (client-side token removal)
const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  login,
  register,
  getMe,
  logout,
  validateLogin,
  validateRegister
};
