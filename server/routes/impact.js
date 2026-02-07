/**
 * Impact API Routes
 * Handles impact metrics and reporting
 */

import express from 'express';
import { impactMetrics, loans } from '../services/dataStore.js';
import { recordEvent } from '../services/blockchainService.js';

const router = express.Router();

/**
 * GET /api/impact/:loanId
 * Get impact metrics for a specific loan
 */
router.get('/:loanId', async (req, res) => {
    try {
        const { loanId } = req.params;

        const loan = loans.get(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Generate loan-specific impact (simulated)
        const monthsActive = Math.floor((Date.now() - new Date(loan.disbursedDate || loan.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000));

        const impact = {
            loanId,
            co2Saved: Math.round(monthsActive * 450), // kg per month
            energyGenerated: Math.round(monthsActive * 1200), // kWh per month
            waterSaved: Math.round(monthsActive * 8000), // Liters per month
            financialSavings: Math.round(monthsActive * 25000), // INR per month
            period: `${monthsActive} months`,
            lastUpdated: new Date().toISOString(),
        };

        res.json(impact);
    } catch (error) {
        console.error('Error fetching loan impact:', error);
        res.status(500).json({ error: 'Failed to fetch impact metrics' });
    }
});

/**
 * GET /api/impact/portfolio/:userId
 * Get aggregated impact for user's portfolio
 */
router.get('/portfolio/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get stored impact metrics or use defaults
        let metrics = impactMetrics.get(userId);

        if (!metrics) {
            // Generate default metrics for demo
            metrics = {
                userId,
                co2Saved: 12500,
                energyGenerated: 45000,
                waterSaved: 250000,
                jobsCreated: 15,
                financialSavings: 850000,
                treesEquivalent: 570,
                monthlyData: [
                    { month: 'Sep', co2: 1200, energy: 4200 },
                    { month: 'Oct', co2: 1350, energy: 4500 },
                    { month: 'Nov', co2: 1500, energy: 4800 },
                    { month: 'Dec', co2: 1600, energy: 5000 },
                    { month: 'Jan', co2: 1800, energy: 5200 },
                    { month: 'Feb', co2: 1900, energy: 5500 },
                ],
                impactByCategory: {
                    solar: 65,
                    ev: 20,
                    waste: 10,
                    water: 5,
                },
                certifications: [
                    { name: 'Climate Finance Taxonomy 2025', status: 'verified' },
                    { name: 'GRI Standards Compliant', status: 'verified' },
                    { name: 'MNRE Verified Project', status: 'verified' },
                ],
            };
        }

        res.json(metrics);
    } catch (error) {
        console.error('Error fetching portfolio impact:', error);
        res.status(500).json({ error: 'Failed to fetch impact metrics' });
    }
});

/**
 * GET /api/impact/report/:loanId
 * Generate impact report (metadata for PDF generation)
 */
router.get('/report/:loanId', async (req, res) => {
    try {
        const { loanId } = req.params;

        const loan = loans.get(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // In production, this would generate an actual PDF
        const report = {
            loanId,
            generatedAt: new Date().toISOString(),
            reportType: 'Impact Assessment Report',
            format: 'PDF',
            downloadUrl: `/api/impact/download/${loanId}`,
            sections: [
                'Executive Summary',
                'Environmental Impact',
                'Social Impact',
                'Financial Performance',
                'Compliance Verification',
                'Blockchain Audit Trail',
            ],
            compliance: [
                'India Climate Finance Taxonomy 2025',
                'GRI Standards',
                'TCFD Recommendations',
            ],
        };

        // Record report generation
        recordEvent({
            eventType: 'impact_report_generated',
            loanId,
            description: 'Impact report generated for download',
        });

        res.json(report);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

export default router;
