import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const STEPS = [
  { id: 1, name: 'Patient Info', description: 'Your basic information' },
  { id: 2, name: 'Medical History', description: 'Health conditions & history' },
  { id: 3, name: 'Medications', description: 'Current medications' },
  { id: 4, name: 'Sexual Health', description: 'Intimate wellness' },
  { id: 5, name: 'Screening', description: 'Contraindication check' },
  { id: 6, name: 'PT-141', description: 'PT-141 specific questions' },
  { id: 7, name: 'Oxytocin', description: 'Oxytocin specific questions' },
  { id: 8, name: 'Consent', description: 'Review & sign' },
];

export default function Assessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Patient Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Medical History
    hasHeartCondition: false,
    hasHighBloodPressure: false,
    hasLowBloodPressure: false,
    hasStroke: false,
    hasHeartAttack: false,
    hasDiabetes: false,
    hasKidneyDisease: false,
    hasLiverDisease: false,
    hasEyeDisorder: false,
    hasPriapism: false,
    otherConditions: '',
    surgeries: '',
    allergies: '',
    
    // Medications
    takesNitrates: false,
    nitrateDetails: '',
    takesBloodPressureMeds: false,
    bloodPressureMedDetails: '',
    takesSSRIs: false,
    ssriDetails: '',
    takesOtherMeds: false,
    otherMedDetails: '',
    
    // Sexual Health
    experiencesED: false,
    edFrequency: '',
    edDuration: '',
    lowDesire: false,
    desireFrequency: '',
    relationshipStatus: '',
    partnerAware: false,
    previousTreatments: '',
    
    // Contraindications
    doctorAdvisedNoSex: false,
    severeCardiacCondition: false,
    currentBPSystolic: '',
    currentBPDiastolic: '',
    isPregnant: false,
    isBreastfeeding: false,
    tryingToConceive: false,
    
    // PT-141 Specific
    nausea: false,
    flushing: false,
    headaches: false,
    pt141Conditions: '',
    
    // Oxytocin Specific
    oxytocinAllergy: false,
    uterineConditions: false,
    oxytocinConditions: '',
    
    // Consent
    understandsRisks: false,
    agreesToTelehealth: false,
    agreesToPrivacy: false,
    signature: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }
    
    if (step === 5) {
      if (!formData.currentBPSystolic) newErrors.currentBPSystolic = 'Systolic BP is required';
      if (!formData.currentBPDiastolic) newErrors.currentBPDiastolic = 'Diastolic BP is required';
    }
    
    if (step === 8) {
      if (!formData.understandsRisks) newErrors.understandsRisks = 'You must acknowledge the risks';
      if (!formData.agreesToTelehealth) newErrors.agreesToTelehealth = 'You must agree to telehealth consent';
      if (!formData.agreesToPrivacy) newErrors.agreesToPrivacy = 'You must agree to the privacy policy';
      if (!formData.signature) newErrors.signature = 'Signature is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(8)) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit assessment');
      }
    } catch (error) {
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Signature pad functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      updateFormData('signature', canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateFormData('signature', '');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-6">
        <Head>
          <title>Assessment Submitted | DuoDesire™</title>
        </Head>
        <div className="card max-w-lg text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-semibold text-gray-900 mb-4">Assessment Submitted</h1>
          <p className="text-gray-600 mb-6">
            Thank you for completing the DuoDesire™ Couples Chemistry Assessment. 
            A licensed physician will review your submission and you'll be notified of the next steps.
          </p>
          <p className="text-sm text-gray-500">
            This typically takes 1-2 business days. Please check your email for updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50">
      <Head>
        <title>Couples Chemistry Assessment | DuoDesire™</title>
        <meta name="description" content="Complete your DuoDesire medical assessment" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display">
              <span className="text-gray-900">Duo</span>
              <span className="text-primary-500">Desire</span>
              <span className="text-primary-500 text-sm">™</span>
            </h1>
            <span className="text-sm text-gray-500">Couples Chemistry Assessment</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {STEPS.length}</span>
            <span className="text-sm text-gray-500">{STEPS[currentStep - 1].name}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="card animate-fade-in">
          {/* Step 1: Patient Info */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Patient Information</h2>
              <p className="text-gray-600 mb-8">Please provide your basic information for our medical records.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                  />
                  {errors.firstName && <p className="form-error">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                  />
                  {errors.lastName && <p className="form-error">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    className={`form-input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  />
                  {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth}</p>}
                </div>
                
                <div>
                  <label className="form-label">Gender *</label>
                  <select
                    className={`form-input ${errors.gender ? 'border-red-500' : ''}`}
                    value={formData.gender}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="form-error">{errors.gender}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Medical History */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Medical History</h2>
              <p className="text-gray-600 mb-8">Please indicate if you have any of the following conditions.</p>
              
              <div className="space-y-4">
                <p className="font-medium text-gray-700">Do you have or have you ever had any of the following?</p>
                
                {[
                  { key: 'hasHeartCondition', label: 'Heart disease or heart condition' },
                  { key: 'hasHighBloodPressure', label: 'High blood pressure (hypertension)' },
                  { key: 'hasLowBloodPressure', label: 'Low blood pressure (hypotension)' },
                  { key: 'hasStroke', label: 'Stroke or TIA (mini-stroke)' },
                  { key: 'hasHeartAttack', label: 'Heart attack' },
                  { key: 'hasDiabetes', label: 'Diabetes' },
                  { key: 'hasKidneyDisease', label: 'Kidney disease or impairment' },
                  { key: 'hasLiverDisease', label: 'Liver disease or impairment' },
                  { key: 'hasEyeDisorder', label: 'Eye disorder such as NAION (sudden vision loss)' },
                  { key: 'hasPriapism', label: 'Priapism (prolonged, painful erection)' },
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      checked={formData[item.key]}
                      onChange={(e) => updateFormData(item.key, e.target.checked)}
                    />
                    <span className="text-gray-700">{item.label}</span>
                  </label>
                ))}
                
                <div className="mt-6">
                  <label className="form-label">Other medical conditions (please list)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.otherConditions}
                    onChange={(e) => updateFormData('otherConditions', e.target.value)}
                    placeholder="List any other medical conditions..."
                  />
                </div>
                
                <div>
                  <label className="form-label">Previous surgeries</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={formData.surgeries}
                    onChange={(e) => updateFormData('surgeries', e.target.value)}
                    placeholder="List any surgeries you've had..."
                  />
                </div>
                
                <div>
                  <label className="form-label">Allergies</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={formData.allergies}
                    onChange={(e) => updateFormData('allergies', e.target.value)}
                    placeholder="List any allergies (medications, foods, etc.)..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Medications */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Current Medications</h2>
              <p className="text-gray-600 mb-8">Please list all medications you are currently taking.</p>
              
              <div className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-red-500 rounded focus:ring-red-500 mt-0.5"
                      checked={formData.takesNitrates}
                      onChange={(e) => updateFormData('takesNitrates', e.target.checked)}
                    />
                    <div>
                      <span className="font-medium text-red-800">Do you take nitrates or nitrate medications?</span>
                      <p className="text-sm text-red-600 mt-1">
                        (e.g., nitroglycerin, isosorbide, amyl nitrate/poppers)
                      </p>
                    </div>
                  </label>
                  {formData.takesNitrates && (
                    <div className="mt-4 ml-8">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Please specify which nitrate medications..."
                        value={formData.nitrateDetails}
                        onChange={(e) => updateFormData('nitrateDetails', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 mt-0.5"
                      checked={formData.takesBloodPressureMeds}
                      onChange={(e) => updateFormData('takesBloodPressureMeds', e.target.checked)}
                    />
                    <div>
                      <span className="font-medium text-yellow-800">Do you take blood pressure medications?</span>
                    </div>
                  </label>
                  {formData.takesBloodPressureMeds && (
                    <div className="mt-4 ml-8">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Please list your blood pressure medications..."
                        value={formData.bloodPressureMedDetails}
                        onChange={(e) => updateFormData('bloodPressureMedDetails', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 mt-0.5"
                      checked={formData.takesSSRIs}
                      onChange={(e) => updateFormData('takesSSRIs', e.target.checked)}
                    />
                    <div>
                      <span className="font-medium text-yellow-800">Do you take SSRIs or psychiatric medications?</span>
                      <p className="text-sm text-yellow-600 mt-1">
                        (e.g., Prozac, Zoloft, Lexapro, antidepressants, anti-anxiety)
                      </p>
                    </div>
                  </label>
                  {formData.takesSSRIs && (
                    <div className="mt-4 ml-8">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Please list your psychiatric medications..."
                        value={formData.ssriDetails}
                        onChange={(e) => updateFormData('ssriDetails', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Other medications, vitamins, or supplements</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={formData.otherMedDetails}
                    onChange={(e) => updateFormData('otherMedDetails', e.target.value)}
                    placeholder="List all other medications, vitamins, and supplements you take..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Sexual Health */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Sexual Health</h2>
              <p className="text-gray-600 mb-8">Help us understand your intimate wellness needs.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      checked={formData.experiencesED}
                      onChange={(e) => updateFormData('experiencesED', e.target.checked)}
                    />
                    <span className="text-gray-700">I experience erectile dysfunction (difficulty achieving or maintaining erections)</span>
                  </label>
                  
                  {formData.experiencesED && (
                    <div className="mt-4 ml-8 space-y-4">
                      <div>
                        <label className="form-label">How often do you experience ED?</label>
                        <select
                          className="form-input"
                          value={formData.edFrequency}
                          onChange={(e) => updateFormData('edFrequency', e.target.value)}
                        >
                          <option value="">Select frequency</option>
                          <option value="rarely">Rarely (less than 25% of the time)</option>
                          <option value="sometimes">Sometimes (25-50% of the time)</option>
                          <option value="often">Often (50-75% of the time)</option>
                          <option value="always">Almost always (more than 75% of the time)</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">How long have you experienced ED?</label>
                        <select
                          className="form-input"
                          value={formData.edDuration}
                          onChange={(e) => updateFormData('edDuration', e.target.value)}
                        >
                          <option value="">Select duration</option>
                          <option value="less-3-months">Less than 3 months</option>
                          <option value="3-6-months">3-6 months</option>
                          <option value="6-12-months">6-12 months</option>
                          <option value="1-3-years">1-3 years</option>
                          <option value="more-3-years">More than 3 years</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      checked={formData.lowDesire}
                      onChange={(e) => updateFormData('lowDesire', e.target.checked)}
                    />
                    <span className="text-gray-700">I experience low sexual desire or libido</span>
                  </label>
                  
                  {formData.lowDesire && (
                    <div className="mt-4 ml-8">
                      <label className="form-label">How would you describe your desire levels?</label>
                      <select
                        className="form-input"
                        value={formData.desireFrequency}
                        onChange={(e) => updateFormData('desireFrequency', e.target.value)}
                      >
                        <option value="">Select description</option>
                        <option value="occasional">Occasionally lower than I'd like</option>
                        <option value="frequent">Frequently lower than I'd like</option>
                        <option value="rare">Rarely feel desire</option>
                        <option value="none">Almost never feel desire</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Relationship Status</label>
                  <select
                    className="form-input"
                    value={formData.relationshipStatus}
                    onChange={(e) => updateFormData('relationshipStatus', e.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="married">Married</option>
                    <option value="partnered">Long-term partner</option>
                    <option value="dating">Dating</option>
                    <option value="single">Single</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      checked={formData.partnerAware}
                      onChange={(e) => updateFormData('partnerAware', e.target.checked)}
                    />
                    <span className="text-gray-700">My partner is aware I'm seeking this treatment</span>
                  </label>
                </div>
                
                <div>
                  <label className="form-label">Previous treatments tried (if any)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.previousTreatments}
                    onChange={(e) => updateFormData('previousTreatments', e.target.value)}
                    placeholder="List any previous treatments for sexual health concerns..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Contraindication Screening */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Contraindication Screening</h2>
              <p className="text-gray-600 mb-8">Important safety questions to determine your eligibility.</p>
              
              <div className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-red-500 rounded focus:ring-red-500 mt-0.5"
                      checked={formData.doctorAdvisedNoSex}
                      onChange={(e) => updateFormData('doctorAdvisedNoSex', e.target.checked)}
                    />
                    <div>
                      <span className="font-medium text-red-800">Has a doctor ever advised you against sexual activity?</span>
                      <p className="text-sm text-red-600 mt-1">
                        For example, due to heart condition or other health concerns
                      </p>
                    </div>
                  </label>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-red-500 rounded focus:ring-red-500 mt-0.5"
                      checked={formData.severeCardiacCondition}
                      onChange={(e) => updateFormData('severeCardiacCondition', e.target.checked)}
                    />
                    <div>
                      <span className="font-medium text-red-800">Do you have a severe or unstable cardiac condition?</span>
                      <p className="text-sm text-red-600 mt-1">
                        Such as unstable angina, recent heart attack, or severe heart failure
                      </p>
                    </div>
                  </label>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Current Blood Pressure - Systolic (top number) *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.currentBPSystolic ? 'border-red-500' : ''}`}
                      placeholder="e.g., 120"
                      value={formData.currentBPSystolic}
                      onChange={(e) => updateFormData('currentBPSystolic', e.target.value)}
                    />
                    {errors.currentBPSystolic && <p className="form-error">{errors.currentBPSystolic}</p>}
                  </div>
                  <div>
                    <label className="form-label">Current Blood Pressure - Diastolic (bottom number) *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.currentBPDiastolic ? 'border-red-500' : ''}`}
                      placeholder="e.g., 80"
                      value={formData.currentBPDiastolic}
                      onChange={(e) => updateFormData('currentBPDiastolic', e.target.value)}
                    />
                    {errors.currentBPDiastolic && <p className="form-error">{errors.currentBPDiastolic}</p>}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">
                  If you don't know your current blood pressure, please measure it before continuing or enter your most recent reading.
                </p>
                
                <div className="border-t pt-6">
                  <p className="font-medium text-gray-700 mb-4">For individuals who may become pregnant:</p>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                        checked={formData.isPregnant}
                        onChange={(e) => updateFormData('isPregnant', e.target.checked)}
                      />
                      <span className="text-gray-700">I am currently pregnant</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                        checked={formData.isBreastfeeding}
                        onChange={(e) => updateFormData('isBreastfeeding', e.target.checked)}
                      />
                      <span className="text-gray-700">I am currently breastfeeding</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                        checked={formData.tryingToConceive}
                        onChange={(e) => updateFormData('tryingToConceive', e.target.checked)}
                      />
                      <span className="text-gray-700">I am trying to conceive</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: PT-141 Specific */}
          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">PT-141 (Bremelanotide) Screening</h2>
              <p className="text-gray-600 mb-8">Additional questions specific to PT-141 treatment.</p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-purple-900 mb-2">About PT-141</h3>
                <p className="text-sm text-purple-700">
                  PT-141 works on the brain's desire pathways to increase sexual desire. Common side effects may include nausea, flushing, and headache.
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="font-medium text-gray-700">Have you experienced any of the following with previous medications?</p>
                
                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                    checked={formData.nausea}
                    onChange={(e) => updateFormData('nausea', e.target.checked)}
                  />
                  <span className="text-gray-700">Severe nausea with medications</span>
                </label>
                
                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                    checked={formData.flushing}
                    onChange={(e) => updateFormData('flushing', e.target.checked)}
                  />
                  <span className="text-gray-700">Severe flushing reactions</span>
                </label>
                
                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                    checked={formData.headaches}
                    onChange={(e) => updateFormData('headaches', e.target.checked)}
                  />
                  <span className="text-gray-700">Severe headaches or migraines</span>
                </label>
                
                <div className="mt-6">
                  <label className="form-label">Any other conditions relevant to PT-141?</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.pt141Conditions}
                    onChange={(e) => updateFormData('pt141Conditions', e.target.value)}
                    placeholder="Please describe any other relevant conditions..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Oxytocin Specific */}
          {currentStep === 7 && (
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Oxytocin Screening</h2>
              <p className="text-gray-600 mb-8">Additional questions specific to Oxytocin treatment.</p>
              
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-pink-900 mb-2">About Oxytocin</h3>
                <p className="text-sm text-pink-700">
                  Oxytocin is known as the "love hormone" and helps enhance emotional bonding and connection during intimate moments.
                </p>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                    checked={formData.oxytocinAllergy}
                    onChange={(e) => updateFormData('oxytocinAllergy', e.target.checked)}
                  />
                  <span className="text-gray-700">I have a known allergy to oxytocin</span>
                </label>
                
                <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                    checked={formData.uterineConditions}
                    onChange={(e) => updateFormData('uterineConditions', e.target.checked)}
                  />
                  <span className="text-gray-700">I have uterine conditions or have had uterine surgery</span>
                </label>
                
                <div className="mt-6">
                  <label className="form-label">Any other conditions relevant to Oxytocin?</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.oxytocinConditions}
                    onChange={(e) => updateFormData('oxytocinConditions', e.target.value)}
                    placeholder="Please describe any other relevant conditions..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Consent */}
          {currentStep === 8 && (
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Consent & Signature</h2>
              <p className="text-gray-600 mb-8">Please review and agree to the following terms.</p>
              
              <div className="space-y-6">
                <div className="bg-gray-50 border rounded-lg p-4 max-h-48 overflow-y-auto text-sm text-gray-600">
                  <h4 className="font-semibold text-gray-900 mb-2">Informed Consent for Treatment</h4>
                  <p className="mb-2">
                    By submitting this assessment, I acknowledge that:
                  </p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>The information I have provided is accurate and complete to the best of my knowledge.</li>
                    <li>I understand that DuoDesire medications (tadalafil, PT-141, oxytocin) are prescription medications with potential side effects and risks.</li>
                    <li>I have disclosed all relevant medical conditions and medications.</li>
                    <li>I will follow the prescribed dosage and instructions provided by the physician.</li>
                    <li>I will contact a healthcare provider immediately if I experience any adverse reactions.</li>
                    <li>I understand that a licensed physician will review my assessment and may approve or deny treatment based on medical criteria.</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <label className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer ${errors.understandsRisks ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 mt-0.5"
                      checked={formData.understandsRisks}
                      onChange={(e) => updateFormData('understandsRisks', e.target.checked)}
                    />
                    <span className="text-gray-700">I acknowledge that I have read and understand the risks associated with this treatment *</span>
                  </label>
                  {errors.understandsRisks && <p className="form-error ml-8">{errors.understandsRisks}</p>}
                  
                  <label className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer ${errors.agreesToTelehealth ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 mt-0.5"
                      checked={formData.agreesToTelehealth}
                      onChange={(e) => updateFormData('agreesToTelehealth', e.target.checked)}
                    />
                    <span className="text-gray-700">I agree to receive care through telehealth services *</span>
                  </label>
                  {errors.agreesToTelehealth && <p className="form-error ml-8">{errors.agreesToTelehealth}</p>}
                  
                  <label className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer ${errors.agreesToPrivacy ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 mt-0.5"
                      checked={formData.agreesToPrivacy}
                      onChange={(e) => updateFormData('agreesToPrivacy', e.target.checked)}
                    />
                    <span className="text-gray-700">I agree to the Privacy Policy and HIPAA Notice *</span>
                  </label>
                  {errors.agreesToPrivacy && <p className="form-error ml-8">{errors.agreesToPrivacy}</p>}
                </div>
                
                <div className="border-t pt-6">
                  <label className="form-label">Digital Signature *</label>
                  <p className="text-sm text-gray-500 mb-3">Please sign below using your mouse or finger</p>
                  
                  <div className={`signature-pad ${isDrawing ? 'signing' : ''} ${errors.signature ? 'border-red-500' : ''}`}>
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      className="w-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  {errors.signature && <p className="form-error">{errors.signature}</p>}
                  
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear signature
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              className={`btn btn-secondary ${currentStep === 1 ? 'invisible' : ''}`}
            >
              ← Previous
            </button>
            
            {currentStep < STEPS.length ? (
              <button type="button" onClick={nextStep} className="btn btn-primary">
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          <p>© 2024 DuoDesire™. All rights reserved. HIPAA Compliant.</p>
          <p className="mt-1">Your information is encrypted and secure.</p>
        </div>
      </footer>
    </div>
  );
}

