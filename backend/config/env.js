// Environment configuration validation
require('dotenv').config();

const requiredEnvVars = [
  'DB_HOST',
  'DB_USER', 
  'DB_PASSWORD',
  'DB_NAME',
  'DB_PORT'
];

const optionalEnvVars = [
  'JWT_SECRET',
  'FRONTEND_URL',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const validateEnvVars = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  // Check optional but recommended variables
  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\n💡 Create a .env file with these variables. Check .env.example for reference.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:');
    warnings.forEach(envVar => console.warn(`   - ${envVar}`));
    console.warn('💡 These are optional but recommended for full functionality.\n');
  }

  console.log('✅ Environment configuration validated successfully');
  return true;
};

const getConfig = () => ({
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  
  // Database
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
  },
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
  
  // External Services
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Email (optional)
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS
  }
});

module.exports = {
  validateEnvVars,
  getConfig
};
