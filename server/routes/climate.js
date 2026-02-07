/**
 * Climate Risk API Routes
 * Handles climate risk assessment for project locations
 */

import express from 'express';
import { assessClimateRisk } from '../services/aiScoringService.js';

const router = express.Router();

/**
 * POST /api/climate/risk
 * Assess climate risk for a location
 */
router.post('/risk', async (req, res) => {
    try {
        const location = req.body;

        if (!location.city && !location.state) {
            return res.status(400).json({
                error: 'Location required',
                message: 'Please provide city or state',
            });
        }

        const assessment = assessClimateRisk(location);

        res.json(assessment);
    } catch (error) {
        console.error('Error in climate risk assessment:', error);
        res.status(500).json({ error: 'Climate risk assessment failed' });
    }
});

/**
 * GET /api/climate/alerts
 * Get current climate alerts for India
 */
router.get('/alerts', async (req, res) => {
    try {
        // Simulated climate alerts
        const alerts = [
            {
                id: 'alert-001',
                type: 'drought',
                region: 'Central Maharashtra',
                level: 'medium',
                description: 'Below normal rainfall expected. Agricultural and water projects may need contingency planning.',
                validUntil: '2025-06-30',
            },
            {
                id: 'alert-002',
                type: 'heatwave',
                region: 'Northern Plains',
                level: 'high',
                description: 'Extreme heat conditions expected from April to June. Solar installations require additional cooling considerations.',
                validUntil: '2025-07-15',
            },
        ];

        res.json({
            alerts,
            updatedAt: new Date().toISOString(),
            source: 'Indian Meteorological Department (Simulated)',
        });
    } catch (error) {
        console.error('Error fetching climate alerts:', error);
        res.status(500).json({ error: 'Failed to fetch climate alerts' });
    }
});

export default router;
