const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { getPool } = require('../config/database');
const { formatIndianCurrency } = require('../utils/helpers');

// Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, mobile } = req.body;
    const pool = getPool();

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, mobile, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, mobile, 'user']
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email, role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        mobile,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const pool = getPool();

    // Find user
    const [users] = await pool.execute(
      'SELECT id, name, email, password, mobile, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT id, name, email, mobile, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, mobile } = req.body;
    const pool = getPool();

    await pool.execute(
      'UPDATE users SET name = ?, mobile = ? WHERE id = ?',
      [name, mobile, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const pool = getPool();
    const [bookings] = await pool.execute(`
      SELECT 
        b.*,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location,
        e.img as event_image
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `, [req.user.id]);

    // Format currency for Indian Rupees
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      total_amount_formatted: formatIndianCurrency(booking.total_amount)
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('User bookings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const pool = getPool();
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, mobile, role, created_at,
      (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as total_bookings
      FROM users
      WHERE 1=1
    `;
    
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Fix: Use string concatenation for LIMIT and OFFSET instead of parameters
    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const [users] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    console.log(`Found ${users.length} users, total: ${total}`);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check if user exists
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting admin users
    const [adminCheck] = await pool.execute('SELECT role FROM users WHERE id = ?', [id]);
    if (adminCheck[0].role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUserBookings,
  getAllUsers,
  deleteUser
};
