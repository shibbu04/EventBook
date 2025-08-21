const bcrypt = require('bcryptjs');
const { initDatabase, getPool } = require('../config/database');

async function createDefaultAdmin() {
  try {
    console.log('Starting admin creation process...');
    
    // Initialize database connection
    await initDatabase();
    console.log('Database initialized');
    
    const pool = getPool();
    console.log('Got database pool');

    // Check if admin user already exists
    const [existingAdmin] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['demo@admin.com']
    );

    if (existingAdmin.length > 0) {
      console.log('Default admin user already exists');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('Demo@admin', 12);

      // Create default admin user
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, mobile, role) VALUES (?, ?, ?, ?, ?)',
        ['Demo Admin', 'demo@admin.com', hashedPassword, '+91-9999999999', 'admin']
      );

      console.log('✅ Default admin user created successfully');
      console.log('Email: demo@admin.com');
      console.log('Password: Demo@admin');
      console.log('User ID:', result.insertId);
    }

    // Check if test user already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['test@example.com']
    );

    if (existingUser.length > 0) {
      console.log('Default test user already exists');
    } else {
      // Hash password
      const hashedUserPassword = await bcrypt.hash('testuser123', 12);

      // Create default test user
      const [resultUser] = await pool.execute(
        'INSERT INTO users (name, email, password, mobile, role) VALUES (?, ?, ?, ?, ?)',
        ['Test User', 'test@example.com', hashedUserPassword, '+91-8888888888', 'user']
      );

      console.log('✅ Default test user created successfully');
      console.log('Email: test@example.com');
      console.log('Password: testuser123');
      console.log('User ID:', resultUser.insertId);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createDefaultAdmin();
}

module.exports = { createDefaultAdmin };
