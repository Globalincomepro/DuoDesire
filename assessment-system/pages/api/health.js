const prisma = require('../../lib/prisma');

export default async function handler(req, res) {
  // Parse DATABASE_URL to show details (with password masked)
  let dbHost = 'unknown';
  let dbPort = 'unknown';
  let maskedUrl = 'not set';
  const dbUrl = process.env.DATABASE_URL || '';
  
  if (dbUrl) {
    // Mask password in URL for display
    maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  }
  
  try {
    const url = new URL(dbUrl);
    dbHost = url.hostname;
    dbPort = url.port || '(default)';
  } catch (e) {
    dbHost = 'invalid URL format: ' + e.message;
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    maskedUrl: maskedUrl,
    dbHost: dbHost,
    dbPort: dbPort,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'not set',
    },
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

