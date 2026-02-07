import { Link } from 'react-router-dom';
import {
    Leaf,
    Shield,
    BarChart3,
    Zap,
    Globe,
    CheckCircle,
    ArrowRight,
    Sun,
    Car,
    Trash2,
    Droplets,
    Sprout,
    Building2,
    TrendingUp,
    Users,
    Clock,
    FileCheck
} from 'lucide-react';
import './LandingPage.css';

/**
 * LandingPage Component
 * Main entry point showcasing TerraLend's mission and features
 */
function LandingPage() {
    const features = [
        {
            icon: Zap,
            title: 'Fast & Paperless',
            description: 'Apply for green loans in minutes with auto-fetch from GST & KYC APIs. No paperwork, no hassle.',
        },
        {
            icon: Shield,
            title: 'AI Verification',
            description: 'Our AI agents verify sustainability claims, preventing greenwashing with real-time data analysis.',
        },
        {
            icon: BarChart3,
            title: 'Impact Tracking',
            description: 'Track CO₂ saved, energy generated, and community impact with verified, shareable reports.',
        },
        {
            icon: Globe,
            title: 'Climate Aligned',
            description: 'All loans comply with India\'s 2025 Climate Finance Taxonomy for maximum impact.',
        },
    ];

    const greenCategories = [
        { icon: Sun, label: 'Solar Energy', description: 'Rooftop & ground-mounted installations' },
        { icon: Car, label: 'Electric Vehicles', description: 'EVs and charging infrastructure' },
        { icon: Trash2, label: 'Waste Management', description: 'Recycling & waste-to-energy' },
        { icon: Droplets, label: 'Water Conservation', description: 'Rainwater harvesting & treatment' },
        { icon: Sprout, label: 'Sustainable Agriculture', description: 'Organic farming & precision ag' },
        { icon: Building2, label: 'Green Buildings', description: 'Energy-efficient construction' },
    ];

    const stats = [
        { value: '₹500Cr+', label: 'Green Loans Disbursed' },
        { value: '10,000+', label: 'MSMEs Financed' },
        { value: '50,000', label: 'Tons CO₂ Avoided' },
        { value: '24hrs', label: 'Average Approval Time' },
    ];

    const howItWorks = [
        { step: 1, title: 'Apply Online', description: 'Fill a simple form with GST auto-fetch', icon: FileCheck },
        { step: 2, title: 'AI Verification', description: 'Our AI verifies your green credentials', icon: Shield },
        { step: 3, title: 'Get Funded', description: 'Receive funds directly in your account', icon: TrendingUp },
        { step: 4, title: 'Track Impact', description: 'Monitor your environmental impact', icon: BarChart3 },
    ];

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content container">
                    <div className="hero-badge animate-fade-in">
                        <Leaf size={16} />
                        <span>Aligned with India's 2025 Climate Finance Taxonomy</span>
                    </div>

                    <h1 className="hero-title animate-fade-in-up">
                        Green Loans for a <br />
                        <span className="gradient-text">Sustainable Future</span>
                    </h1>

                    <p className="hero-subtitle animate-fade-in-up stagger-1">
                        Easy access to affordable green financing with AI-driven sustainability
                        verification and transparent climate impact tracking for MSMEs across India.
                    </p>

                    <div className="hero-actions animate-fade-in-up stagger-2">
                        <Link to="/apply" className="btn btn-accent btn-lg">
                            Apply for Green Loan
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/impact" className="btn btn-secondary btn-lg">
                            See Our Impact
                        </Link>
                    </div>

                    <div className="hero-trust animate-fade-in-up stagger-3">
                        <div className="trust-item">
                            <CheckCircle size={18} />
                            <span>No Collateral Required</span>
                        </div>
                        <div className="trust-item">
                            <CheckCircle size={18} />
                            <span>Low Interest Rates</span>
                        </div>
                        <div className="trust-item">
                            <CheckCircle size={18} />
                            <span>Quick Approval</span>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="hero-decoration">
                    <div className="floating-leaf leaf-1"><Leaf size={32} /></div>
                    <div className="floating-leaf leaf-2"><Leaf size={24} /></div>
                    <div className="floating-leaf leaf-3"><Leaf size={40} /></div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Why Choose TerraLend?</h2>
                        <p className="section-subtitle">
                            We combine cutting-edge AI technology with deep climate finance expertise
                            to provide the best green lending experience in India.
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Green Categories */}
            <section className="categories-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Financing for Every Green Initiative</h2>
                        <p className="section-subtitle">
                            From solar installations to sustainable agriculture, we support all types of green projects.
                        </p>
                    </div>

                    <div className="categories-grid">
                        {greenCategories.map((category, index) => (
                            <div key={index} className="category-card">
                                <div className="category-icon">
                                    <category.icon size={32} />
                                </div>
                                <h3 className="category-title">{category.label}</h3>
                                <p className="category-description">{category.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Get Your Green Loan in 4 Simple Steps</h2>
                        <p className="section-subtitle">
                            Our streamlined process ensures you get funded quickly with minimal documentation.
                        </p>
                    </div>

                    <div className="steps-grid">
                        {howItWorks.map((item, index) => (
                            <div key={index} className="step-card">
                                <div className="step-number">{item.step}</div>
                                <div className="step-icon">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="step-title">{item.title}</h3>
                                <p className="step-description">{item.description}</p>
                                {index < howItWorks.length - 1 && (
                                    <div className="step-arrow">
                                        <ArrowRight size={24} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section section">
                <div className="container">
                    <div className="cta-box">
                        <div className="cta-content">
                            <h2>Ready to Finance Your Green Future?</h2>
                            <p>Join thousands of MSMEs who have transformed their businesses with sustainable financing.</p>
                        </div>
                        <div className="cta-actions">
                            <Link to="/apply" className="btn btn-accent btn-lg">
                                Apply Now
                                <ArrowRight size={20} />
                            </Link>
                            <div className="cta-contact">
                                <span>Or call us at</span>
                                <a href="tel:+911800123456">1800-123-456</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
