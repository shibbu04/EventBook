const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').optional().isLength({ min: 10, max: 10 }).withMessage('Please provide a valid 10-digit mobile number')
], register);

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Get user profile (protected)
router.get('/profile', authenticateToken, getProfile);

// Update user profile (protected)
router.put('/profile', [
  authenticateToken,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('mobile').optional().isMobilePhone('en-IN').withMessage('Please provide a valid Indian mobile number')
], updateProfile);

module.exports = router;
