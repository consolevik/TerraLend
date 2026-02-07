/**
 * Authentication Routes
 * 
 * Handles user registration, login, and profile access.
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { isDbConnected } from '../config/db.js';
import { localUsers } from '../services/store.js';

const router = express.Router();


// Generate JWT token
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'dev_secret_fallback_123';
    return jwt.sign({ id }, secret, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    console.log('[Auth] Register request received');
    try {
        const { email, password, role } = req.body;
        console.log('[Auth] Processing registration for:', email);

        if (isDbConnected()) {
            console.log('[Auth] Using MongoDB');
            // MongoDB Logic
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ success: false, error: 'User already exists' });
            }

            const user = await User.create({ email, password, role: role || 'user' });
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                token,
                user: { id: user._id, email: user.email, role: user.role }
            });
        } else {
            console.log('[Auth] Using In-Memory Store');
            // In-Memory Logic
            if (localUsers.find(u => u.email === email)) {
                return res.status(400).json({ success: false, error: 'User already exists' });
            }

            const newUser = {
                _id: 'local_' + Date.now(),
                email,
                password, // Note: storing plain text in memory for demo only
                role: role || 'user',
                matchPassword: function (enteredPassword) { return enteredPassword === this.password; }
            };

            console.log('[Auth] Pushing to localUsers');
            localUsers.push(newUser);

            console.log('[Auth] Generating token');
            const token = generateToken(newUser._id);

            console.log('[Auth] Sending response');
            res.status(201).json({
                success: true,
                token,
                user: { id: newUser._id, email: newUser.email, role: newUser.role }
            });
        }
    } catch (error) {
        console.error('[Auth] Registration error:', error);

        // Handle Mongoose duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        let user;
        let isMatch = false;

        if (isDbConnected()) {
            user = await User.findOne({ email }).select('+password');
            if (user) isMatch = await user.matchPassword(password);
        } else {
            user = localUsers.find(u => u.email === email);
            if (user) isMatch = user.password === password;
        }

        if (!user || !isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.json({
            success: true,
            token,
            user: { id: user._id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

/**
 * GET /api/auth/me
 * Get current logged in user
 */
router.get('/me', protect, async (req, res) => {
    try {
        if (isDbConnected()) {
            const user = await User.findById(req.user.id);
            res.json({
                success: true,
                user: { id: user._id, email: user.email, role: user.role }
            });
        } else {
            const user = localUsers.find(u => u._id === req.user.id) || req.user; // req.user set by middleware
            res.json({
                success: true,
                user: { id: user.id || user._id, email: user.email, role: user.role }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get user' });
    }
});



export default router;
