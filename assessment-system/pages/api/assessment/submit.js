const prisma = require('../../../lib/prisma');
const { analyzeRiskFlags } = require('../../../lib/riskFlags');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // Analyze risk flags
    const riskAnalysis = analyzeRiskFlags(formData);
    
    // Prepare data for storage
    const patientInfo = JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
    });
    
    const medicalHistory = JSON.stringify({
      hasHeartCondition: formData.hasHeartCondition,
      hasHighBloodPressure: formData.hasHighBloodPressure,
      hasLowBloodPressure: formData.hasLowBloodPressure,
      hasStroke: formData.hasStroke,
      hasHeartAttack: formData.hasHeartAttack,
      hasDiabetes: formData.hasDiabetes,
      hasKidneyDisease: formData.hasKidneyDisease,
      hasLiverDisease: formData.hasLiverDisease,
      hasEyeDisorder: formData.hasEyeDisorder,
      hasPriapism: formData.hasPriapism,
      otherConditions: formData.otherConditions,
      surgeries: formData.surgeries,
      allergies: formData.allergies,
    });
    
    const medications = JSON.stringify({
      takesNitrates: formData.takesNitrates,
      nitrateDetails: formData.nitrateDetails,
      takesBloodPressureMeds: formData.takesBloodPressureMeds,
      bloodPressureMedDetails: formData.bloodPressureMedDetails,
      takesSSRIs: formData.takesSSRIs,
      ssriDetails: formData.ssriDetails,
      otherMedDetails: formData.otherMedDetails,
    });
    
    const sexualHealth = JSON.stringify({
      experiencesED: formData.experiencesED,
      edFrequency: formData.edFrequency,
      edDuration: formData.edDuration,
      lowDesire: formData.lowDesire,
      desireFrequency: formData.desireFrequency,
      relationshipStatus: formData.relationshipStatus,
      partnerAware: formData.partnerAware,
      previousTreatments: formData.previousTreatments,
    });
    
    const contraindications = JSON.stringify({
      doctorAdvisedNoSex: formData.doctorAdvisedNoSex,
      severeCardiacCondition: formData.severeCardiacCondition,
      currentBPSystolic: formData.currentBPSystolic,
      currentBPDiastolic: formData.currentBPDiastolic,
      isPregnant: formData.isPregnant,
      isBreastfeeding: formData.isBreastfeeding,
      tryingToConceive: formData.tryingToConceive,
    });
    
    const pt141Section = JSON.stringify({
      nausea: formData.nausea,
      flushing: formData.flushing,
      headaches: formData.headaches,
      pt141Conditions: formData.pt141Conditions,
    });
    
    const oxytocinSection = JSON.stringify({
      oxytocinAllergy: formData.oxytocinAllergy,
      uterineConditions: formData.uterineConditions,
      oxytocinConditions: formData.oxytocinConditions,
    });
    
    // Get client IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.socket?.remoteAddress;
    
    // Create assessment record
    const assessment = await prisma.patientAssessment.create({
      data: {
        patientInfo,
        medicalHistory,
        medications,
        sexualHealth,
        contraindications,
        pt141Section,
        oxytocinSection,
        consentSigned: true,
        signatureData: formData.signature,
        consentTimestamp: new Date(),
        riskFlags: JSON.stringify(riskAnalysis.flags),
        isAutoDisqualified: riskAnalysis.isAutoDisqualified,
        requiresReview: riskAnalysis.requiresReview,
        status: 'pending',
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
      },
    });
    
    return res.status(200).json({
      success: true,
      assessmentId: assessment.id,
      message: 'Assessment submitted successfully',
    });
    
  } catch (error) {
    console.error('Assessment submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit assessment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

