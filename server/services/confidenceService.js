/**
 * Confidence Scoring Service
 * 
 * ============================================
 * PURPOSE
 * ============================================
 * 
 * Calculates extraction confidence for AI-extracted sustainability claims.
 * This adds transparency and trustworthiness to the AI extraction process.
 * 
 * The confidence score helps users understand:
 * - How complete the extracted data is
 * - Which fields might need manual review
 * - The reliability of the extraction
 * ============================================
 */

/**
 * Calculate extraction confidence score
 * Starts at 1.0 and reduces for missing critical fields
 * 
 * @param {Object} extracted - Extracted claim object
 * @returns {Object} Confidence score and signals
 */
export function calculateExtractionConfidence(extracted) {
    let score = 1.0;
    const signals = [];

    // Check project_type (-0.2 if missing)
    if (!extracted.project_type) {
        score -= 0.2;
        signals.push({
            field: 'project_type',
            message: 'Project type could not be determined',
            penalty: 0.2
        });
    }

    // Check capacity_kw (-0.25 if missing)
    if (!extracted.capacity_kw) {
        score -= 0.25;
        signals.push({
            field: 'capacity_kw',
            message: 'Capacity/size not specified',
            penalty: 0.25
        });
    }

    // Check vendor (-0.2 if missing)
    if (!extracted.vendor) {
        score -= 0.2;
        signals.push({
            field: 'vendor',
            message: 'Vendor/manufacturer not identified',
            penalty: 0.2
        });
    }

    // Check impact metrics (-0.15 if both missing)
    const hasCO2 = extracted.claimed_impact?.co2_saved_tonnes_per_year != null;
    const hasEnergy = extracted.claimed_impact?.energy_generated_kwh_per_year != null;

    if (!hasCO2 && !hasEnergy) {
        score -= 0.15;
        signals.push({
            field: 'claimed_impact',
            message: 'No impact metrics found',
            penalty: 0.15
        });
    }

    // Bonus for certifications (+0.05 per cert, max +0.1)
    if (extracted.certifications && extracted.certifications.length > 0) {
        const bonus = Math.min(extracted.certifications.length * 0.05, 0.1);
        score += bonus;
        // Don't add to signals for positive indicators
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(1, score));

    return {
        confidence: Math.round(score * 100) / 100, // Round to 2 decimal places
        signals,
        completeness: {
            hasProjectType: !!extracted.project_type,
            hasCapacity: !!extracted.capacity_kw,
            hasVendor: !!extracted.vendor,
            hasCertifications: (extracted.certifications?.length || 0) > 0,
            hasImpactMetrics: hasCO2 || hasEnergy
        }
    };
}

/**
 * Get human-readable confidence level
 * 
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} Human-readable confidence level
 */
export function getConfidenceLevel(confidence) {
    if (confidence >= 0.85) return 'high';
    if (confidence >= 0.6) return 'medium';
    if (confidence >= 0.4) return 'low';
    return 'very_low';
}

/**
 * Get confidence color for UI display
 * 
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} CSS color value
 */
export function getConfidenceColor(confidence) {
    if (confidence >= 0.85) return '#22c55e'; // green
    if (confidence >= 0.6) return '#eab308';  // yellow
    if (confidence >= 0.4) return '#f97316';  // orange
    return '#ef4444'; // red
}

export default {
    calculateExtractionConfidence,
    getConfidenceLevel,
    getConfidenceColor
};
