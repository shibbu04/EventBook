const { getPool } = require('../config/database');

class User {
  static async findByEmail(email) {
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  static async findById(id) {
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT id, name, email, mobile, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  static async create(userData) {
    const pool = getPool();
    const { name, email, password, mobile, role = 'user' } = userData;
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, mobile, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, mobile, role]
    );

    return this.findById(result.insertId);
  }

  static async update(id, userData) {
    const pool = getPool();
    const { name, mobile } = userData;
    
    await pool.execute(
      'UPDATE users SET name = ?, mobile = ? WHERE id = ?',
      [name, mobile, id]
    );

    return this.findById(id);
  }

  static async getAllUsers(page = 1, limit = 10) {
    const pool = getPool();
    const offset = (page - 1) * limit;
    
    const [users] = await pool.execute(
      'SELECT id, name, email, mobile, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = User;
