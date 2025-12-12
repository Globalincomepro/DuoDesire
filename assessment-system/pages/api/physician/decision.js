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

    // Log the decision
    await prisma.auditLog.create({
      data: {
        action: decision === 'approved' ? 'approve' : 'deny',
        entityType: 'assessment',
        entityId: assessmentId,
        details: JSON.stringify({
          notes,
          denialReason: decision === 'denied' ? denialReason : null,
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
    });
  } catch (error) {
    console.error('Decision error:', error);
    return res.status(500).json({ error: 'Failed to record decision' });
  }
}

export default withAuth(handler);

