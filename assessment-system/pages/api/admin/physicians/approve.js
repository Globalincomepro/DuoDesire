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
    const { physicianId } = req.body;

    if (!physicianId) {
      return res.status(400).json({ error: 'Physician ID is required' });
    }

    // Get default fee from settings
    let defaultFee = 5.00;
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
    });
    if (settings) {
      defaultFee = settings.defaultFeePerReview;
    }

    const physician = await prisma.physician.update({
      where: { id: physicianId },
      data: {
        status: 'approved',
        isActive: true,
        approvedAt: new Date(),
        approvedById: req.physician.id,
        feePerReview: defaultFee,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'approve_physician',
        entityType: 'physician',
        entityId: physicianId,
        physicianId: req.physician.id,
        details: JSON.stringify({ approvedPhysician: physician.email }),
      },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Physician approved successfully',
      physician,
    });
  } catch (error) {
    console.error('Failed to approve physician:', error);
    return res.status(500).json({ error: 'Failed to approve physician' });
  }
}

export default withAuth(handler);

