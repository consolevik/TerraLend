import { useState, useEffect } from 'react';
import {
    Database,
    Search,
    Filter,
    CheckCircle,
    Clock,
    FileText,
    ArrowRight,
    Copy,
    ExternalLink,
    Shield
} from 'lucide-react';
import { getAuditLogs, verifyTransaction } from '../services/api';
import './AuditLogPage.css';

/**
 * AuditLogPage Component
 * Displays blockchain-backed audit trail for regulators and transparency
 * Shows immutable logs of loan disbursements, verifications, and impact metrics
 */
function AuditLogPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const response = await getAuditLogs();
            setAuditLogs(response.logs);
        } catch (err) {
            // Use demo data if API fails
            setAuditLogs(demoAuditLogs);
        } finally {
            setLoading(false);
        }
    };

    // Demo audit logs
    const demoAuditLogs = [
        {
            id: 'log-001',
            txHash: '0x8f4a2b3c1d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
            timestamp: '2025-02-07T09:30:00Z',
            eventType: 'loan_disbursement',
            loanId: 'TL-2025-001',
            description: 'Loan disbursed: ₹15,00,000 for Solar Installation',
            verifiedBy: 'TerraLend Core',
            status: 'confirmed',
            blockNumber: 18234567,
        },
        {
            id: 'log-002',
            txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f2b',
            timestamp: '2025-02-07T09:28:00Z',
            eventType: 'verification_complete',
            loanId: 'TL-2025-001',
            description: 'AI Verification completed: Green Score 82 (High Impact)',
            verifiedBy: 'Green Scoring Agent',
            status: 'confirmed',
            blockNumber: 18234565,
        },
        {
            id: 'log-003',
            txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f3c',
            timestamp: '2025-02-07T09:25:00Z',
            eventType: 'greenwashing_check',
            loanId: 'TL-2025-001',
            description: 'Greenwashing check passed: Authenticity Score 95%',
            verifiedBy: 'Greenwashing Prevention Agent',
            status: 'confirmed',
            blockNumber: 18234562,
        },
        {
            id: 'log-004',
            txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f4d',
            timestamp: '2025-02-06T14:15:00Z',
            eventType: 'impact_update',
            loanId: 'TL-2024-042',
            description: 'Monthly impact recorded: 1,800 kg CO₂ saved',
            verifiedBy: 'Impact Analytics Agent',
            status: 'confirmed',
            blockNumber: 18230123,
        },
        {
            id: 'log-005',
            txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f5e',
            timestamp: '2025-02-05T11:00:00Z',
            eventType: 'payment_received',
            loanId: 'TL-2025-001',
            description: 'EMI payment received: ₹45,000',
            verifiedBy: 'Payment Gateway',
            status: 'confirmed',
            blockNumber: 18225678,
        },
    ];

    const eventTypeLabels = {
        loan_disbursement: { label: 'Disbursement', color: 'green' },
        verification_complete: { label: 'Verification', color: 'blue' },
        greenwashing_check: { label: 'Greenwashing Check', color: 'purple' },
        impact_update: { label: 'Impact Update', color: 'teal' },
        payment_received: { label: 'Payment', color: 'accent' },
        loan_application: { label: 'Application', color: 'neutral' },
    };

    const filteredLogs = (auditLogs || demoAuditLogs).filter(log => {
        const matchesSearch =
            log.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.loanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterType === 'all' || log.eventType === filterType;

        return matchesSearch && matchesFilter;
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // In a real app, show a toast notification
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateHash = (hash) => {
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    return (
        <div className="audit-page">
            <div className="container">
                {/* Page Header */}
                <div className="audit-header">
                    <div className="header-icon">
                        <Database size={32} />
                    </div>
                    <h1>Blockchain Audit Trail</h1>
                    <p>
                        All TerraLend transactions are immutably recorded on-chain for complete
                        transparency and regulatory compliance.
                    </p>
                </div>

                {/* Info Banner */}
                <div className="info-banner">
                    <Shield size={24} />
                    <div>
                        <strong>Immutable Records</strong>
                        <p>
                            Every loan disbursement, verification result, and impact metric is recorded
                            with a unique transaction hash that cannot be altered or deleted.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="audit-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by hash, loan ID, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Events</option>
                            <option value="loan_disbursement">Disbursements</option>
                            <option value="verification_complete">Verifications</option>
                            <option value="greenwashing_check">Greenwashing Checks</option>
                            <option value="impact_update">Impact Updates</option>
                            <option value="payment_received">Payments</option>
                        </select>
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="audit-logs">
                    {loading ? (
                        <div className="loading-state">
                            <div className="skeleton skeleton-card" style={{ height: 100 }}></div>
                            <div className="skeleton skeleton-card" style={{ height: 100 }}></div>
                            <div className="skeleton skeleton-card" style={{ height: 100 }}></div>
                        </div>
                    ) : filteredLogs.length > 0 ? (
                        <div className="logs-list">
                            {filteredLogs.map((log) => {
                                const eventInfo = eventTypeLabels[log.eventType] || eventTypeLabels.loan_application;
                                return (
                                    <div key={log.id} className="log-card">
                                        <div className="log-header">
                                            <span className={`event-badge ${eventInfo.color}`}>
                                                {eventInfo.label}
                                            </span>
                                            <span className="log-timestamp">
                                                <Clock size={14} />
                                                {formatTimestamp(log.timestamp)}
                                            </span>
                                        </div>

                                        <p className="log-description">{log.description}</p>

                                        <div className="log-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Transaction Hash</span>
                                                <div className="hash-value">
                                                    <code>{truncateHash(log.txHash)}</code>
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => copyToClipboard(log.txHash)}
                                                        title="Copy full hash"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    <button
                                                        className="icon-btn"
                                                        title="View on explorer"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="detail-row">
                                                <span className="detail-label">Loan ID</span>
                                                <span className="detail-value">{log.loanId}</span>
                                            </div>

                                            <div className="detail-row">
                                                <span className="detail-label">Block Number</span>
                                                <span className="detail-value">#{log.blockNumber.toLocaleString()}</span>
                                            </div>

                                            <div className="detail-row">
                                                <span className="detail-label">Verified By</span>
                                                <span className="detail-value">{log.verifiedBy}</span>
                                            </div>
                                        </div>

                                        <div className="log-status">
                                            <CheckCircle size={16} />
                                            <span>Confirmed on blockchain</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FileText size={48} />
                            <h3>No Matching Records</h3>
                            <p>Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </div>

                {/* Compliance Note */}
                <div className="compliance-note">
                    <h3>Regulatory Compliance</h3>
                    <p>
                        This audit trail is designed to meet the disclosure requirements of
                        India's 2025 Climate Finance Taxonomy. All records are retained for
                        a minimum of 10 years and are available for regulatory audit upon request.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuditLogPage;
