import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, LogOut, User } from 'lucide-react';
import { isAuthenticated, logout, getCurrentUser } from '../services/api';
import './Navbar.css';

/**
 * Navbar Component
 * Responsive navigation header with mobile menu support
 */
function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Check auth state on mount and location change
    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, [location]);

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        navigate('/login');
    };

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

                {/* CTA / Auth Buttons */}
                <div className="navbar-actions hide-mobile">
                    {isLoggedIn ? (
                        <button className="btn btn-ghost" onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/signup" className="btn btn-primary">
                                Get Started
                            </Link>
                        </>
                    )}
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
                            {isLoggedIn ? (
                                <button
                                    className="mobile-menu-link"
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                    <Link to="/signup" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
