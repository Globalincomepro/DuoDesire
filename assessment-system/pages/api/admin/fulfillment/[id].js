const prisma = require('../../../../lib/prisma');
const { withAuth } = require('../../../../lib/auth');

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only admin can mark as shipped
  if (req.physician.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can mark orders as shipped' });
  }

  try {
    const { trackingNumber } = req.body;

    // Check if assessment exists and is approved
    const assessment = await prisma.patientAssessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved assessments can be marked as shipped' });
    }

    // Update assessment
    const updated = await prisma.patientAssessment.update({
      where: { id },
      data: {
        status: 'shipped',
        shippedAt: new Date(),
        trackingNumber: trackingNumber || null,
      },
    });

    // Log the shipment
    await prisma.auditLog.create({
      data: {
        action: 'ship',
        entityType: 'assessment',
        entityId: id,
        details: JSON.stringify({ trackingNumber }),
        physicianId: req.physician.id,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Order marked as shipped',
      assessment: {
        id: updated.id,
        status: updated.status,
        shippedAt: updated.shippedAt,
        trackingNumber: updated.trackingNumber,
      },
    });
  } catch (error) {
    console.error('Fulfillment error:', error);
    return res.status(500).json({ error: 'Failed to update fulfillment status' });
  }
}

export default withAuth(handler, ['admin']);

