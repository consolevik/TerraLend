import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';
import './Footer.css';

/**
 * Footer Component
 * Site-wide footer with links, contact info, and compliance badges
 */
function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <div className="logo-icon">
                                <Leaf size={20} />
                            </div>
                            <span>TerraLend</span>
                        </Link>
                        <p className="footer-tagline">
                            Empowering sustainable growth with AI-verified green financing.
                            Aligned with India's 2025 Climate Finance Taxonomy.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="social-link" aria-label="GitHub">
                                <Github size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links-group">
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/apply">Apply for Loan</Link></li>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/impact">Impact Tracking</Link></li>
                            <li><Link to="/audit">Audit Trail</Link></li>
                        </ul>
                    </div>

                    {/* Green Objectives */}
                    <div className="footer-links-group">
                        <h4 className="footer-title">Green Categories</h4>
                        <ul className="footer-links">
                            <li><a href="#">Solar Energy</a></li>
                            <li><a href="#">Electric Vehicles</a></li>
                            <li><a href="#">Waste Management</a></li>
                            <li><a href="#">Water Conservation</a></li>
                            <li><a href="#">Sustainable Agriculture</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-links-group">
                        <h4 className="footer-title">Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <Mail size={16} />
                                <a href="mailto:contact@terralend.in">contact@terralend.in</a>
                            </li>
                            <li>
                                <Phone size={16} />
                                <a href="tel:+911800123456">1800-123-456</a>
                            </li>
                            <li>
                                <MapPin size={16} />
                                <span>Mumbai, Maharashtra, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Compliance Badges */}
                <div className="footer-compliance">
                    <div className="compliance-badges">
                        <span className="compliance-badge">RBI Registered</span>
                        <span className="compliance-badge">ISO 27001</span>
                        <span className="compliance-badge">Climate Finance Taxonomy 2025</span>
                        <span className="compliance-badge">GDPR Compliant</span>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p>&copy; {currentYear} TerraLend. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
