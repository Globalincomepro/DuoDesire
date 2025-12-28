import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AssessmentReview() {
  const router = useRouter();
  const { id } = router.query;
  
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [expandedSections, setExpandedSections] = useState(['patientInfo', 'riskFlags']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const token = localStorage.getItem('physician_token');
    if (!token) {
      router.push('/physician/login');
      return;
    }
    
    fetchAssessment(token);
  }, [id]);

  const fetchAssessment = async (token) => {
    try {
      const response = await fetch(`/api/physician/assessment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 401) {
        router.push('/physician/login');
        return;
      }
      
      if (response.status === 404) {
        setError('Assessment not found');
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      setAssessment(data);
    } catch (error) {
      setError('Failed to load assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleSubmitDecision = async () => {
    if (!decision) {
      setError('Please select approve or deny');
      return;
    }
    
    if (decision === 'denied' && !denialReason) {
      setError('Please provide a reason for denial');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('physician_token');
      const response = await fetch('/api/physician/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessmentId: id,
          decision,
          notes,
          denialReason,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push('/physician/dashboard');
      } else {
        setError(data.error || 'Failed to submit decision');
      }
    } catch (error) {
      setError('Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderSection = (title, key, content) => {
    const isExpanded = expandedSections.includes(key);
    
    return (
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
        >
          <span className="font-medium text-gray-900">{title}</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && (
          <div className="p-4 bg-white animate-fade-in">
            {content}
          </div>
        )}
      </div>
    );
  };

  const renderFieldValue = (label, value) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">{label}</span>
          <span className={value ? 'text-red-600 font-medium' : 'text-green-600'}>
            {value ? 'Yes' : 'No'}
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">{value || '—'}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/physician/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Review Assessment | DuoDesire™</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-display hover:opacity-80 transition-opacity">
              <span className="text-gray-900">Duo</span>
              <span className="text-primary-500">Desire</span>
              <span className="text-primary-500 text-xs">™</span>
            </Link>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => router.push('/physician/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm text-gray-600">Back to Dashboard</span>
            </button>
          </div>
          
          <span className={`status-badge ${assessment?.status}`}>
            {assessment?.status}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Risk Flags Banner */}
        {assessment?.riskFlags?.length > 0 && (
          <div className={`mb-6 p-4 rounded-xl ${
            assessment.isAutoDisqualified
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-yellow-50 border-2 border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              <svg className={`w-6 h-6 flex-shrink-0 ${
                assessment.isAutoDisqualified ? 'text-red-600' : 'text-yellow-600'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className={`font-semibold ${
                  assessment.isAutoDisqualified ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {assessment.isAutoDisqualified 
                    ? 'Auto-Disqualified - Critical Contraindications Detected'
                    : 'Risk Flags Require Review'
                  }
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {assessment.riskFlags.map((flag, idx) => (
                    <span key={idx} className={`text-sm px-3 py-1 rounded-full ${
                      flag.type === 'disqualifier' ? 'bg-red-100 text-red-700' :
                      flag.type === 'caution' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {flag.message}
                      {flag.details && ` — ${flag.details}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900">
                {assessment?.patientInfo?.firstName} {assessment?.patientInfo?.lastName}
              </h2>
              <p className="text-gray-500">{assessment?.patientInfo?.email}</p>
              <p className="text-gray-400 text-sm mt-1">
                Submitted: {formatDate(assessment?.createdAt)}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{assessment?.patientInfo?.dateOfBirth}</p>
              <p className="text-sm text-gray-500 mt-2">Gender</p>
              <p className="font-medium capitalize">{assessment?.patientInfo?.gender}</p>
            </div>
          </div>
        </div>

        {/* Assessment Sections */}
        <div className="space-y-4 mb-8">
          {renderSection('Patient Information', 'patientInfo', (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                {renderFieldValue('Phone', assessment?.patientInfo?.phone)}
                {renderFieldValue('Address', assessment?.patientInfo?.address)}
                {renderFieldValue('City', assessment?.patientInfo?.city)}
              </div>
              <div>
                {renderFieldValue('State', assessment?.patientInfo?.state)}
                {renderFieldValue('ZIP Code', assessment?.patientInfo?.zipCode)}
              </div>
            </div>
          ))}

          {renderSection('Medical History', 'medicalHistory', (
            <div className="space-y-1">
              {renderFieldValue('Heart Condition', assessment?.medicalHistory?.hasHeartCondition)}
              {renderFieldValue('High Blood Pressure', assessment?.medicalHistory?.hasHighBloodPressure)}
              {renderFieldValue('Low Blood Pressure', assessment?.medicalHistory?.hasLowBloodPressure)}
              {renderFieldValue('Stroke/TIA History', assessment?.medicalHistory?.hasStroke)}
              {renderFieldValue('Heart Attack History', assessment?.medicalHistory?.hasHeartAttack)}
              {renderFieldValue('Diabetes', assessment?.medicalHistory?.hasDiabetes)}
              {renderFieldValue('Kidney Disease', assessment?.medicalHistory?.hasKidneyDisease)}
              {renderFieldValue('Liver Disease', assessment?.medicalHistory?.hasLiverDisease)}
              {renderFieldValue('Eye Disorder (NAION)', assessment?.medicalHistory?.hasEyeDisorder)}
              {renderFieldValue('Priapism History', assessment?.medicalHistory?.hasPriapism)}
              {assessment?.medicalHistory?.otherConditions && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-1">Other Conditions:</p>
                  <p className="text-gray-700">{assessment?.medicalHistory?.otherConditions}</p>
                </div>
              )}
              {assessment?.medicalHistory?.surgeries && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-1">Surgeries:</p>
                  <p className="text-gray-700">{assessment?.medicalHistory?.surgeries}</p>
                </div>
              )}
              {assessment?.medicalHistory?.allergies && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-1">Allergies:</p>
                  <p className="text-gray-700">{assessment?.medicalHistory?.allergies}</p>
                </div>
              )}
            </div>
          ))}

          {renderSection('Current Medications', 'medications', (
            <div className="space-y-1">
              <div className={`p-3 rounded ${assessment?.medications?.takesNitrates ? 'bg-red-50' : ''}`}>
                {renderFieldValue('Takes Nitrates', assessment?.medications?.takesNitrates)}
                {assessment?.medications?.nitrateDetails && (
                  <p className="text-red-700 text-sm mt-1 ml-4">Details: {assessment?.medications?.nitrateDetails}</p>
                )}
              </div>
              {renderFieldValue('Blood Pressure Medication', assessment?.medications?.takesBloodPressureMeds)}
              {assessment?.medications?.bloodPressureMedDetails && (
                <p className="text-gray-700 text-sm ml-4 mb-2">Details: {assessment?.medications?.bloodPressureMedDetails}</p>
              )}
              {renderFieldValue('SSRIs/Psychiatric Meds', assessment?.medications?.takesSSRIs)}
              {assessment?.medications?.ssriDetails && (
                <p className="text-gray-700 text-sm ml-4 mb-2">Details: {assessment?.medications?.ssriDetails}</p>
              )}
              {assessment?.medications?.otherMedDetails && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-1">Other Medications:</p>
                  <p className="text-gray-700">{assessment?.medications?.otherMedDetails}</p>
                </div>
              )}
            </div>
          ))}

          {renderSection('Sexual Health', 'sexualHealth', (
            <div className="space-y-1">
              {renderFieldValue('Experiences ED', assessment?.sexualHealth?.experiencesED)}
              {assessment?.sexualHealth?.experiencesED && (
                <>
                  {renderFieldValue('ED Frequency', assessment?.sexualHealth?.edFrequency)}
                  {renderFieldValue('ED Duration', assessment?.sexualHealth?.edDuration)}
                </>
              )}
              {renderFieldValue('Low Desire', assessment?.sexualHealth?.lowDesire)}
              {assessment?.sexualHealth?.lowDesire && (
                <>{renderFieldValue('Desire Frequency', assessment?.sexualHealth?.desireFrequency)}</>
              )}
              {renderFieldValue('Relationship Status', assessment?.sexualHealth?.relationshipStatus)}
              {renderFieldValue('Partner Aware', assessment?.sexualHealth?.partnerAware)}
              {assessment?.sexualHealth?.previousTreatments && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-1">Previous Treatments:</p>
                  <p className="text-gray-700">{assessment?.sexualHealth?.previousTreatments}</p>
                </div>
              )}
            </div>
          ))}

          {renderSection('Contraindication Screening', 'contraindications', (
            <div className="space-y-1">
              <div className={`p-3 rounded ${assessment?.contraindications?.doctorAdvisedNoSex ? 'bg-red-50' : ''}`}>
                {renderFieldValue('Doctor Advised No Sexual Activity', assessment?.contraindications?.doctorAdvisedNoSex)}
              </div>
              <div className={`p-3 rounded ${assessment?.contraindications?.severeCardiacCondition ? 'bg-red-50' : ''}`}>
                {renderFieldValue('Severe Cardiac Condition', assessment?.contraindications?.severeCardiacCondition)}
              </div>
              <div className="p-3 bg-gray-50 rounded mt-2">
                <p className="text-sm text-gray-500 mb-1">Blood Pressure Reading:</p>
                <p className="text-xl font-semibold">
                  {assessment?.contraindications?.currentBPSystolic}/{assessment?.contraindications?.currentBPDiastolic} mmHg
                </p>
              </div>
              <div className={`p-3 rounded mt-2 ${assessment?.contraindications?.isPregnant ? 'bg-red-50' : ''}`}>
                {renderFieldValue('Pregnant', assessment?.contraindications?.isPregnant)}
              </div>
              {renderFieldValue('Breastfeeding', assessment?.contraindications?.isBreastfeeding)}
              {renderFieldValue('Trying to Conceive', assessment?.contraindications?.tryingToConceive)}
            </div>
          ))}

          {renderSection('PT-141 Screening', 'pt141', (
            <div className="space-y-1">
              {renderFieldValue('Severe Nausea History', assessment?.pt141Section?.nausea)}
              {renderFieldValue('Severe Flushing History', assessment?.pt141Section?.flushing)}
              {renderFieldValue('Severe Headaches/Migraines', assessment?.pt141Section?.headaches)}
              {assessment?.pt141Section?.pt141Conditions && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-1">Additional PT-141 Conditions:</p>
                  <p className="text-gray-700">{assessment?.pt141Section?.pt141Conditions}</p>
                </div>
              )}
            </div>
          ))}

          {renderSection('Oxytocin Screening', 'oxytocin', (
            <div className="space-y-1">
              {renderFieldValue('Oxytocin Allergy', assessment?.oxytocinSection?.oxytocinAllergy)}
              {renderFieldValue('Uterine Conditions', assessment?.oxytocinSection?.uterineConditions)}
              {assessment?.oxytocinSection?.oxytocinConditions && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-1">Additional Oxytocin Conditions:</p>
                  <p className="text-gray-700">{assessment?.oxytocinSection?.oxytocinConditions}</p>
                </div>
              )}
            </div>
          ))}

          {renderSection('Consent & Signature', 'consent', (
            <div>
              <div className="space-y-1 mb-4">
                {renderFieldValue('Consent Signed', assessment?.consentSigned)}
                {renderFieldValue('Consent Timestamp', formatDate(assessment?.consentTimestamp))}
              </div>
              {assessment?.signatureData && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Digital Signature:</p>
                  <img 
                    src={assessment.signatureData} 
                    alt="Patient Signature" 
                    className="border rounded bg-white p-2 max-w-md"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Decision Panel */}
        {assessment?.status === 'pending' && (
          <div className="bg-white rounded-xl shadow-lg p-6 sticky bottom-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Physician Decision</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setDecision('approved')}
                className={`p-4 rounded-lg border-2 transition ${
                  decision === 'approved'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    decision === 'approved' ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    <svg className={`w-6 h-6 ${decision === 'approved' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`font-semibold ${decision === 'approved' ? 'text-green-700' : 'text-gray-700'}`}>
                    Approve
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setDecision('denied')}
                className={`p-4 rounded-lg border-2 transition ${
                  decision === 'denied'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    decision === 'denied' ? 'bg-red-500' : 'bg-gray-200'
                  }`}>
                    <svg className={`w-6 h-6 ${decision === 'denied' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className={`font-semibold ${decision === 'denied' ? 'text-red-700' : 'text-gray-700'}`}>
                    Deny
                  </span>
                </div>
              </button>
            </div>
            
            {decision === 'denied' && (
              <div className="mb-4">
                <label className="form-label">Reason for Denial *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="Please provide a reason for denying this assessment..."
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="form-label">Physician Notes (Optional)</label>
              <textarea
                className="form-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
              />
            </div>
            
            <button
              onClick={handleSubmitDecision}
              disabled={isSubmitting || !decision}
              className={`w-full btn ${
                decision === 'approved' ? 'btn-success' : 
                decision === 'denied' ? 'btn-danger' : 
                'btn-primary'
              } py-4`}
            >
              {isSubmitting ? 'Submitting...' : `Submit ${decision ? decision.charAt(0).toUpperCase() + decision.slice(1) : 'Decision'}`}
            </button>
          </div>
        )}

        {/* Previous Decision Display */}
        {assessment?.status !== 'pending' && assessment?.physician && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Decision Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`status-badge ${assessment.status}`}>{assessment.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reviewed By</span>
                <span className="font-medium">{assessment.physician.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Decision Date</span>
                <span className="font-medium">{formatDate(assessment.decisionTimestamp)}</span>
              </div>
              {assessment.physicianNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500 mb-1">Notes:</p>
                  <p className="text-gray-700">{assessment.physicianNotes}</p>
                </div>
              )}
              {assessment.denialReason && (
                <div className="mt-2 p-3 bg-red-50 rounded">
                  <p className="text-sm text-red-500 mb-1">Denial Reason:</p>
                  <p className="text-red-700">{assessment.denialReason}</p>
                </div>
              )}
              {assessment.shippedAt && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-500 mb-1">Shipped:</p>
                  <p className="text-blue-700">{formatDate(assessment.shippedAt)}</p>
                  {assessment.trackingNumber && (
                    <p className="text-blue-700">Tracking: {assessment.trackingNumber}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


