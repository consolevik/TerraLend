import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

/**
 * RequireAuth Component
 * Protects routes from unauthenticated access.
 * Redirects to /login if user is not logged in.
 */
const RequireAuth = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated()) {
            // Redirect to login, but save the location they were trying to go to
            navigate('/login', { state: { from: location }, replace: true });
        }
    }, [navigate, location]);

    if (!isAuthenticated()) {
        return null; // Or a loading spinner
    }

    return children;
};

export default RequireAuth;
