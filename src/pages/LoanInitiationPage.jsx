import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    User,
    Target,
    CreditCard,
    ArrowRight,
    ArrowLeft,
    Check,
    AlertCircle,
    Loader,
    Sun,
    Car,
    Trash2,
    Droplets,
    Sprout,
    Zap,
    RefreshCw,
    Sparkles,
    Info
} from 'lucide-react';
import { submitLoanApplication, fetchGSTData, verifyKYC, register, isAuthenticated, initiateVerification, extractSustainabilityClaim } from '../services/api';
import './LoanInitiationPage.css';

/**
 * LoanInitiationPage Component
 * Multi-step loan application form with GST/KYC auto-fetch simulation
 */
function LoanInitiationPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [gstLoading, setGstLoading] = useState(false);
    const [kycLoading, setKycLoading] = useState(false);
    const [error, setError] = useState(null);
    const [gstVerified, setGstVerified] = useState(false);
    const [kycVerified, setKycVerified] = useState(false);

    // AI Extraction state
    const [aiExtracting, setAiExtracting] = useState(false);
    const [aiExtractedData, setAiExtractedData] = useState(null);
    const [aiConfidence, setAiConfidence] = useState(null);

    const [formData, setFormData] = useState({
        // Step 1: Business Details
        gstNumber: '',
        businessName: '',
        businessType: '',
        annualTurnover: '',
        yearsInBusiness: '',

        // Step 2: KYC Details
        ownerName: '',
        panNumber: '',
        aadhaarNumber: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',

        // Step 3: Green Objective
        greenObjective: '',
        projectDescription: '',
        estimatedSavings: '',
        projectLocation: '',
        latitude: '',
        longitude: '',

        // Step 4: Loan Details
        loanAmount: '',
        tenure: '',
        purpose: '',
    });

    const steps = [
        { id: 1, title: 'Business Details', icon: Building2 },
        { id: 2, title: 'KYC Verification', icon: User },
        { id: 3, title: 'Green Objective', icon: Target },
        { id: 4, title: 'Loan Amount', icon: CreditCard },
    ];

    const greenObjectives = [
        { id: 'solar', label: 'Solar Energy', icon: Sun, description: 'Rooftop or ground-mounted solar installations' },
        { id: 'ev', label: 'Electric Vehicles', icon: Car, description: 'EVs and charging infrastructure' },
        { id: 'waste', label: 'Waste Management', icon: Trash2, description: 'Recycling and waste-to-energy projects' },
        { id: 'water', label: 'Water Conservation', icon: Droplets, description: 'Rainwater harvesting and treatment' },
        { id: 'agriculture', label: 'Sustainable Agriculture', icon: Sprout, description: 'Organic farming and precision agriculture' },
        { id: 'efficiency', label: 'Energy Efficiency', icon: Zap, description: 'Equipment upgrades and green buildings' },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // 1. Strict Numeric Enforcements
        // Allows only digits 0-9. Removes any other character immediately.
        if (['annualTurnover', 'yearsInBusiness', 'estimatedSavings', 'loanAmount', 'pincode', 'phone', 'aadhaarNumber'].includes(name)) {
            newValue = value.replace(/[^0-9]/g, '');
        }

        // 2. Uppercase Enforcement for IDs
        if (['gstNumber', 'panNumber'].includes(name)) {
            newValue = value.toUpperCase();
        }

        // 3. Specific Length Caps (Double check to prevent paste overflow)
        if (name === 'pincode' && newValue.length > 6) newValue = newValue.slice(0, 6);
        if (name === 'panNumber' && newValue.length > 10) newValue = newValue.slice(0, 10);
        if (name === 'aadhaarNumber' && newValue.length > 12) newValue = newValue.slice(0, 12);
        if (name === 'gstNumber' && newValue.length > 15) newValue = newValue.slice(0, 15);
        if (name === 'phone' && newValue.length > 10) newValue = newValue.slice(0, 10);

        setFormData(prev => ({ ...prev, [name]: newValue }));
        setError(null);
    };

    const handleGSTFetch = async () => {
        if (!formData.gstNumber || formData.gstNumber.length !== 15) {
            setError('GST Number must be exactly 15 characters');
            return;
        }

        setGstLoading(true);
        setError(null);

        try {
            const gstData = await fetchGSTData(formData.gstNumber);
            setFormData(prev => ({
                ...prev,
                businessName: gstData.businessName,
                businessType: gstData.businessType,
                annualTurnover: String(gstData.annualTurnover || ''), // Ensure string for input
                address: gstData.address,
                city: gstData.city,
                state: gstData.state,
                pincode: gstData.pincode,
            }));
            setGstVerified(true);
        } catch (err) {
            setError(err.message || 'Failed to fetch GST data. Please try again.');
        } finally {
            setGstLoading(false);
        }
    };

    const handleKYCVerify = async () => {
        if (!formData.panNumber || formData.panNumber.length !== 10) {
            setError('PAN Number must be exactly 10 characters');
            return;
        }
        if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
            setError('Aadhaar Number must be exactly 12 digits');
            return;
        }

        setKycLoading(true);
        setError(null);

        try {
            await verifyKYC({
                panNumber: formData.panNumber,
                aadhaarNumber: formData.aadhaarNumber,
            });
            setKycVerified(true);
        } catch (err) {
            setError(err.message || 'KYC verification failed. Please try again.');
        } finally {
            setKycLoading(false);
        }
    };

    const handleLocationDetect = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
                // Optional: You could call a reverse geocoding API here to fill projectLocation
                setLoading(false);
            },
            (err) => {
                setError('Unable to retrieve your location. Please enter manually.');
                setLoading(false);
            }
        );
    };

    const validateStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.gstNumber || !formData.businessName || !formData.annualTurnover) {
                    setError('Please complete all business details including Annual Turnover');
                    return false;
                }
                return true;
            case 2:
                if (!formData.ownerName || !formData.email || !formData.phone) {
                    setError('Please fill in all required fields');
                    return false;
                }
                return true;
            case 3:
                if (!formData.greenObjective || !formData.estimatedSavings) {
                    setError('Please select a green objective and enter estimated savings');
                    return false;
                }
                return true;
            case 4:
                if (!formData.loanAmount || !formData.tenure) {
                    setError('Please enter loan amount and tenure');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
            setError(null);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError(null);
    };



    // ... (existing code matches until handleSubmit)

    const handleSubmit = async () => {
        console.log('Submit button clicked'); // Debug log
        if (!validateStep()) {
            console.log('Validation failed'); // Debug log
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Check if user is logged in
            if (!isAuthenticated()) {
                console.log('User not authenticated, registering...'); // Debug log
                if (!formData.password) {
                    throw new Error('Password is required to create your account');
                }
                // Register the user first
                await register(formData.email, formData.password);
                console.log('Registration successful'); // Debug log
            }

            console.log('Submitting loan application...', formData); // Debug log
            const response = await submitLoanApplication(formData);
            console.log('Loan submission successful', response); // Debug log

            // Initiate AI Verification
            try {
                console.log('Initiating AI verification...');
                await initiateVerification(response.loanId);
                console.log('Verification initiated successfully');
            } catch (verifyErr) {
                console.error('Verification initiation failed:', verifyErr);
                // Continue to dashboard anyway
            }

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Submission error:', err); // Debug log
            setError(err.message || 'Failed to submit application. Please try again.');
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to error
        } finally {
            setLoading(false);
        }
    };

    const selectGreenObjective = (objectiveId) => {
        setFormData(prev => ({ ...prev, greenObjective: objectiveId }));
        setError(null);
    };

    // AI-assisted extraction of sustainability claim data
    const handleAIExtraction = async () => {
        if (!formData.projectDescription || formData.projectDescription.trim().length < 20) {
            setError('Please enter a more detailed project description (at least 20 characters) for AI extraction.');
            return;
        }

        setAiExtracting(true);
        setError(null);

        try {
            const result = await extractSustainabilityClaim(formData.projectDescription);

            if (result.success && result.extracted_claim) {
                const claim = result.extracted_claim;

                // Map extracted project_type to our greenObjective ids
                let mappedObjective = formData.greenObjective;
                if (claim.project_type) {
                    const typeMap = {
                        'solar': 'solar',
                        'ev': 'ev',
                        'waste': 'waste',
                        'energy_efficiency': 'efficiency',
                        'water': 'water'
                    };
                    mappedObjective = typeMap[claim.project_type] || formData.greenObjective;
                }

                // Store AI extracted data for display
                setAiExtractedData(claim);
                setAiConfidence(result.extraction_confidence);

                // Auto-fill form fields from extracted data
                setFormData(prev => ({
                    ...prev,
                    greenObjective: mappedObjective || prev.greenObjective,
                    // Store extracted fields in formData for submission
                    aiExtractedVendor: claim.vendor,
                    aiExtractedCapacity: claim.capacity_kw,
                    aiExtractedCO2: claim.claimed_impact?.co2_saved_tonnes_per_year,
                    aiExtractedEnergy: claim.claimed_impact?.energy_generated_kwh_per_year,
                    aiExtractedCertifications: claim.certifications,
                }));
            }
        } catch (err) {
            console.error('AI extraction error:', err);
            setError('AI extraction failed. Please fill in the details manually.');
        } finally {
            setAiExtracting(false);
        }
    };

    // Get confidence color for display
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.85) return '#22c55e';
        if (confidence >= 0.6) return '#eab308';
        if (confidence >= 0.4) return '#f97316';
        return '#ef4444';
    };

    return (
        <div className="loan-initiation-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <h1>Apply for Green Loan</h1>
                    <p>Complete your application in just 4 simple steps. Auto-fetch saves you time!</p>
                </div>

                {/* Progress Steps */}
                <div className="steps-progress">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`step-indicator ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                        >
                            <div className="step-circle">
                                {currentStep > step.id ? (
                                    <Check size={18} />
                                ) : (
                                    <step.icon size={18} />
                                )}
                            </div>
                            <span className="step-label">{step.title}</span>
                            {index < steps.length - 1 && <div className="step-line" />}
                        </div>
                    ))}
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form Content */}
                <div className="form-container">
                    {/* Step 1: Business Details */}
                    {currentStep === 1 && (
                        <div className="form-step animate-fade-in">
                            <h2>Business Details</h2>
                            <p className="step-description">
                                Enter your GST number and we'll auto-fetch your business details.
                            </p>

                            <div className="gst-fetch-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">GST Number *</label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        className="form-input"
                                        placeholder="e.g., 27AABCT1332L1ZT"
                                        value={formData.gstNumber}
                                        onChange={handleInputChange}
                                        maxLength={15}
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGSTFetch}
                                    disabled={gstLoading}
                                >
                                    {gstLoading ? <Loader className="spinner" size={18} /> : <RefreshCw size={18} />}
                                    {gstLoading ? 'Fetching...' : 'Auto-Fetch'}
                                </button>
                            </div>

                            {gstVerified && (
                                <div className="auto-filled-notice">
                                    <Check size={16} />
                                    <span>Business details auto-filled from GST records</span>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Business Name *</label>
                                    <input
                                        type="text"
                                        name="businessName"
                                        className="form-input"
                                        value={formData.businessName}
                                        onChange={handleInputChange}
                                        disabled={gstVerified}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Business Type</label>
                                    <select
                                        name="businessType"
                                        className="form-input form-select"
                                        value={formData.businessType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="proprietorship">Proprietorship</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="pvt_ltd">Private Limited</option>
                                        <option value="llp">LLP</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Annual Turnover (₹)</label>
                                    <input
                                        type="text"
                                        name="annualTurnover"
                                        className="form-input"
                                        placeholder="e.g., 50,00,000"
                                        value={formData.annualTurnover}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Years in Business</label>
                                    <input
                                        type="number"
                                        name="yearsInBusiness"
                                        className="form-input"
                                        placeholder="e.g., 5"
                                        value={formData.yearsInBusiness}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: KYC Details */}
                    {currentStep === 2 && (
                        <div className="form-step animate-fade-in">
                            <h2>KYC Verification</h2>
                            <p className="step-description">
                                Complete your identity verification. We'll validate your documents instantly.
                            </p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Owner/Director Name *</label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        className="form-input"
                                        placeholder="As per PAN card"
                                        value={formData.ownerName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="kyc-verify-section">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">PAN Number *</label>
                                        <input
                                            type="text"
                                            name="panNumber"
                                            className="form-input"
                                            placeholder="e.g., ABCDE1234F"
                                            value={formData.panNumber}
                                            onChange={handleInputChange}
                                            maxLength={10}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Aadhaar Number *</label>
                                        <input
                                            type="text"
                                            name="aadhaarNumber"
                                            className="form-input"
                                            placeholder="e.g., 123456789012"
                                            value={formData.aadhaarNumber}
                                            onChange={handleInputChange}
                                            maxLength={12}
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleKYCVerify}
                                    disabled={kycLoading}
                                >
                                    {kycLoading ? <Loader className="spinner" size={18} /> : <Check size={18} />}
                                    {kycLoading ? 'Verifying...' : kycVerified ? 'Verified' : 'Verify KYC'}
                                </button>
                            </div>

                            {kycVerified && (
                                <div className="auto-filled-notice">
                                    <Check size={16} />
                                    <span>KYC verification successful</span>
                                </div>
                            )}


                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="you@company.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Create Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Create a secure password"
                                    value={formData.password || ''}
                                    onChange={handleInputChange}
                                />
                                <p className="form-helper">You'll use this to log in to your dashboard</p>
                            </div>


                            <div className="form-group">
                                <label className="form-label">Business Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-input"
                                    placeholder="Street address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-input"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="form-input"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        className="form-input"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Green Objective */}
                    {currentStep === 3 && (
                        <div className="form-step animate-fade-in">
                            <h2>Select Your Green Objective</h2>
                            <p className="step-description">
                                Choose the type of sustainable project you want to finance.
                            </p>

                            <div className="objectives-grid">
                                {greenObjectives.map((objective) => (
                                    <div
                                        key={objective.id}
                                        className={`objective-card ${formData.greenObjective === objective.id ? 'selected' : ''}`}
                                        onClick={() => selectGreenObjective(objective.id)}
                                    >
                                        <div className="objective-icon">
                                            <objective.icon size={28} />
                                        </div>
                                        <h3>{objective.label}</h3>
                                        <p>{objective.description}</p>
                                        {formData.greenObjective === objective.id && (
                                            <div className="selected-check">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* AI-Assisted Extraction Section */}
                            <div className="ai-extraction-section" style={{ marginTop: 'var(--spacing-6)' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Project Description
                                        <span className="ai-badge" style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '2px 8px', borderRadius: '12px', verticalAlign: 'middle' }}>
                                            <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                            AI-assisted
                                        </span>
                                    </label>
                                    <textarea
                                        name="projectDescription"
                                        className="form-input"
                                        rows={4}
                                        placeholder="Describe your green project in detail... e.g., 'Installing 50kW solar panels from Tata Power Solar on our factory rooftop to generate 75,000 kWh annually and save 40 tonnes of CO2 per year'"
                                        value={formData.projectDescription}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleAIExtraction}
                                        disabled={aiExtracting || !formData.projectDescription}
                                        style={{ marginTop: '0.75rem' }}
                                    >
                                        {aiExtracting ? <Loader className="spinner" size={16} /> : <Sparkles size={16} />}
                                        {aiExtracting ? 'Extracting...' : 'Extract project details (AI-assisted)'}
                                    </button>
                                </div>

                                {/* AI Extraction Results */}
                                {aiExtractedData && aiConfidence && (
                                    <div className="ai-extraction-results" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Sparkles size={18} style={{ color: '#6366f1' }} />
                                                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>AI Extracted Details</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Confidence:</span>
                                                <span style={{
                                                    fontWeight: '600',
                                                    color: getConfidenceColor(aiConfidence.confidence),
                                                    background: `${getConfidenceColor(aiConfidence.confidence)}20`,
                                                    padding: '2px 8px',
                                                    borderRadius: '8px'
                                                }}>
                                                    {Math.round(aiConfidence.confidence * 100)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.9rem' }}>
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)' }}>Project Type:</span>
                                                <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                                                    {aiExtractedData.project_type || '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)' }}>Capacity:</span>
                                                <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                                                    {aiExtractedData.capacity_kw ? `${aiExtractedData.capacity_kw} kW` : '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)' }}>Vendor:</span>
                                                <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                                                    {aiExtractedData.vendor || '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)' }}>CO₂ Saved:</span>
                                                <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                                                    {aiExtractedData.claimed_impact?.co2_saved_tonnes_per_year
                                                        ? `${aiExtractedData.claimed_impact.co2_saved_tonnes_per_year} tonnes/year`
                                                        : '—'}
                                                </span>
                                            </div>
                                            {aiExtractedData.claimed_impact?.energy_generated_kwh_per_year && (
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Energy Generated:</span>
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                                                        {aiExtractedData.claimed_impact.energy_generated_kwh_per_year.toLocaleString()} kWh/year
                                                    </span>
                                                </div>
                                            )}
                                            {aiExtractedData.certifications?.length > 0 && (
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Certifications:</span>
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                                                        {aiExtractedData.certifications.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {aiConfidence.signals?.length > 0 && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>
                                                <Info size={14} style={{ display: 'inline', marginRight: '0.5rem', color: '#eab308', verticalAlign: 'middle' }} />
                                                <span style={{ color: 'var(--text-secondary)' }}>Some fields couldn't be extracted. You can add them manually below.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="form-row" style={{ marginTop: 'var(--spacing-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Estimated Annual Savings (₹)</label>
                                    <input
                                        type="text"
                                        name="estimatedSavings"
                                        className="form-input"
                                        placeholder="e.g., 5,00,000"
                                        value={formData.estimatedSavings}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Project Location</label>
                                    <div className="location-input-group">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleLocationDetect}
                                            style={{ marginBottom: '0.5rem' }}
                                        >
                                            <Target size={16} />
                                            Detect My Location
                                        </button>
                                        <div className="form-row">
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Latitude</label>
                                                <input
                                                    type="text"
                                                    name="latitude"
                                                    className="form-input"
                                                    placeholder="e.g. 19.0760"
                                                    value={formData.latitude}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Longitude</label>
                                                <input
                                                    type="text"
                                                    name="longitude"
                                                    className="form-input"
                                                    placeholder="e.g. 72.8777"
                                                    value={formData.longitude}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            name="projectLocation"
                                            className="form-input"
                                            placeholder="City, State (Optional)"
                                            value={formData.projectLocation}
                                            onChange={handleInputChange}
                                            style={{ marginTop: '0.5rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Loan Amount */}
                    {currentStep === 4 && (
                        <div className="form-step animate-fade-in">
                            <h2>Loan Details</h2>
                            <p className="step-description">
                                Specify your loan requirements. We offer competitive rates for green projects.
                            </p>

                            <div className="loan-amount-input">
                                <label className="form-label">Loan Amount (₹) *</label>
                                <div className="amount-input-wrapper">
                                    <span className="currency">₹</span>
                                    <input
                                        type="text"
                                        name="loanAmount"
                                        className="form-input amount-field"
                                        placeholder="10,00,000"
                                        value={formData.loanAmount}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <p className="form-helper">Min: ₹1,00,000 | Max: ₹5,00,00,000</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Loan Tenure *</label>
                                <div className="tenure-options">
                                    {['12', '24', '36', '48', '60'].map((months) => (
                                        <button
                                            key={months}
                                            type="button"
                                            className={`tenure-option ${formData.tenure === months ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, tenure: months }))}
                                        >
                                            {months} months
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Purpose of Loan</label>
                                <textarea
                                    name="purpose"
                                    className="form-input"
                                    rows={3}
                                    placeholder="How will you use this loan?"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="loan-summary">
                                <h3>Application Summary</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="label">Business</span>
                                        <span className="value">{formData.businessName || '-'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Green Objective</span>
                                        <span className="value">
                                            {greenObjectives.find(o => o.id === formData.greenObjective)?.label || '-'}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Loan Amount</span>
                                        <span className="value">₹{formData.loanAmount || '0'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Tenure</span>
                                        <span className="value">{formData.tenure ? `${formData.tenure} months` : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="form-navigation">
                        {currentStep > 1 && (
                            <button className="btn btn-ghost" onClick={handleBack}>
                                <ArrowLeft size={18} />
                                Back
                            </button>
                        )}

                        <div style={{ flex: 1 }} />

                        {currentStep < 4 ? (
                            <button className="btn btn-primary" onClick={handleNext}>
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                className="btn btn-accent btn-lg"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader className="spinner" size={18} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Application
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoanInitiationPage;
