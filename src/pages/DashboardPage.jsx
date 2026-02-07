import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    CreditCard,
    Calendar,
    TrendingUp,
    AlertCircle,
    Clock,
    CheckCircle,
    ArrowRight,
    Download,
    RefreshCw,
    FileText,
    Wallet,
    Activity
} from 'lucide-react';
import { getLoans, getPortfolioImpact } from '../services/api';
import GreenScoreCard from '../components/GreenScoreCard'; // Keep for other uses if needed
import CreditScoreCard from '../components/CreditScoreCard';
import ClimateRiskAlert from '../components/ClimateRiskAlert';
import './DashboardPage.css';

/**
 * DashboardPage Component
 * Unified borrower dashboard with Green Score, climate risks, and loan status
 * Supports role-based views: borrower, lender, regulator
 */
function DashboardPage() {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'borrower';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, [role]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const loansResponse = await getLoans();

            let impactResponse = {};
            try {
                // impactResponse = await getPortfolioImpact('me'); 
            } catch (e) {
                console.warn('Impact fetch failed', e);
            }

            // Transform API data to match component expectations
            const transformedLoans = (loansResponse.loans || []).map(loan => ({
                ...loan,
                id: loan.loanId || loan._id,
                amount: loan.loanAmount || loan.amount || 0,
                projectType: loan.greenObjective || loan.projectType || 'Green Loan',
                status: loan.status,
                disbursedDate: loan.disbursedDate ? new Date(loan.disbursedDate).toLocaleDateString() : 'Pending',
                nextPayment: loan.nextPayment ? new Date(loan.nextPayment).toLocaleDateString() : null,
                nextPaymentAmount: loan.nextPaymentAmount,
                progress: loan.repaymentProgress || loan.progress || 0
            }));

            // Calculate Credit Score based on loan history
            let baseScore = 600;
            let scoreAdditions = 0;
            const breakdown = [];

            // 1. History Length (+10 per loan)
            const loanCount = transformedLoans.length;
            if (loanCount > 0) {
                const points = loanCount * 10;
                baseScore += points;
                scoreAdditions += points;
                breakdown.push({ label: 'Credit History', value: `+${points} pts` });
            }

            // 2. Repayment Progress
            let progressPoints = 0;
            let completedLoans = 0;
            transformedLoans.forEach(loan => {
                if (loan.status === 'completed') {
                    completedLoans++;
                }
                // Add points for progress (max 20 per loan)
                if (loan.progress > 0) {
                    progressPoints += Math.round((loan.progress / 100) * 20);
                }
            });

            if (completedLoans > 0) {
                const completedPoints = completedLoans * 50;
                baseScore += completedPoints;
                scoreAdditions += completedPoints;
                breakdown.push({ label: 'Completed Loans', value: `+${completedPoints} pts` });
            }

            if (progressPoints > 0) {
                baseScore += progressPoints;
                scoreAdditions += progressPoints;
                breakdown.push({ label: 'Repayment Progress', value: `+${progressPoints} pts` });
            }

            // Cap at 900
            const finalCreditScore = Math.min(900, baseScore);

            // Generate climate alerts based on location (mock logic or from loan)
            // In a real app, this would come from the /api/climate/risk endpoint we built
            const climateAlerts = [];
            const latestLoan = transformedLoans.length > 0 ? transformedLoans[0] : null;
            if (latestLoan?.projectLocation) {
                // Simple mock to show alerts based on the location we just added
                const loc = latestLoan.projectLocation.toLowerCase();
                if (loc.includes('rajasthan') || loc.includes('gujarat')) {
                    climateAlerts.push({ type: 'drought', level: 'medium', message: 'Water scarcity risk in region' });
                }
                if (loc.includes('mumbai') || loc.includes('kerala')) {
                    climateAlerts.push({ type: 'flood', level: 'high', message: 'Heavy rainfall/flood risk' });
                }
            }

            setDashboardData({
                loans: transformedLoans,
                summary: loansResponse.summary,
                impact: impactResponse,
                creditScore: finalCreditScore,
                creditBreakdown: breakdown,
                climateAlerts: climateAlerts
            });
        } catch (err) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };


    const getStatusBadge = (status) => {
        const statuses = {
            pending: { label: 'Pending', className: 'warning' },
            approved: { label: 'Approved', className: 'success' },
            disbursed: { label: 'Disbursed', className: 'success' },
            active: { label: 'Active', className: 'info' },
            completed: { label: 'Completed', className: 'neutral' },
            rejected: { label: 'Rejected', className: 'error' },
        };
        return statuses[status] || statuses.pending;
    };

    const getRoleLabel = () => {
        const labels = {
            borrower: 'Borrower Dashboard',
            lender: 'Lender View',
            regulator: 'Regulator View',
        };
        return labels[role] || labels.borrower;
    };

    // Use real data, default to empty structure if loading or null
    // We intentionally removed the hardcoded demoData fallback to show only user's actual loans
    const displayData = dashboardData || {
        creditScore: 600,
        creditBreakdown: [],
        greenScore: 0,
        sustainabilityClass: 'Not Rated',
        reasoning: {},
        climateAlerts: [],
        loans: [],
        summary: {
            totalDisbursed: 0,
            activeLoans: 0,
            totalRepaid: 0,
            upcomingPayment: 0
        }
    };

    const [selectedLoan, setSelectedLoan] = useState(null);

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Page Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>{getRoleLabel()}</h1>
                        <p>Welcome back! Here's your green finance overview.</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-ghost" onClick={fetchDashboardData}>
                            <RefreshCw size={18} />
                            Refresh
                        </button>
                        <Link to="/apply" className="btn btn-primary">
                            New Application
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Role Switcher (Demo) */}
                <div className="role-switcher">
                    <span>View as:</span>
                    <Link
                        to="/dashboard?role=borrower"
                        className={`role-btn ${role === 'borrower' ? 'active' : ''}`}
                    >
                        Borrower
                    </Link>
                    <Link
                        to="/dashboard?role=lender"
                        className={`role-btn ${role === 'lender' ? 'active' : ''}`}
                    >
                        Lender
                    </Link>
                    <Link
                        to="/dashboard?role=regulator"
                        className={`role-btn ${role === 'regulator' ? 'active' : ''}`}
                    >
                        Regulator
                    </Link>
                </div>

                {/* Error State */}
                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button className="btn btn-sm" onClick={fetchDashboardData}>Retry</button>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="dashboard-grid">
                    {/* Left Column */}
                    <div className="dashboard-main">
                        {/* Summary Cards */}
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="card-icon blue">
                                    <Wallet size={24} />
                                </div>
                                <div className="card-content">
                                    <span className="card-label">Total Disbursed</span>
                                    <span className="card-value">
                                        {loading ? (
                                            <div className="skeleton" style={{ width: 100, height: 28 }}></div>
                                        ) : (
                                            `₹${(displayData.summary?.totalDisbursed || 0).toLocaleString()}`
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon green">
                                    <Activity size={24} />
                                </div>
                                <div className="card-content">
                                    <span className="card-label">Active Loans</span>
                                    <span className="card-value">
                                        {loading ? (
                                            <div className="skeleton" style={{ width: 40, height: 28 }}></div>
                                        ) : (
                                            displayData.summary?.activeLoans || 0
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon purple">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="card-content">
                                    <span className="card-label">Total Repaid</span>
                                    <span className="card-value">
                                        {loading ? (
                                            <div className="skeleton" style={{ width: 80, height: 28 }}></div>
                                        ) : (
                                            `₹${(displayData.summary?.totalRepaid || 0).toLocaleString()}`
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="summary-card highlight">
                                <div className="card-icon accent">
                                    <Calendar size={24} />
                                </div>
                                <div className="card-content">
                                    <span className="card-label">Next Payment</span>
                                    <span className="card-value">
                                        {loading ? (
                                            <div className="skeleton" style={{ width: 80, height: 28 }}></div>
                                        ) : (
                                            `₹${(displayData.summary?.upcomingPayment || 0).toLocaleString()}`
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Loans List */}
                        <div className="loans-section">
                            <div className="section-header">
                                <h2>Your Loans</h2>
                                {/* Removed 'View All' link as it was misleading */}
                            </div>

                            {loading ? (
                                <div className="loans-loading">
                                    <div className="skeleton skeleton-card" style={{ height: 120 }}></div>
                                    <div className="skeleton skeleton-card" style={{ height: 120 }}></div>
                                </div>
                            ) : displayData.loans?.length > 0 ? (
                                <div className="loans-list">
                                    {displayData.loans.map((loan) => {
                                        const statusInfo = getStatusBadge(loan.status);
                                        return (
                                            <div key={loan.id} className="loan-card">
                                                <div className="loan-header">
                                                    <div className="loan-info">
                                                        <span className="loan-id">{loan.id}</span>
                                                        <h3>{loan.projectType}</h3>
                                                        <span className="mini-green-score" title="Green Score">
                                                            🌱 {loan.aiScore || 0}/100
                                                        </span>
                                                    </div>
                                                    <span className={`status-badge ${statusInfo.className}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>

                                                <div className="loan-details">
                                                    <div className="detail-item">
                                                        <CreditCard size={16} />
                                                        <span>Amount:</span>
                                                        <strong>₹{loan.amount.toLocaleString()}</strong>
                                                    </div>
                                                    <div className="detail-item">
                                                        <Calendar size={16} />
                                                        <span>Disbursed:</span>
                                                        <strong>{loan.disbursedDate}</strong>
                                                    </div>
                                                    {loan.nextPayment && (
                                                        <div className="detail-item highlight">
                                                            <Clock size={16} />
                                                            <span>Next Payment:</span>
                                                            <strong>{loan.nextPayment} - ₹{loan.nextPaymentAmount?.toLocaleString()}</strong>
                                                        </div>
                                                    )}
                                                </div>

                                                {loan.progress < 100 && (
                                                    <div className="loan-progress">
                                                        <div className="progress-header">
                                                            <span>Repayment Progress</span>
                                                            <span>{loan.progress}%</span>
                                                        </div>
                                                        <div className="progress-bar">
                                                            <div
                                                                className="progress-bar-fill"
                                                                style={{ width: `${loan.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="loan-actions">
                                                    <Link to={`/impact?loan=${loan.id}`} className="btn btn-ghost btn-sm">
                                                        <Activity size={16} />
                                                        View Impact
                                                    </Link>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setSelectedLoan(loan)}
                                                    >
                                                        <FileText size={16} />
                                                        Statement
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <CreditCard size={48} />
                                    <h3>No Loans Yet</h3>
                                    <p>You haven't applied for any green loans. Start your sustainable journey today!</p>
                                    <Link to="/apply" className="btn btn-primary">
                                        Apply for Green Loan
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="dashboard-sidebar">
                        {/* Credit Score */}
                        <CreditScoreCard
                            score={displayData.creditScore}
                            breakdown={displayData.creditBreakdown}
                            loading={loading}
                        />

                        {/* Climate Risk Alerts */}
                        <ClimateRiskAlert
                            alerts={displayData.climateAlerts}
                            loading={loading}
                        />

                        {/* Quick Actions */}
                        <div className="quick-actions card">
                            <h3>Quick Actions</h3>
                            <div className="actions-list">
                                <Link to="/impact" className="action-item">
                                    <Activity size={20} />
                                    <span>View Impact Report</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/audit" className="action-item">
                                    <FileText size={20} />
                                    <span>Audit Trail</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <button className="action-item">
                                    <Download size={20} />
                                    <span>Download Statement</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statement Modal */}
            {selectedLoan && (
                <div className="modal-overlay" onClick={() => setSelectedLoan(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Loan Statement</h2>
                            <button className="btn-close" onClick={() => setSelectedLoan(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="statement-header">
                                <div>
                                    <h3>{selectedLoan.projectType}</h3>
                                    <span className="text-sm text-gray">{selectedLoan.id}</span>
                                </div>
                                <span className={`status-badge ${getStatusBadge(selectedLoan.status).className}`}>
                                    {getStatusBadge(selectedLoan.status).label}
                                </span>
                            </div>

                            <hr className="divider" />

                            <div className="statement-grid">
                                <div className="statement-item">
                                    <label>Principal Amount</label>
                                    <span>₹{selectedLoan.amount.toLocaleString()}</span>
                                </div>
                                <div className="statement-item">
                                    <label>Disbursed Date</label>
                                    <span>{selectedLoan.disbursedDate}</span>
                                </div>
                                <div className="statement-item">
                                    <label>Tenure</label>
                                    <span>{selectedLoan.tenure} months</span>
                                </div>
                                <div className="statement-item">
                                    <label>Interest Rate</label>
                                    <span>8.5% p.a. (Subsidized)</span>
                                </div>
                            </div>

                            <div className="statement-summary">
                                <div className="summary-row">
                                    <span>Total Paid</span>
                                    <span>₹{((selectedLoan.amount * selectedLoan.progress) / 100).toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Outstanding Balance</span>
                                    <span>₹{(selectedLoan.amount - ((selectedLoan.amount * selectedLoan.progress) / 100)).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedLoan(null)}>Close</button>
                            <button className="btn btn-primary">
                                <Download size={16} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;
