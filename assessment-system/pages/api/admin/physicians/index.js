const prisma = require('../../../../lib/prisma');
const { withAuth } = require('../../../../lib/auth');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is admin
  if (req.physician.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const physicians = await prisma.physician.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        licenseNumber: true,
        feePerReview: true,
        createdAt: true,
        approvedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assessments: true,
            reviewPayments: true,
          },
        },
      },
    });

    return res.status(200).json({ physicians });
  } catch (error) {
    console.error('Failed to fetch physicians:', error);
    return res.status(500).json({ error: 'Failed to fetch physicians' });
  }
}

export default withAuth(handler);

