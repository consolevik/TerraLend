/**
 * Verification API Routes
 * Handles AI-powered green scoring and verification
 */

import express from 'express';
import { loans, verifications } from '../services/dataStore.js';
import { calculateGreenScore, runGreenwashingCheck, assessClimateRisk } from '../services/aiScoringService.js';
import { recordEvent } from '../services/blockchainService.js';

const router = express.Router();

/**
 * POST /api/verify/green-score
 * Initiate AI verification for a loan
 */
router.post('/green-score', async (req, res) => {
    try {
        const { loanId } = req.body;

        // Get loan data
        const loan = loans.get(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Calculate Green Score
        const scoreResult = calculateGreenScore(loan);

        // Run greenwashing check
        const greenwashingResult = runGreenwashingCheck(loan);

        // Assess climate risk
        const climateRisk = assessClimateRisk({
            city: loan.projectLocation?.split(',')[0] || '',
            state: loan.projectLocation?.split(',')[1] || '',
        });

        // Store verification result
        const verification = {
            loanId,
            completed: true,
            greenScore: scoreResult.greenScore,
            sustainabilityClass: scoreResult.sustainabilityClass,
            reasoning: scoreResult.reasoning,
            greenwashingCheck: greenwashingResult,
            climateRisk,
            completedAt: new Date().toISOString(),
        };

        verifications.set(loanId, verification);

        // Update loan status
        loan.status = 'verified';
        loan.updatedAt = new Date().toISOString();
        loans.set(loanId, loan);

        // Record on blockchain
        recordEvent({
            eventType: 'verification_complete',
            loanId,
            description: `AI Verification completed: Green Score ${scoreResult.greenScore} (${scoreResult.sustainabilityClass === 'high' ? 'High' : scoreResult.sustainabilityClass === 'medium' ? 'Medium' : 'Low'} Impact)`,
        });

        recordEvent({
            eventType: 'greenwashing_check',
            loanId,
            description: `Greenwashing check ${greenwashingResult.passed ? 'passed' : 'flagged'}: Authenticity Score ${greenwashingResult.confidenceScore}%`,
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

        const verification = verifications.get(loanId);

        if (!verification) {
            // Return pending status if not verified yet
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
 * Run standalone greenwashing check
 */
router.post('/greenwashing', async (req, res) => {
    try {
        const { loanId } = req.body;

        const loan = loans.get(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        const result = runGreenwashingCheck(loan);

        res.json({
            success: true,
            loanId,
            result,
        });
    } catch (error) {
        console.error('Error in greenwashing check:', error);
        res.status(500).json({ error: 'Greenwashing check failed' });
    }
});

export default router;
