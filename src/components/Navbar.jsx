import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, ChevronDown } from 'lucide-react';
import './Navbar.css';

/**
 * Navbar Component
 * Responsive navigation header with mobile menu support
 */
function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/apply', label: 'Apply for Loan' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/impact', label: 'Impact' },
        { path: '/audit', label: 'Audit Trail' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">
                        <Leaf size={24} />
                    </div>
                    <span className="logo-text">TerraLend</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links hide-mobile">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="navbar-actions hide-mobile">
                    <Link to="/apply" className="btn btn-primary">
                        Get Green Loan
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <div className="mobile-menu-links">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`mobile-menu-link ${isActive(link.path) ? 'active' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <Link
                            to="/apply"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '1rem' }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Get Green Loan
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
