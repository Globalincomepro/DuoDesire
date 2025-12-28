const prisma = require('../../../lib/prisma');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, licenseNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email already exists
    const existingPhysician = await prisma.physician.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingPhysician) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Get default fee from system settings
    let defaultFee = 5.00;
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
    });
    if (settings) {
      defaultFee = settings.defaultFeePerReview;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create physician with pending status
    const physician = await prisma.physician.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        licenseNumber: licenseNumber || null,
        role: 'physician',
        status: 'pending', // Requires admin approval
        feePerReview: defaultFee,
        isActive: false, // Not active until approved
      },
    });

    return res.status(201).json({
      message: 'Registration successful! Your application is pending admin approval.',
      physician: {
        id: physician.id,
        name: physician.name,
        email: physician.email,
        status: physician.status,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

