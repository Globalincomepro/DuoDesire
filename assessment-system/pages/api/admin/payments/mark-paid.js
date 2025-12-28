const prisma = require('../../../../lib/prisma');
const { withAuth } = require('../../../../lib/auth');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.physician.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { cycleId, notes } = req.body;

    if (!cycleId) {
      return res.status(400).json({ error: 'Cycle ID is required' });
    }

    const now = new Date();

    // Update cycle status to paid
    const cycle = await prisma.payoutCycle.update({
      where: { id: cycleId },
      data: {
        status: 'paid',
        paidAt: now,
        paidBy: req.physician.id,
        paymentNotes: notes || null,
      },
    });

    // Mark all payments in this cycle as paid
    await prisma.reviewPayment.updateMany({
      where: { cycleId: cycleId },
      data: {
        isPaid: true,
        paidAt: now,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'mark_cycle_paid',
        entityType: 'payoutCycle',
        entityId: cycleId,
        physicianId: req.physician.id,
        details: JSON.stringify({
          totalAmount: cycle.totalAmount,
          totalReviews: cycle.totalReviews,
          physicianId: cycle.physicianId,
        }),
      },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Payout cycle marked as paid',
      cycle,
    });
  } catch (error) {
    console.error('Failed to mark cycle as paid:', error);
    return res.status(500).json({ error: 'Failed to mark cycle as paid' });
  }
}

export default withAuth(handler);

