/**
 * Loans API Routes
 * 
 * Handles loan applications and management with MongoDB persistence.
 * Supports both authenticated and demo modes.
 */

import express from 'express';
import LoanApplication from '../models/LoanApplication.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { protect } from '../middleware/authMiddleware.js';
import { recordEvent } from '../services/blockchainService.js';
import { isDbConnected } from '../config/db.js';
import { localLoans } from '../services/store.js';

const router = express.Router();


/**
 * POST /api/loans
 * Submit a new loan application
 */
router.post('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const loanData = req.body;

        if (isDbConnected()) {
            // Get business profile for snapshot
            const businessProfile = await BusinessProfile.findOne({ user: userId });

            // Create loan application
            const loan = await LoanApplication.create({
                user: userId,
                // Business snapshot
                businessName: businessProfile?.businessName || loanData.businessName,
                businessType: businessProfile?.businessType || loanData.businessType,
                gstNumber: businessProfile?.gstNumber || loanData.gstNumber,
                annualTurnover: businessProfile?.annualTurnover || loanData.annualTurnover,
                yearsInBusiness: businessProfile?.yearsInBusiness || loanData.yearsInBusiness,
                // Green Objective
                greenObjective: loanData.greenObjective,
                projectDescription: loanData.projectDescription,
                estimatedSavings: parseFloat(String(loanData.estimatedSavings).replace(/,/g, '')) || 0,
                projectLocation: loanData.projectLocation,
                // Loan Details
                loanAmount: parseFloat(String(loanData.loanAmount).replace(/,/g, '')) || 0,
                tenure: parseInt(loanData.tenure),
                purpose: loanData.purpose,
                // Status
                status: 'pending_verification'
            });

            // Record on blockchain (simulated)
            recordEvent({
                eventType: 'loan_application',
                loanId: loan.loanId,
                description: `Loan application submitted: ₹${loan.loanAmount.toLocaleString()} for ${loan.greenObjective}`,
            });

            res.status(201).json({
                success: true,
                loanId: loan.loanId,
                message: 'Loan application submitted successfully',
                loan
            });
        } else {
            // In-Memory Logic
            const year = new Date().getFullYear();
            const count = localLoans.length;
            const loanId = `TL-${year}-${String(count + 1).padStart(3, '0')}`;

            const newLoan = {
                _id: 'local_loan_' + Date.now(),
                user: userId,
                loanId,
                ...loanData,
                loanAmount: parseFloat(String(loanData.loanAmount).replace(/,/g, '')) || 0,
                estimatedSavings: parseFloat(String(loanData.estimatedSavings).replace(/,/g, '')) || 0,
                status: 'pending_verification',
                appliedAt: new Date(),
                repaymentProgress: 0
            };
            localLoans.push(newLoan);

            res.status(201).json({
                success: true,
                loanId: newLoan.loanId,
                message: 'Loan application submitted successfully (Demo Mode)',
                loan: newLoan
            });
        }
    } catch (error) {
        console.error('[Loans] Create error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create loan application'
        });
    }
});

/**
 * GET /api/loans
 * Get all loans for the current user
 */
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let loans = [];

        if (isDbConnected()) {
            const filter = { user: userId };
            if (status) filter.status = status;
            loans = await LoanApplication.find(filter).sort({ appliedAt: -1 });
        } else {
            loans = localLoans.filter(l => l.user === userId);
            if (status) loans = loans.filter(l => l.status === status);
        }

        // Calculate summary
        const summary = {
            totalDisbursed: loans.reduce((sum, l) =>
                ['active', 'completed'].includes(l.status) ? sum + (l.loanAmount || 0) : sum, 0),
            activeLoans: loans.filter(l => l.status === 'active').length,
            totalRepaid: loans.reduce((sum, l) => {
                if (l.status === 'completed') return sum + l.loanAmount;
                if (l.status === 'active') return sum + (l.loanAmount * (l.repaymentProgress / 100));
                return sum;
            }, 0),
            upcomingPayment: loans.find(l => l.nextPaymentAmount)?.nextPaymentAmount || 0
        };

        res.json({
            success: true,
            loans,
            summary
        });
    } catch (error) {
        console.error('[Loans] Get all error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch loans'
        });
    }
});

/**
 * GET /api/loans/:id
 * Get loan details by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Support both MongoDB _id and loanId
        const loan = await LoanApplication.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { loanId: id }
            ]
        });

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: 'Loan not found'
            });
        }

        res.json({
            success: true,
            loan
        });
    } catch (error) {
        console.error('[Loans] Get by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch loan details'
        });
    }
});

/**
 * GET /api/loans/user/:userId
 * Get all loans for a specific user (for dashboard compatibility)
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query;

        const loans = await LoanApplication.find({ user: userId })
            .sort({ appliedAt: -1 });

        // Calculate summary
        const summary = {
            totalDisbursed: loans.reduce((sum, l) =>
                ['active', 'completed'].includes(l.status) ? sum + (l.loanAmount || 0) : sum, 0),
            activeLoans: loans.filter(l => l.status === 'active').length,
            totalRepaid: loans.reduce((sum, l) => {
                if (l.status === 'completed') return sum + l.loanAmount;
                if (l.status === 'active') return sum + (l.loanAmount * (l.repaymentProgress / 100));
                return sum;
            }, 0),
            upcomingPayment: loans.find(l => l.nextPaymentAmount)?.nextPaymentAmount || 0
        };

        res.json({
            loans,
            summary,
            role: role || 'borrower'
        });
    } catch (error) {
        console.error('[Loans] Get user loans error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch loans'
        });
    }
});

/**
 * PUT /api/loans/:id/status
 * Update loan status
 */
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, aiScore, sustainabilityClass } = req.body;

        const loan = await LoanApplication.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { loanId: id }
            ]
        });

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: 'Loan not found'
            });
        }

        // Update fields
        if (status) loan.status = status;
        if (aiScore !== undefined) loan.aiScore = aiScore;
        if (sustainabilityClass) loan.sustainabilityClass = sustainabilityClass;

        // Set disbursed date if approved
        if (status === 'active' && !loan.disbursedDate) {
            loan.disbursedDate = new Date();
            // Set first payment date (30 days from now)
            loan.nextPayment = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            loan.nextPaymentAmount = Math.round(loan.loanAmount / loan.tenure * 1.1); // Simple EMI estimate
        }

        await loan.save();

        // Record status change
        recordEvent({
            eventType: `loan_${status}`,
            loanId: loan.loanId,
            description: `Loan status updated to: ${status}`,
        });

        res.json({
            success: true,
            loan
        });
    } catch (error) {
        console.error('[Loans] Update status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update loan status'
        });
    }
});

export default router;
