const prisma = require('../../lib/prisma');

export default async function handler(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'not set',
    }
  };

  try {
    // Test database connection
    const count = await prisma.physician.count();
    health.database = 'connected';
    health.physicianCount = count;
  } catch (error) {
    health.database = 'error';
    health.dbError = error.message;
  }

  const statusCode = health.database === 'connected' ? 200 : 500;
  return res.status(statusCode).json(health);
}

