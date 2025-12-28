const prisma = require('../../../../lib/prisma');
const { withAuth } = require('../../../../lib/auth');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.physician.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const cycles = await prisma.payoutCycle.findMany({
      orderBy: [
        { status: 'asc' }, // open first, then closed, then paid
        { startDate: 'desc' },
      ],
      include: {
        physician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    return res.status(200).json({ cycles });
  } catch (error) {
    console.error('Failed to fetch cycles:', error);
    return res.status(500).json({ error: 'Failed to fetch payout cycles' });
  }
}

export default withAuth(handler);

