import './GreenScoreCard.css';

/**
 * GreenScoreCard Component
 * Circular progress visualization for Green Score (0-100)
 * Color-coded based on sustainability rating
 */
function GreenScoreCard({ score, classification, loading = false, reasoning = null }) {
    // Determine color based on score
    const getScoreColor = (score) => {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    };

    const getClassLabel = (classification) => {
        const labels = {
            high: 'High Impact',
            medium: 'Medium Impact',
            low: 'Low Impact',
        };
        return labels[classification] || classification || 'Calculating...';
    };

    const scoreLevel = getScoreColor(score);
    const circumference = 2 * Math.PI * 54; // radius = 54
    const strokeDashoffset = circumference - (score / 100) * circumference;

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
                    <span className="score-max">/100</span>
                </div>
            </div>

            <div className="score-details">
                <h3 className="score-title">Green Score</h3>
                <span className={`score-badge ${scoreLevel}`}>
                    {getClassLabel(classification)}
                </span>

                {reasoning && (
                    <div className="score-reasoning">
                        <h4>Score Breakdown</h4>
                        <ul>
                            {Object.entries(reasoning).map(([key, value]) => (
                                <li key={key}>
                                    <span className="reasoning-label">{key.replace(/_/g, ' ')}</span>
                                    <span className="reasoning-value">{value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GreenScoreCard;
