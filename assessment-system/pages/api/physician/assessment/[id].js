const prisma = require('../../../../lib/prisma');
const { withAuth } = require('../../../../lib/auth');

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const assessment = await prisma.patientAssessment.findUnique({
        where: { id },
        include: {
          physician: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      // Parse all JSON fields
      const formatted = {
        id: assessment.id,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
        patientInfo: JSON.parse(assessment.patientInfo),
        medicalHistory: JSON.parse(assessment.medicalHistory),
        medications: JSON.parse(assessment.medications),
        sexualHealth: JSON.parse(assessment.sexualHealth),
        contraindications: JSON.parse(assessment.contraindications),
        pt141Section: JSON.parse(assessment.pt141Section),
        oxytocinSection: JSON.parse(assessment.oxytocinSection),
        consentSigned: assessment.consentSigned,
        signatureData: assessment.signatureData,
        consentTimestamp: assessment.consentTimestamp,
        riskFlags: JSON.parse(assessment.riskFlags),
        isAutoDisqualified: assessment.isAutoDisqualified,
        requiresReview: assessment.requiresReview,
        status: assessment.status,
        ipAddress: assessment.ipAddress,
        physician: assessment.physician,
        physicianNotes: assessment.physicianNotes,
        denialReason: assessment.denialReason,
        decisionTimestamp: assessment.decisionTimestamp,
        shippedAt: assessment.shippedAt,
        trackingNumber: assessment.trackingNumber,
      };

      // Log the view
      await prisma.auditLog.create({
        data: {
          action: 'view',
          entityType: 'assessment',
          entityId: id,
          physicianId: req.physician.id,
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress,
        },
      });

      return res.status(200).json(formatted);
    } catch (error) {
      console.error('Assessment fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch assessment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

