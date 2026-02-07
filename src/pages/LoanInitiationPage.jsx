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
    RefreshCw
} from 'lucide-react';
import { submitLoanApplication, fetchGSTData, verifyKYC } from '../services/api';
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
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleGSTFetch = async () => {
        if (!formData.gstNumber || formData.gstNumber.length < 15) {
            setError('Please enter a valid 15-character GST number');
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
                annualTurnover: gstData.annualTurnover,
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
        if (!formData.panNumber || !formData.aadhaarNumber) {
            setError('Please enter PAN and Aadhaar numbers');
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

    const validateStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.gstNumber || !formData.businessName) {
                    setError('Please complete GST verification');
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
                if (!formData.greenObjective) {
                    setError('Please select a green objective');
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

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await submitLoanApplication(formData);
            // Navigate to verification page with loan ID
            navigate(`/verification/${response.loanId}`);
        } catch (err) {
            setError(err.message || 'Failed to submit application. Please try again.');
            setLoading(false);
        }
    };

    const selectGreenObjective = (objectiveId) => {
        setFormData(prev => ({ ...prev, greenObjective: objectiveId }));
        setError(null);
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
                                            placeholder="e.g., 1234 5678 9012"
                                            value={formData.aadhaarNumber}
                                            onChange={handleInputChange}
                                            maxLength={14}
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

                            <div className="form-group" style={{ marginTop: 'var(--spacing-6)' }}>
                                <label className="form-label">Project Description</label>
                                <textarea
                                    name="projectDescription"
                                    className="form-input"
                                    rows={4}
                                    placeholder="Describe your green project in detail..."
                                    value={formData.projectDescription}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-row">
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
                                    <input
                                        type="text"
                                        name="projectLocation"
                                        className="form-input"
                                        placeholder="City, State"
                                        value={formData.projectLocation}
                                        onChange={handleInputChange}
                                    />
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
