const prisma = require('../../../lib/prisma');
const { withAuth } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { assessmentId, decision, notes, denialReason } = req.body;

    if (!assessmentId) {
      return res.status(400).json({ error: 'Assessment ID is required' });
    }

    if (!['approved', 'denied'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision. Must be "approved" or "denied"' });
    }

    if (decision === 'denied' && !denialReason) {
      return res.status(400).json({ error: 'Denial reason is required when denying an assessment' });
    }

    // Check if assessment exists and is pending
    const assessment = await prisma.patientAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status !== 'pending') {
      return res.status(400).json({ error: `Assessment has already been ${assessment.status}` });
    }

    // Get physician's fee per review
    const physician = await prisma.physician.findUnique({
      where: { id: req.physician.id },
      select: { feePerReview: true },
    });

    // Update assessment
    const updated = await prisma.patientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: decision,
        physicianId: req.physician.id,
        physicianNotes: notes || null,
        denialReason: decision === 'denied' ? denialReason : null,
        decisionTimestamp: new Date(),
      },
    });

    // Create payment record if physician has a fee configured
    let paymentRecord = null;
    if (physician && physician.feePerReview > 0) {
      // Find or create current payout cycle
      const now = new Date();
      const settings = await prisma.systemSettings.findUnique({ where: { id: 'system' } });
      const cycleType = settings?.payoutCycleType || 'weekly';
      
      // Calculate cycle start/end dates
      let cycleStart, cycleEnd;
      if (cycleType === 'weekly') {
        // Start of current week (Sunday)
        cycleStart = new Date(now);
        cycleStart.setDate(now.getDate() - now.getDay());
        cycleStart.setHours(0, 0, 0, 0);
        // End of current week (Saturday)
        cycleEnd = new Date(cycleStart);
        cycleEnd.setDate(cycleStart.getDate() + 6);
        cycleEnd.setHours(23, 59, 59, 999);
      } else {
        // Start of current month
        cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // End of current month
        cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // Find or create payout cycle
      let cycle = await prisma.payoutCycle.findFirst({
        where: {
          physicianId: req.physician.id,
          startDate: cycleStart,
          endDate: cycleEnd,
        },
      });

      if (!cycle) {
        cycle = await prisma.payoutCycle.create({
          data: {
            physicianId: req.physician.id,
            startDate: cycleStart,
            endDate: cycleEnd,
            cycleType,
            status: 'open',
          },
        });
      }

      // Create payment record
      paymentRecord = await prisma.reviewPayment.create({
        data: {
          assessmentId: assessmentId,
          physicianId: req.physician.id,
          amount: physician.feePerReview,
          decision: decision,
          cycleId: cycle.id,
        },
      });

      // Update cycle totals
      await prisma.payoutCycle.update({
        where: { id: cycle.id },
        data: {
          totalReviews: { increment: 1 },
          totalAmount: { increment: physician.feePerReview },
        },
      });
    }

    // Log the decision
    await prisma.auditLog.create({
      data: {
        action: decision === 'approved' ? 'approve' : 'deny',
        entityType: 'assessment',
        entityId: assessmentId,
        details: JSON.stringify({
          notes,
          denialReason: decision === 'denied' ? denialReason : null,
          paymentAmount: paymentRecord?.amount || 0,
        }),
        physicianId: req.physician.id,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Assessment ${decision} successfully`,
      assessment: {
        id: updated.id,
        status: updated.status,
        decisionTimestamp: updated.decisionTimestamp,
      },
      payment: paymentRecord ? {
        amount: paymentRecord.amount,
        cycleId: paymentRecord.cycleId,
      } : null,
    });
  } catch (error) {
    console.error('Decision error:', error);
    return res.status(500).json({ error: 'Failed to record decision' });
  }
}

export default withAuth(handler);

