/**
 * Loans API Routes
 * Handles loan applications and management
 */

import express from 'express';
import { loans, verifications } from '../services/dataStore.js';
import { recordEvent } from '../services/blockchainService.js';

const router = express.Router();

/**
 * POST /api/loans
 * Submit a new loan application
 */
router.post('/', async (req, res) => {
    try {
        const loanData = req.body;

        // Generate loan ID
        const loanId = `TL-${new Date().getFullYear()}-${String(loans.size + 1).padStart(3, '0')}`;

        // Create loan record
        const loan = {
            id: loanId,
            userId: loanData.userId || 'demo-user-001',
            status: 'pending_verification',
            ...loanData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Store in memory
        loans.set(loanId, loan);

        // Record on blockchain
        recordEvent({
            eventType: 'loan_application',
            loanId,
            description: `Loan application submitted: ₹${parseInt(loanData.loanAmount || 0).toLocaleString()} for ${loanData.greenObjective || 'green project'}`,
        });

        res.status(201).json({
            success: true,
            loanId,
            message: 'Loan application submitted successfully',
            loan,
        });
    } catch (error) {
        console.error('Error creating loan:', error);
        res.status(500).json({ error: 'Failed to create loan application' });
    }
});

/**
 * GET /api/loans/:id
 * Get loan details by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const loan = loans.get(id);

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Get verification data if exists
        const verification = verifications.get(id);

        res.json({
            ...loan,
            verification: verification || null,
        });
    } catch (error) {
        console.error('Error fetching loan:', error);
        res.status(500).json({ error: 'Failed to fetch loan details' });
    }
});

/**
 * GET /api/loans/user/:userId
 * Get all loans for a user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query;

        // Filter loans by user
        const userLoans = Array.from(loans.values()).filter(
            loan => loan.userId === userId
        );

        // Calculate summary
        const summary = {
            totalDisbursed: userLoans.reduce((sum, l) =>
                l.status !== 'pending' && l.status !== 'rejected' ? sum + (l.amount || 0) : sum, 0),
            activeLoans: userLoans.filter(l => l.status === 'active').length,
            totalRepaid: 540000, // Demo value
            upcomingPayment: userLoans.find(l => l.nextPaymentAmount)?.nextPaymentAmount || 0,
        };

        res.json({
            loans: userLoans,
            summary,
            role: role || 'borrower',
        });
    } catch (error) {
        console.error('Error fetching user loans:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

/**
 * PUT /api/loans/:id/status
 * Update loan status
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const loan = loans.get(id);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Update status
        loan.status = status;
        loan.updatedAt = new Date().toISOString();
        loans.set(id, loan);

        // Record status change
        recordEvent({
            eventType: `loan_${status}`,
            loanId: id,
            description: `Loan status updated to: ${status}`,
        });

        res.json({ success: true, loan });
    } catch (error) {
        console.error('Error updating loan status:', error);
        res.status(500).json({ error: 'Failed to update loan status' });
    }
});

export default router;
