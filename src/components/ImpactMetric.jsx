import { useEffect, useRef, useState } from 'react';
import './ImpactMetric.css';

/**
 * ImpactMetric Component
 * Displays a single impact metric with icon and animated counter
 */
function ImpactMetric({
    icon: Icon,
    value,
    unit,
    label,
    description,
    color = 'primary',
    loading = false
}) {
    const [displayValue, setDisplayValue] = useState(0);
    const counterRef = useRef(null);

    // Animate counter on mount
    useEffect(() => {
        if (loading || !value) return;

        const duration = 1500; // ms
        const steps = 60;
        const stepValue = value / steps;
        const stepDuration = duration / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += stepValue;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [value, loading]);

    const formatValue = (val) => {
        if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + 'M';
        }
        if (val >= 1000) {
            return (val / 1000).toFixed(1) + 'k';
        }
        return val.toLocaleString();
    };

    if (loading) {
        return (
            <div className="impact-metric loading">
                <div className="skeleton skeleton-circle" style={{ width: 48, height: 48 }}></div>
                <div className="metric-content">
                    <div className="skeleton skeleton-text" style={{ width: '60%', height: 24 }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '80%', height: 14 }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`impact-metric ${color}`}>
            <div className="metric-icon">
                {Icon && <Icon size={24} />}
            </div>
            <div className="metric-content">
                <div className="metric-value" ref={counterRef}>
                    <span className="value">{formatValue(displayValue)}</span>
                    <span className="unit">{unit}</span>
                </div>
                <div className="metric-label">{label}</div>
                {description && (
                    <div className="metric-description">{description}</div>
                )}
            </div>
        </div>
    );
}

export default ImpactMetric;
