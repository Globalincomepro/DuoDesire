/**
 * Risk Flag Detection Logic
 * Analyzes patient assessment data and generates risk flags
 */

const FLAG_TYPES = {
  DISQUALIFIER: 'disqualifier',  // Auto-fail - cannot proceed
  CAUTION: 'caution',            // Requires physician review
  INFO: 'info',                  // Informational only
};

function analyzeRiskFlags(formData) {
  const flags = [];
  let isAutoDisqualified = false;
  let requiresReview = false;

  // === DISQUALIFYING FLAGS (Auto-Fail) ===
  
  // Nitrate medication use
  if (formData.takesNitrates) {
    flags.push({
      type: FLAG_TYPES.DISQUALIFIER,
      code: 'NITRATE_USE',
      message: 'Patient uses nitrate medications',
      details: formData.nitrateDetails || 'Nitrates specified',
      severity: 'critical',
    });
    isAutoDisqualified = true;
  }

  // Doctor advised no sexual activity
  if (formData.doctorAdvisedNoSex) {
    flags.push({
      type: FLAG_TYPES.DISQUALIFIER,
      code: 'MEDICAL_RESTRICTION',
      message: 'Doctor has advised against sexual activity',
      severity: 'critical',
    });
    isAutoDisqualified = true;
  }

  // Severe cardiac condition
  if (formData.severeCardiacCondition) {
    flags.push({
      type: FLAG_TYPES.DISQUALIFIER,
      code: 'SEVERE_CARDIAC',
      message: 'Patient has severe/unstable cardiac condition',
      severity: 'critical',
    });
    isAutoDisqualified = true;
  }

  // Pregnancy (disqualifier for PT-141 and Oxytocin)
  if (formData.isPregnant) {
    flags.push({
      type: FLAG_TYPES.DISQUALIFIER,
      code: 'PREGNANCY',
      message: 'Patient is pregnant - disqualified for PT-141 and Oxytocin',
      severity: 'critical',
    });
    isAutoDisqualified = true;
  }

  // === CAUTION FLAGS (Physician Review Required) ===

  // High blood pressure
  const systolic = parseInt(formData.currentBPSystolic);
  const diastolic = parseInt(formData.currentBPDiastolic);
  
  if (systolic > 150 || diastolic > 95) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'HIGH_BP',
      message: `Blood pressure elevated: ${systolic}/${diastolic}`,
      details: 'BP above 150/95 threshold',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Very low blood pressure
  if (systolic < 90 || diastolic < 60) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'LOW_BP',
      message: `Blood pressure low: ${systolic}/${diastolic}`,
      details: 'BP below 90/60 threshold',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Heart attack history
  if (formData.hasHeartAttack) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'HEART_ATTACK_HISTORY',
      message: 'History of heart attack',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Stroke history
  if (formData.hasStroke) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'STROKE_HISTORY',
      message: 'History of stroke or TIA',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Eye disorder (NAION)
  if (formData.hasEyeDisorder) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'NAION_RISK',
      message: 'History of eye disorder (potential NAION risk)',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // SSRI/Psychiatric medication use
  if (formData.takesSSRIs) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'SSRI_USE',
      message: 'Uses SSRIs or psychiatric medications',
      details: formData.ssriDetails || 'SSRIs specified',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Prior priapism
  if (formData.hasPriapism) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'PRIAPISM_HISTORY',
      message: 'History of priapism',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Kidney impairment
  if (formData.hasKidneyDisease) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'KIDNEY_IMPAIRMENT',
      message: 'Kidney disease or impairment',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Liver impairment
  if (formData.hasLiverDisease) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'LIVER_IMPAIRMENT',
      message: 'Liver disease or impairment',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Heart condition
  if (formData.hasHeartCondition) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'HEART_CONDITION',
      message: 'History of heart disease or condition',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Blood pressure medication
  if (formData.takesBloodPressureMeds) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'BP_MEDICATION',
      message: 'Takes blood pressure medication',
      details: formData.bloodPressureMedDetails || 'BP meds specified',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Breastfeeding (for oxytocin)
  if (formData.isBreastfeeding) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'BREASTFEEDING',
      message: 'Patient is breastfeeding',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Oxytocin allergy
  if (formData.oxytocinAllergy) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'OXYTOCIN_ALLERGY',
      message: 'Known allergy to oxytocin',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // Uterine conditions
  if (formData.uterineConditions) {
    flags.push({
      type: FLAG_TYPES.CAUTION,
      code: 'UTERINE_CONDITIONS',
      message: 'Has uterine conditions or prior uterine surgery',
      severity: 'warning',
    });
    requiresReview = true;
  }

  // === INFO FLAGS ===

  // Diabetes
  if (formData.hasDiabetes) {
    flags.push({
      type: FLAG_TYPES.INFO,
      code: 'DIABETES',
      message: 'Patient has diabetes',
      severity: 'info',
    });
  }

  // Trying to conceive
  if (formData.tryingToConceive) {
    flags.push({
      type: FLAG_TYPES.INFO,
      code: 'TTC',
      message: 'Patient is trying to conceive',
      severity: 'info',
    });
  }

  // If no caution or disqualifying flags, still mark as requires review for first-time approval
  if (!requiresReview && !isAutoDisqualified) {
    requiresReview = true; // All assessments require physician review
  }

  return {
    flags,
    isAutoDisqualified,
    requiresReview,
    summary: {
      totalFlags: flags.length,
      disqualifiers: flags.filter(f => f.type === FLAG_TYPES.DISQUALIFIER).length,
      cautions: flags.filter(f => f.type === FLAG_TYPES.CAUTION).length,
      info: flags.filter(f => f.type === FLAG_TYPES.INFO).length,
    },
  };
}

module.exports = { FLAG_TYPES, analyzeRiskFlags };

