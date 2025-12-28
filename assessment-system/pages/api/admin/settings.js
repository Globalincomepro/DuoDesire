const prisma = require('../../../lib/prisma');
const { withAuth } = require('../../../lib/auth');

async function handler(req, res) {
  // Check if user is admin
  if (req.physician.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      let settings = await prisma.systemSettings.findUnique({
        where: { id: 'system' },
      });

      // Create default settings if not exists
      if (!settings) {
        settings = await prisma.systemSettings.create({
          data: {
            id: 'system',
            defaultFeePerReview: 5.00,
            payoutCycleType: 'weekly',
          },
        });
      }

      return res.status(200).json({ settings });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { defaultFeePerReview, payoutCycleType } = req.body;

      const updateData = {};
      if (defaultFeePerReview !== undefined) {
        updateData.defaultFeePerReview = parseFloat(defaultFeePerReview);
      }
      if (payoutCycleType !== undefined) {
        updateData.payoutCycleType = payoutCycleType;
      }

      const settings = await prisma.systemSettings.upsert({
        where: { id: 'system' },
        update: updateData,
        create: {
          id: 'system',
          defaultFeePerReview: defaultFeePerReview || 5.00,
          payoutCycleType: payoutCycleType || 'weekly',
        },
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'update_settings',
          entityType: 'system',
          physicianId: req.physician.id,
          details: JSON.stringify(updateData),
        },
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Settings updated successfully',
        settings,
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

