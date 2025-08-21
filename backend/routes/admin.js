const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getAllUsers, deleteUser } = require('../controllers/userController');

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, getAllUsers);

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

module.exports = router;
