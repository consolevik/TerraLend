/**
 * TerraLend Backend Server
 * 
 * Express.js API server for the TerraLend green loan platform.
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

// Import route handlers
import loansRouter from './routes/loans.js';
import verificationRouter from './routes/verification.js';
import impactRouter from './routes/impact.js';
import blockchainRouter from './routes/blockchain.js';
import mockRouter from './routes/mock.js';
import climateRouter from './routes/climate.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware Configuration
// ============================================

// Enable CORS for frontend communication
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// API Routes
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'demo'
    });
});

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
  ║  Mode: Demo/Simulation                     ║
  ║  Status: Running                           ║
  ╚════════════════════════════════════════════╝
  
  Available endpoints:
  - GET  /api/health
  - POST /api/loans
  - GET  /api/loans/:id
  - POST /api/verify/green-score
  - GET  /api/impact/:loanId
  - GET  /api/blockchain/audit
  `);
});

export default app;
