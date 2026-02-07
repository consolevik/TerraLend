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
import { getUserLoans, getPortfolioImpact } from '../services/api';
import GreenScoreCard from '../components/GreenScoreCard';
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

    // Demo user ID
    const userId = 'demo-user-001';

    useEffect(() => {
        fetchDashboardData();
    }, [role]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [loansResponse, impactResponse] = await Promise.all([
                getUserLoans(userId, role),
                getPortfolioImpact(userId)
            ]);

            setDashboardData({
                loans: loansResponse.loans,
                summary: loansResponse.summary,
                impact: impactResponse,
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

    // Sample data for demonstration
    const demoData = {
        greenScore: 82,
        sustainabilityClass: 'high',
        reasoning: {
            cash_flow: 'stable',
            project_type: 'solar',
            climate_risk: 'low',
            emission_reduction: 'significant'
        },
        climateAlerts: [
            {
                type: 'drought',
                level: 'medium',
                description: 'Moderate drought conditions expected in project region during summer months.',
                recommendation: 'Consider water backup systems for maintenance operations.'
            }
        ],
        loans: [
            {
                id: 'TL-2025-001',
                amount: 1500000,
                projectType: 'Solar Installation',
                status: 'active',
                disbursedDate: '2025-01-15',
                nextPayment: '2025-03-01',
                nextPaymentAmount: 45000,
                progress: 35,
            },
            {
                id: 'TL-2024-042',
                amount: 500000,
                projectType: 'EV Charging Station',
                status: 'completed',
                disbursedDate: '2024-06-20',
                completedDate: '2025-01-20',
                progress: 100,
            }
        ],
        summary: {
            totalDisbursed: 2000000,
            activeLoans: 1,
            totalRepaid: 540000,
            upcomingPayment: 45000,
        }
    };

    const displayData = dashboardData || demoData;

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
                                <Link to="/apply" className="btn btn-ghost btn-sm">
                                    View All
                                </Link>
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
                                                    <button className="btn btn-secondary btn-sm">
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
                        {/* Green Score */}
                        <GreenScoreCard
                            score={displayData.greenScore}
                            classification={displayData.sustainabilityClass}
                            reasoning={displayData.reasoning}
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
        </div>
    );
}

export default DashboardPage;
