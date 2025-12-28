const prisma = require('../../../lib/prisma');
const { withAuth } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const physicianId = req.physician.id;

    // Get physician's fee
    const physician = await prisma.physician.findUnique({
      where: { id: physicianId },
      select: { feePerReview: true },
    });

    // Get all payments for this physician
    const payments = await prisma.reviewPayment.findMany({
      where: { physicianId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidOut = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    const pendingBalance = totalEarnings - paidOut;
    const totalReviews = payments.length;
    const approvedCount = payments.filter(p => p.decision === 'approved').length;
    const deniedCount = payments.filter(p => p.decision === 'denied').length;

    // This month's earnings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = payments
      .filter(p => new Date(p.createdAt) >= monthStart)
      .reduce((sum, p) => sum + p.amount, 0);

    // Get payout cycles
    const cycles = await prisma.payoutCycle.findMany({
      where: { physicianId },
      orderBy: { startDate: 'desc' },
      take: 12, // Last 12 cycles
    });

    // Get recent payments (last 20)
    const recentPayments = payments.slice(0, 20);

    return res.status(200).json({
      totalEarnings,
      pendingBalance,
      paidOut,
      totalReviews,
      approvedCount,
      deniedCount,
      thisMonthEarnings,
      feePerReview: physician?.feePerReview || 0,
      cycles,
      recentPayments,
    });
  } catch (error) {
    console.error('Failed to fetch earnings:', error);
    return res.status(500).json({ error: 'Failed to fetch earnings data' });
  }
}

export default withAuth(handler);

