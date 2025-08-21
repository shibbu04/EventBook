const mysql = require('mysql2/promise');

// Load environment variables first
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_booking',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('🔧 Database Configuration:');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('Database:', dbConfig.database);
console.log('Port:', dbConfig.port);
console.log('Password set:', dbConfig.password ? 'YES' : 'NO');

let pool;

const initDatabase = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Config used:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      passwordProvided: !!dbConfig.password
    });
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return pool;
};

module.exports = {
  initDatabase,
  getPool
};
