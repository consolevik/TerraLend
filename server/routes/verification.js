import express from 'express';
import LoanApplication from '../models/LoanApplication.js';
import { calculateGreenScore, runGreenwashingCheck, assessClimateRisk } from '../services/aiScoringService.js';
import { recordEvent } from '../services/blockchainService.js';
import { isDbConnected } from '../config/db.js';
import { localLoans } from '../services/store.js';

// In-memory verification storage (fallback/cache)
export const localVerifications = new Map();

const router = express.Router();

/**
 * POST /api/verify/green-score
 * Initiate AI verification for a loan
 */
router.post('/green-score', async (req, res) => {
    try {
        const { loanId } = req.body;
        let loan = null;

        // 1. Find Loan (MongoDB or Local)
        if (isDbConnected()) {
            loan = await LoanApplication.findOne({
                $or: [{ loanId: loanId }, { _id: loanId.match(/^[0-9a-fA-F]{24}$/) ? loanId : null }]
            });
        }

        if (!loan) {
            // Check local store
            loan = localLoans.find(l => l.loanId === loanId || l._id === loanId);
        }

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // 2. Calculate Scores
        const scoreResult = calculateGreenScore(loan);
        const greenwashingResult = runGreenwashingCheck(loan);
        const climateRisk = assessClimateRisk({
            city: loan.projectLocation?.split(',')[0] || '',
            state: loan.projectLocation?.split(',')[1] || '',
        });

        // 3. Prepare Verification Result
        const verification = {
            loanId: loan.loanId,
            completed: true,
            greenScore: scoreResult.greenScore,
            sustainabilityClass: scoreResult.sustainabilityClass,
            reasoning: scoreResult.reasoning,
            greenwashingCheck: greenwashingResult,
            climateRisk,
            completedAt: new Date().toISOString(),
        };

        // 4. Update Loan Status & Save
        // 4. Update Loan Status & Save
        let newStatus = 'approved';
        let rejectionReason = null;

        // Rejection Criteria
        if (!greenwashingResult.passed) {
            newStatus = 'rejected';
            rejectionReason = 'Greenwashing detected: Sustainability claims could not be verified.';
        } else if (scoreResult.greenScore < 50) {
            newStatus = 'rejected';
            rejectionReason = `Green Score too low (${scoreResult.greenScore}/100). Minimum 50 required.`;
        }

        if (isDbConnected() && loan.save) {
            loan.status = newStatus;
            loan.aiScore = scoreResult.greenScore;
            loan.sustainabilityClass = scoreResult.sustainabilityClass;
            if (rejectionReason) loan.rejectionReason = rejectionReason;
            await loan.save();
        } else {
            // Update local object
            loan.status = newStatus;
            loan.aiScore = scoreResult.greenScore;
            loan.sustainabilityClass = scoreResult.sustainabilityClass;
            if (rejectionReason) loan.rejectionReason = rejectionReason;
            loan.updatedAt = new Date().toISOString();
        }

        // Store verification result in memory for quick retrieval
        localVerifications.set(loan.loanId, verification);

        // 5. Record Blockchain Event
        recordEvent({
            eventType: 'verification_complete',
            loanId: loan.loanId,
            description: `AI Verification completed: Green Score ${scoreResult.greenScore}`,
        });

        res.json({
            success: true,
            verification,
        });
    } catch (error) {
        console.error('Error in verification:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * GET /api/verify/status/:loanId
 * Get verification status for a loan
 */
router.get('/status/:loanId', async (req, res) => {
    try {
        const { loanId } = req.params;

        // Check local cache first
        let verification = localVerifications.get(loanId);

        if (!verification) {
            // If checking from DB, we might need to reconstruct or store verification in DB too
            // For now, simpler to rely on the LoanApplication having the score
            // But the UI expects the full verification object

            // If we authenticated against DB, we can check if loan has score
            if (isDbConnected()) {
                const loan = await LoanApplication.findOne({ loanId });
                if (loan && loan.aiScore !== undefined) {
                    // Reconstruct basic verification status if not in cache
                    return res.json({
                        loanId,
                        completed: true,
                        greenScore: loan.aiScore,
                        sustainabilityClass: loan.sustainabilityClass,
                        status: 'completed'
                    });
                }
            }

            return res.json({
                loanId,
                completed: false,
                status: 'pending',
            });
        }

        res.json(verification);
    } catch (error) {
        console.error('Error fetching verification status:', error);
        res.status(500).json({ error: 'Failed to fetch verification status' });
    }
});

/**
 * POST /api/verify/greenwashing
 */
router.post('/greenwashing', async (req, res) => {
    // Kept simple for now
    res.json({ success: true, message: 'Endpoint deprecated, use green-score' });
});

export default router;
