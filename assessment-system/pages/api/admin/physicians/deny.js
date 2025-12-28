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
    const { physicianId, reason } = req.body;

    if (!physicianId) {
      return res.status(400).json({ error: 'Physician ID is required' });
    }

    const physician = await prisma.physician.update({
      where: { id: physicianId },
      data: {
        status: 'denied',
        isActive: false,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'deny_physician',
        entityType: 'physician',
        entityId: physicianId,
        physicianId: req.physician.id,
        details: JSON.stringify({ deniedPhysician: physician.email, reason }),
      },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Physician registration denied',
      physician,
    });
  } catch (error) {
    console.error('Failed to deny physician:', error);
    return res.status(500).json({ error: 'Failed to deny physician' });
  }
}

export default withAuth(handler);

