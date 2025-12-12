const prisma = require('../../../lib/prisma');
const { withAuth } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get assessments
    const assessments = await prisma.patientAssessment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        physician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get counts by status
    const counts = await prisma.patientAssessment.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = {
      pending: 0,
      approved: 0,
      denied: 0,
      shipped: 0,
      all: 0,
    };

    counts.forEach((c) => {
      statusCounts[c.status] = c._count;
      statusCounts.all += c._count;
    });

    // Parse JSON fields and format for response
    const formattedAssessments = assessments.map((a) => {
      const patientInfo = JSON.parse(a.patientInfo);
      const riskFlags = JSON.parse(a.riskFlags);
      
      return {
        id: a.id,
        createdAt: a.createdAt,
        patientName: `${patientInfo.firstName} ${patientInfo.lastName}`,
        patientEmail: patientInfo.email,
        status: a.status,
        isAutoDisqualified: a.isAutoDisqualified,
        riskFlags: riskFlags,
        riskSummary: {
          disqualifiers: riskFlags.filter((f) => f.type === 'disqualifier').length,
          cautions: riskFlags.filter((f) => f.type === 'caution').length,
        },
        physician: a.physician,
        decisionTimestamp: a.decisionTimestamp,
      };
    });

    // Log the view
    await prisma.auditLog.create({
      data: {
        action: 'view_queue',
        entityType: 'assessment',
        details: JSON.stringify({ status, page }),
        physicianId: req.physician.id,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress,
      },
    });

    return res.status(200).json({
      assessments: formattedAssessments,
      counts: statusCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: statusCounts[status || 'all'],
      },
    });
  } catch (error) {
    console.error('Queue fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch assessments' });
  }
}

export default withAuth(handler);

