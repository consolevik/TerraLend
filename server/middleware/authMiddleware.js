/**
 * Authentication Middleware
 * 
 * Protects routes by verifying JWT tokens.
 * Attaches user to request object for downstream handlers.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { getLocalUserById } from '../services/store.js';

export const protect = async (req, res, next) => {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token provided'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        if (isDbConnected()) {
            req.user = await User.findById(decoded.id).select('-password');
        } else {
            // In-memory fallback
            const localUser = getLocalUserById(decoded.id);
            if (localUser) {
                // Clone and remove password
                const { password, ...userWithoutPassword } = localUser;
                req.user = { ...userWithoutPassword, id: localUser._id };
            }
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        next();
    } catch (error) {
        console.error('[Auth] Token verification failed:', error.message);
        return res.status(401).json({
            success: false,
            error: 'Not authorized, token invalid'
        });
    }
};

// Admin-only middleware
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Admin only.'
        });
    }
};

export default { protect, adminOnly };
