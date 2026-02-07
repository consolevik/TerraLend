/**
 * TerraLend Backend Server
 * 
 * Express.js API server for the TerraLend green loan platform.
 * Now with MongoDB persistence and JWT authentication.
 * 
 * ============================================
 * ⚠️ IMPORTANT: DEMO/SIMULATION NOTICE
 * ============================================
 * 
 * This backend uses SIMULATED data and algorithms for demonstration purposes:
 * - AI scoring is simulated using weighted rules (not actual ML models)
 * - Blockchain records are stored in-memory (not on actual blockchain)
 * - GST/KYC APIs return mock data (not connected to government APIs)
 * 
 * In a production environment, you would integrate with:
 * - Real ML/AI models for sustainability scoring
 * - Actual blockchain network (Polygon, Ethereum, etc.)
 * - Government APIs (GST Portal, DigiLocker, UIDAI)
 * - Satellite imagery providers (Planet, Sentinel)
 * - IoT sensor data platforms
 * ============================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file in the same directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Database connection
import connectDB from './config/db.js';

// Import route handlers
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import loansRouter from './routes/loans.js';
import verificationRouter from './routes/verification.js';
import impactRouter from './routes/impact.js';
import blockchainRouter from './routes/blockchain.js';
import mockRouter from './routes/mock.js';
import climateRouter from './routes/climate.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Database Connection
// ============================================

connectDB();

// ============================================
// Middleware Configuration
// ============================================

// Enable CORS for frontend communication
// Allow ALL origins for development to prevent any CORS issues
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Origin:', req.headers.origin); // Log the origin for debugging
    if (req.method === 'POST') console.log('Body:', JSON.stringify(req.body).substring(0, 100) + '...');
    next();
});

// Crash handling
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
});
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...', err);
});

// ============================================
// API Routes
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'MongoDB'
    });
});

// Authentication routes
app.use('/api/auth', authRouter);

// Profile management routes
app.use('/api/profile', profileRouter);

// Loan management endpoints
app.use('/api/loans', loansRouter);

// AI verification endpoints
app.use('/api/verify', verificationRouter);

// Impact tracking endpoints
app.use('/api/impact', impactRouter);

// Blockchain audit trail endpoints
app.use('/api/blockchain', blockchainRouter);

// Mock data endpoints (GST, KYC simulation)
app.use('/api/mock', mockRouter);

// Climate risk assessment endpoints
app.use('/api/climate', climateRouter);

// AI extraction endpoints (sustainability claim extraction)
app.use('/api/ai', aiRouter);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.path} does not exist`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong'
    });
});

// ============================================
// Server Startup
// ============================================

app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════════╗
  ║  🌱 TerraLend API Server                   ║
  ╠════════════════════════════════════════════╣
  ║  Port: ${PORT}                               ║
  ║  Mode: ${process.env.NODE_ENV || 'development'}                       ║
  ║  Database: MongoDB                         ║
  ║  Status: Running                           ║
  ╚════════════════════════════════════════════╝
  
  Available endpoints:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET  /api/auth/me
  - POST /api/profile
  - GET  /api/profile
  - POST /api/loans
  - GET  /api/loans
  - GET  /api/loans/:id
  - POST /api/verify/green-score
  - GET  /api/impact/:loanId
  - GET  /api/blockchain/audit
  `);
});

export default app;
