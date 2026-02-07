import './GreenScoreCard.css'; // Reusing styles for consistency

/**
 * CreditScoreCard Component
 * Circular progress visualization for Credit Score (300-900)
 */
function CreditScoreCard({ score, loading = false, breakdown = [] }) {
    // Determine color based on score (300-900 range)
    const getScoreColor = (score) => {
        if (score >= 750) return 'high'; // Excellent
        if (score >= 650) return 'medium'; // Good
        return 'low'; // Needs Improvement
    };

    const getScoreLabel = (score) => {
        if (score >= 750) return 'Excellent';
        if (score >= 650) return 'Good';
        if (score >= 550) return 'Fair';
        return 'Needs Improvement';
    };

    const scoreLevel = getScoreColor(score);
    const circumference = 2 * Math.PI * 54; // radius = 54
    // Scale score to percentage for the circle (300-900 range -> 0-100%)
    // Let's assume 300 is 0% and 900 is 100%
    const percentage = Math.max(0, Math.min(100, ((score - 300) / 600) * 100));
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    if (loading) {
        return (
            <div className="green-score-card loading">
                <div className="score-circle-container">
                    <div className="skeleton skeleton-circle" style={{ width: 140, height: 140 }}></div>
                </div>
                <div className="score-details">
                    <div className="skeleton skeleton-text" style={{ width: '60%', height: 20 }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '80%', height: 16 }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`green-score-card ${scoreLevel}`}>
            <div className="score-circle-container">
                <svg className="score-circle" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                        className="score-circle-bg"
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                        className="score-circle-progress"
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 60 60)"
                    />
                </svg>
                <div className="score-value">
                    <span className="score-number">{score}</span>
                    <span className="score-max">/900</span>
                </div>
            </div>

            <div className="score-details">
                <h3 className="score-title">Credit Score</h3>
                <span className={`score-badge ${scoreLevel}`}>
                    {getScoreLabel(score)}
                </span>

                {breakdown && breakdown.length > 0 && (
                    <div className="score-reasoning">
                        <h4>Score Factors</h4>
                        <ul>
                            {breakdown.map((item, index) => (
                                <li key={index}>
                                    <span className="reasoning-label">{item.label}</span>
                                    <span className="reasoning-value">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreditScoreCard;
