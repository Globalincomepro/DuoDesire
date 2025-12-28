const prisma = require('../../../lib/prisma');
const { comparePassword, generateToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error: DATABASE_URL not set' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find physician by email
    const physician = await prisma.physician.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!physician) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!physician.isActive) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    // Check if physician is approved (skip check for admins)
    if (physician.role !== 'admin' && physician.status !== 'approved') {
      if (physician.status === 'pending') {
        return res.status(401).json({ error: 'Your account is pending admin approval' });
      }
      if (physician.status === 'denied') {
        return res.status(401).json({ error: 'Your registration was not approved' });
      }
      return res.status(401).json({ error: 'Account not approved' });
    }

    // Verify password
    const isValid = await comparePassword(password, physician.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.physician.update({
      where: { id: physician.id },
      data: { lastLoginAt: new Date() },
    });

    // Log the login
    await prisma.auditLog.create({
      data: {
        action: 'login',
        entityType: 'physician',
        entityId: physician.id,
        physicianId: physician.id,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress,
      },
    });

    // Generate JWT token
    const token = generateToken(physician);

    return res.status(200).json({
      success: true,
      token,
      physician: {
        id: physician.id,
        name: physician.name,
        email: physician.email,
        role: physician.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Login failed', 
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined 
    });
  }
}

