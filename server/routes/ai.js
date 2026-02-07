/**
 * AI Routes
 * 
 * API endpoints for AI-powered sustainability claim extraction.
 * Supports both mock (deterministic) and LLM-based extraction modes.
 */

import express from 'express';
import { extractClaim, isLLMEnabled } from '../services/aiExtractionService.js';
import { calculateExtractionConfidence, getConfidenceLevel } from '../services/confidenceService.js';

const router = express.Router();

/**
 * POST /api/ai/extract-claim
 * 
 * Extract structured sustainability data from free-text description.
 * Automatically uses LLM or mock mode based on configuration.
 * 
 * Request body:
 * {
 *   "text": "free text sustainability description"
 * }
 * 
 * Response:
 * {
 *   "extracted_claim": { ... },
 *   "extraction_confidence": { ... },
 *   "mode": "mock" | "llm",
 *   "original_text": "..."
 * }
 */
router.post('/extract-claim', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Request body must include "text" field with string value'
            });
        }

        if (text.trim().length < 10) {
            return res.status(400).json({
                error: 'Text too short',
                message: 'Please provide a more detailed sustainability description'
            });
        }

        // Extract claim using appropriate mode
        const extractedClaim = await extractClaim(text);

        // Calculate extraction confidence
        const confidenceResult = calculateExtractionConfidence(extractedClaim);

        // Determine which mode was used
        const mode = isLLMEnabled() ? 'llm' : 'mock';

        // Log extraction for governance/audit
        console.log(`[AI Extraction] Mode: ${mode}, Confidence: ${confidenceResult.confidence}`);

        res.json({
            success: true,
            extracted_claim: extractedClaim,
            extraction_confidence: {
                confidence: confidenceResult.confidence,
                level: getConfidenceLevel(confidenceResult.confidence),
                signals: confidenceResult.signals,
                completeness: confidenceResult.completeness
            },
            mode,
            original_text: text,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI extraction error:', error);
        res.status(500).json({
            error: 'Extraction failed',
            message: error.message || 'An error occurred during AI extraction'
        });
    }
});

/**
 * GET /api/ai/status
 * 
 * Get current AI service status and configuration
 */
router.get('/status', (req, res) => {
    res.json({
        service: 'AI Extraction Service',
        status: 'operational',
        mode: isLLMEnabled() ? 'llm' : 'mock',
        capabilities: [
            'extract_project_type',
            'extract_capacity',
            'extract_vendor',
            'extract_certifications',
            'extract_impact_metrics',
            'confidence_scoring'
        ],
        supported_project_types: ['solar', 'ev', 'waste', 'energy_efficiency', 'water']
    });
});

export default router;
