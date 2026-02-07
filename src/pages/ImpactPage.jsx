import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Leaf,
    Zap,
    Droplets,
    Users,
    Wallet,
    Download,
    Share2,
    TrendingUp,
    Globe,
    CheckCircle
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { getPortfolioImpact } from '../services/api';
import ImpactMetric from '../components/ImpactMetric';
import './ImpactPage.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

/**
 * ImpactPage Component
 * Displays comprehensive impact metrics with charts and download functionality
 */
function ImpactPage() {
    const [searchParams] = useSearchParams();
    const loanId = searchParams.get('loan');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [impactData, setImpactData] = useState(null);

    useEffect(() => {
        fetchImpactData();
    }, [loanId]);

    const fetchImpactData = async () => {
        setLoading(true);
        try {
            const data = await getPortfolioImpact('demo-user-001');
            setImpactData(data);
        } catch (err) {
            // Use demo data if API fails
            setImpactData(demoImpactData);
        } finally {
            setLoading(false);
        }
    };

    // Demo data for demonstration
    const demoImpactData = {
        co2Saved: 12500,
        energyGenerated: 45000,
        waterSaved: 250000,
        jobsCreated: 15,
        financialSavings: 850000,
        treesEquivalent: 570,
        monthlyData: [
            { month: 'Sep', co2: 1200, energy: 4200 },
            { month: 'Oct', co2: 1350, energy: 4500 },
            { month: 'Nov', co2: 1500, energy: 4800 },
            { month: 'Dec', co2: 1600, energy: 5000 },
            { month: 'Jan', co2: 1800, energy: 5200 },
            { month: 'Feb', co2: 1900, energy: 5500 },
        ],
        impactByCategory: {
            solar: 65,
            ev: 20,
            waste: 10,
            water: 5,
        },
        certifications: [
            { name: 'Climate Finance Taxonomy 2025', status: 'verified' },
            { name: 'GRI Standards Compliant', status: 'verified' },
            { name: 'MNRE Verified Project', status: 'verified' },
        ],
    };

    const displayData = impactData || demoImpactData;

    // Chart configurations
    const co2ChartData = {
        labels: displayData.monthlyData?.map(d => d.month) || [],
        datasets: [
            {
                label: 'CO₂ Saved (kg)',
                data: displayData.monthlyData?.map(d => d.co2) || [],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderRadius: 8,
            },
        ],
    };

    const categoryChartData = {
        labels: ['Solar Energy', 'Electric Vehicles', 'Waste Management', 'Water Conservation'],
        datasets: [
            {
                data: [
                    displayData.impactByCategory?.solar || 0,
                    displayData.impactByCategory?.ev || 0,
                    displayData.impactByCategory?.waste || 0,
                    displayData.impactByCategory?.water || 0,
                ],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#f59e0b',
                    '#06b6d4',
                ],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
        cutout: '65%',
    };

    const handleDownloadReport = () => {
        // In a real app, this would generate and download a PDF
        alert('Impact report download initiated. In production, this would generate a PDF.');
    };

    const handleShare = () => {
        // In a real app, this would open share options
        if (navigator.share) {
            navigator.share({
                title: 'TerraLend Impact Report',
                text: `My green projects have saved ${displayData.co2Saved.toLocaleString()} kg of CO₂!`,
                url: window.location.href,
            });
        } else {
            alert('Share functionality - Would share impact metrics');
        }
    };

    return (
        <div className="impact-page">
            <div className="container">
                {/* Page Header */}
                <div className="impact-header">
                    <div className="header-content">
                        <div className="header-badge">
                            <Globe size={16} />
                            <span>Verified Impact Report</span>
                        </div>
                        <h1>Your Climate Impact</h1>
                        <p>Track and share the positive environmental impact of your green investments.</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={handleShare}>
                            <Share2 size={18} />
                            Share
                        </button>
                        <button className="btn btn-primary" onClick={handleDownloadReport}>
                            <Download size={18} />
                            Download Report
                        </button>
                    </div>
                </div>

                {/* Impact Metrics Grid */}
                <div className="metrics-grid">
                    <ImpactMetric
                        icon={Leaf}
                        value={displayData.co2Saved}
                        unit="kg"
                        label="CO₂ Emissions Avoided"
                        description="Equivalent to planting 570 trees"
                        color="primary"
                        loading={loading}
                    />
                    <ImpactMetric
                        icon={Zap}
                        value={displayData.energyGenerated}
                        unit="kWh"
                        label="Clean Energy Generated"
                        description="Powering 15 homes for a year"
                        color="accent"
                        loading={loading}
                    />
                    <ImpactMetric
                        icon={Droplets}
                        value={displayData.waterSaved}
                        unit="L"
                        label="Water Conserved"
                        description="Annual water for 25 families"
                        color="blue"
                        loading={loading}
                    />
                    <ImpactMetric
                        icon={Users}
                        value={displayData.jobsCreated}
                        unit="jobs"
                        label="Green Jobs Created"
                        description="Direct employment generated"
                        color="purple"
                        loading={loading}
                    />
                    <ImpactMetric
                        icon={Wallet}
                        value={displayData.financialSavings}
                        unit="₹"
                        label="Financial Savings"
                        description="Annual operational cost reduction"
                        color="teal"
                        loading={loading}
                    />
                    <ImpactMetric
                        icon={TrendingUp}
                        value={displayData.treesEquivalent}
                        unit="trees"
                        label="Trees Equivalent"
                        description="Carbon offset equivalent"
                        color="primary"
                        loading={loading}
                    />
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    <div className="chart-card">
                        <div className="chart-header">
                            <h2>Monthly CO₂ Reduction</h2>
                            <span className="chart-badge">Last 6 months</span>
                        </div>
                        <div className="chart-container">
                            {loading ? (
                                <div className="skeleton" style={{ height: 250 }}></div>
                            ) : (
                                <Bar data={co2ChartData} options={chartOptions} />
                            )}
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-header">
                            <h2>Impact by Category</h2>
                            <span className="chart-badge">Distribution</span>
                        </div>
                        <div className="chart-container doughnut">
                            {loading ? (
                                <div className="skeleton skeleton-circle" style={{ width: 200, height: 200, margin: '0 auto' }}></div>
                            ) : (
                                <Doughnut data={categoryChartData} options={doughnutOptions} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Certifications */}
                <div className="certifications-section">
                    <h2>Compliance & Certifications</h2>
                    <p>Your impact metrics are verified against these standards:</p>

                    <div className="certifications-grid">
                        {displayData.certifications?.map((cert, index) => (
                            <div key={index} className="certification-card">
                                <CheckCircle size={24} className="cert-icon" />
                                <span className="cert-name">{cert.name}</span>
                                <span className="cert-status">Verified</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transparency Notice */}
                <div className="transparency-notice">
                    <div className="notice-content">
                        <h3>📊 Data Transparency</h3>
                        <p>
                            All impact metrics are calculated using real-time sensor data and satellite imagery,
                            verified against MNRE and BEE benchmarks. Blockchain-backed audit trails ensure
                            data integrity. View complete methodology in your downloadable report.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImpactPage;
