import { AlertTriangle, CloudRain, Thermometer, Waves, Wind } from 'lucide-react';
import './ClimateRiskAlert.css';

/**
 * ClimateRiskAlert Component
 * Displays climate risk warnings and alerts for loan projects
 */
function ClimateRiskAlert({ alerts = [], loading = false }) {
    const getRiskIcon = (type) => {
        const icons = {
            drought: Thermometer,
            flood: Waves,
            storm: Wind,
            heatwave: Thermometer,
            cyclone: CloudRain,
            default: AlertTriangle,
        };
        const Icon = icons[type] || icons.default;
        return <Icon size={18} />;
    };

    const getRiskLevel = (level) => {
        const levels = {
            high: { label: 'High Risk', className: 'high' },
            medium: { label: 'Medium Risk', className: 'medium' },
            low: { label: 'Low Risk', className: 'low' },
        };
        return levels[level] || levels.low;
    };

    if (loading) {
        return (
            <div className="climate-risk-panel loading">
                <div className="skeleton skeleton-title" style={{ width: '50%' }}></div>
                <div className="skeleton skeleton-card" style={{ height: 80 }}></div>
                <div className="skeleton skeleton-card" style={{ height: 80 }}></div>
            </div>
        );
    }

    if (!alerts || alerts.length === 0) {
        return (
            <div className="climate-risk-panel empty">
                <div className="empty-state">
                    <div className="empty-icon success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h3>No Active Climate Risks</h3>
                    <p>Your project location has no significant climate alerts at this time.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="climate-risk-panel">
            <div className="panel-header">
                <h3>
                    <AlertTriangle size={20} />
                    Climate Risk Alerts
                </h3>
                <span className="alert-count">{alerts.length} Active</span>
            </div>

            <div className="alerts-list">
                {alerts.map((alert, index) => {
                    const riskInfo = getRiskLevel(alert.level);
                    return (
                        <div
                            key={index}
                            className={`alert-item ${riskInfo.className}`}
                        >
                            <div className="alert-icon">
                                {getRiskIcon(alert.type)}
                            </div>
                            <div className="alert-content">
                                <div className="alert-header">
                                    <span className="alert-type">{alert.type}</span>
                                    <span className={`alert-level ${riskInfo.className}`}>
                                        {riskInfo.label}
                                    </span>
                                </div>
                                <p className="alert-description">{alert.description}</p>
                                {alert.recommendation && (
                                    <p className="alert-recommendation">
                                        <strong>Recommendation:</strong> {alert.recommendation}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ClimateRiskAlert;
