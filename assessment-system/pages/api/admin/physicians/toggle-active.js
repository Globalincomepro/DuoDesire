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
    const { physicianId, isActive } = req.body;

    if (!physicianId || isActive === undefined) {
      return res.status(400).json({ error: 'Physician ID and isActive are required' });
    }

    const physician = await prisma.physician.update({
      where: { id: physicianId },
      data: { isActive },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: isActive ? 'activate_physician' : 'deactivate_physician',
        entityType: 'physician',
        entityId: physicianId,
        physicianId: req.physician.id,
        details: JSON.stringify({ physicianEmail: physician.email }),
      },
    });

    return res.status(200).json({ 
      success: true, 
      message: `Physician ${isActive ? 'activated' : 'deactivated'} successfully`,
      physician,
    });
  } catch (error) {
    console.error('Failed to toggle active:', error);
    return res.status(500).json({ error: 'Failed to toggle active status' });
  }
}

export default withAuth(handler);

