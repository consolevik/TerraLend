import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Shield,
    Leaf,
    AlertTriangle,
    TrendingUp,
    CheckCircle,
    Loader,
    ArrowRight,
    Clock,
    Database
} from 'lucide-react';
import { initiateVerification, getVerificationStatus } from '../services/api';
import GreenScoreCard from '../components/GreenScoreCard';
import './AIVerificationPage.css';

/**
 * AIVerificationPage Component
 * Displays AI verification progress with animated status indicators
 * Shows Green Score calculation and greenwashing check results
 */
function AIVerificationPage() {
    const { loanId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [currentAgent, setCurrentAgent] = useState(0);

    const aiAgents = [
        {
            id: 'green_scoring',
            name: 'Green Scoring Agent',
            description: 'Analyzing sustainability metrics and emission benchmarks',
            icon: Leaf,
        },
        {
            id: 'greenwashing',
            name: 'Greenwashing Prevention Agent',
            description: 'Cross-verifying claims with MNRE, BEE, and GRI databases',
            icon: Shield,
        },
        {
            id: 'climate_risk',
            name: 'Climate Risk Agent',
            description: 'Assessing climate risks and operational stability',
            icon: AlertTriangle,
        },
        {
            id: 'credit_analysis',
            name: 'Credit Analysis Agent',
            description: 'Evaluating cash-flow patterns and repayment capacity',
            icon: TrendingUp,
        },
    ];

    useEffect(() => {
        startVerification();
    }, [loanId]);

    // Simulate agent progression
    useEffect(() => {
        if (loading && currentAgent < aiAgents.length) {
            const timer = setTimeout(() => {
                setCurrentAgent(prev => prev + 1);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentAgent, loading]);

    const startVerification = async () => {
        try {
            // Start verification process
            await initiateVerification(loanId);

            // Poll for status (in demo, we simulate this)
            const pollStatus = async () => {
                try {
                    const status = await getVerificationStatus(loanId);

                    if (status.completed) {
                        setVerificationData(status);
                        setLoading(false);
                    } else {
                        // Poll again after delay
                        setTimeout(pollStatus, 2000);
                    }
                } catch (err) {
                    setError(err.message);
                    setLoading(false);
                }
            };

            // Wait for agent animations, then get final status
            setTimeout(pollStatus, 8000);

        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
            setLoading(false);
        }
    };

    const getAgentStatus = (index) => {
        if (index < currentAgent) return 'completed';
        if (index === currentAgent && loading) return 'active';
        return 'pending';
    };

    const handleContinue = () => {
        navigate('/dashboard');
    };

    return (
        <div className="verification-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header text-center">
                    <div className="header-icon">
                        <Shield size={32} />
                    </div>
                    <h1>AI-Powered Verification</h1>
                    <p>
                        Our AI agents are analyzing your project for sustainability compliance
                        and calculating your Green Score.
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="alert alert-error" style={{ maxWidth: 600, margin: '0 auto var(--spacing-6)' }}>
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Main Content */}
                <div className="verification-content">
                    {/* Left: AI Agents Progress */}
                    <div className="agents-panel">
                        <div className="panel-header">
                            <h2>Verification Agents</h2>
                            <span className="status-badge">
                                {loading ? (
                                    <>
                                        <Loader className="spinner" size={14} />
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={14} />
                                        Complete
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="agents-list">
                            {aiAgents.map((agent, index) => {
                                const status = getAgentStatus(index);
                                const Icon = agent.icon;

                                return (
                                    <div key={agent.id} className={`agent-item ${status}`}>
                                        <div className="agent-icon">
                                            {status === 'completed' ? (
                                                <CheckCircle size={20} />
                                            ) : status === 'active' ? (
                                                <Loader className="spinner" size={20} />
                                            ) : (
                                                <Icon size={20} />
                                            )}
                                        </div>
                                        <div className="agent-content">
                                            <h3>{agent.name}</h3>
                                            <p>{agent.description}</p>
                                        </div>
                                        <div className="agent-status">
                                            {status === 'completed' && <span className="badge-success">Done</span>}
                                            {status === 'active' && <span className="badge-active">Running</span>}
                                            {status === 'pending' && <span className="badge-pending">Pending</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Blockchain Record */}
                        <div className="blockchain-notice">
                            <Database size={18} />
                            <div>
                                <strong>Blockchain Record</strong>
                                <p>All verification results are immutably recorded on-chain</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="results-panel">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-animation">
                                    <div className="pulse-ring"></div>
                                    <Leaf size={48} />
                                </div>
                                <h3>Calculating Green Score</h3>
                                <p>This usually takes about 30 seconds...</p>

                                <div className="loading-facts">
                                    <Clock size={16} />
                                    <span>Did you know? Our AI has prevented over ₹50 Cr in greenwashing loans.</span>
                                </div>
                            </div>
                        ) : verificationData ? (
                            <div className="results-content animate-scale-in">
                                <h2>Verification Complete!</h2>

                                <GreenScoreCard
                                    score={verificationData.greenScore}
                                    classification={verificationData.sustainabilityClass}
                                    reasoning={verificationData.reasoning}
                                />

                                {/* Greenwashing Check */}
                                <div className="verification-result">
                                    <div className="result-header">
                                        <Shield size={20} />
                                        <h3>Greenwashing Check</h3>
                                    </div>
                                    <div className={`result-status ${verificationData.greenwashingCheck?.passed ? 'passed' : 'flagged'}`}>
                                        {verificationData.greenwashingCheck?.passed ? (
                                            <>
                                                <CheckCircle size={24} />
                                                <span>Passed - No inconsistencies detected</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle size={24} />
                                                <span>Flagged for review</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="confidence-score">
                                        <span>Authenticity Confidence Score</span>
                                        <strong>{verificationData.greenwashingCheck?.confidenceScore || 95}%</strong>
                                    </div>
                                </div>

                                {/* Climate Risk Summary */}
                                <div className="verification-result">
                                    <div className="result-header">
                                        <AlertTriangle size={20} />
                                        <h3>Climate Risk Assessment</h3>
                                    </div>
                                    <div className={`risk-level ${verificationData.climateRisk?.level || 'low'}`}>
                                        <span className="risk-label">Risk Level:</span>
                                        <span className="risk-value">{verificationData.climateRisk?.level || 'Low'}</span>
                                    </div>
                                    {verificationData.climateRisk?.notes && (
                                        <p className="risk-notes">{verificationData.climateRisk.notes}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="results-actions">
                                    <button className="btn btn-primary btn-lg" onClick={handleContinue}>
                                        Continue to Dashboard
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIVerificationPage;
