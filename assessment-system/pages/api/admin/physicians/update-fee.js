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
    const { physicianId, feePerReview } = req.body;

    if (!physicianId || feePerReview === undefined) {
      return res.status(400).json({ error: 'Physician ID and fee are required' });
    }

    const fee = parseFloat(feePerReview);
    if (isNaN(fee) || fee < 0) {
      return res.status(400).json({ error: 'Invalid fee amount' });
    }

    const physician = await prisma.physician.update({
      where: { id: physicianId },
      data: { feePerReview: fee },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'update_fee',
        entityType: 'physician',
        entityId: physicianId,
        physicianId: req.physician.id,
        details: JSON.stringify({ newFee: fee }),
      },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Fee updated successfully',
      physician,
    });
  } catch (error) {
    console.error('Failed to update fee:', error);
    return res.status(500).json({ error: 'Failed to update fee' });
  }
}

export default withAuth(handler);

