/**
 * AI Scoring Service
 * 
 * ============================================
 * ⚠️ SIMULATION NOTICE
 * ============================================
 * 
 * This service SIMULATES AI-powered sustainability scoring using
 * weighted rule-based algorithms. It is designed for demonstration
 * purposes only.
 * 
 * In production, this would integrate with:
 * - Machine learning models trained on real sustainability data
 * - Satellite imagery APIs (Planet, Sentinel) for verification
 * - IoT sensor data for energy/water monitoring
 * - Financial data providers for cash-flow analysis
 * - Government databases (MNRE, BEE) for cross-verification
 * ============================================
 */

/**
 * Calculate Green Score based on project characteristics
 * Uses transparent, weighted rules for explainability
 * 
 * @param {Object} projectData - Project and business information
 * @returns {Object} Score, classification, and reasoning
 */
export function calculateGreenScore(projectData) {
    const {
        greenObjective,
        annualTurnover,
        yearsInBusiness,
        estimatedSavings,
        projectLocation,
        loanAmount,
    } = projectData;

    // Initialize scoring components
    let score = 0;
    const reasoning = {};
    const maxScore = 100;

    // ============================================
    // 1. Project Type Score (0-30 points)
    // Different green projects have different impact potential
    // ============================================
    const projectTypeScores = {
        solar: 30,
        efficiency: 28,
        ev: 26,
        water: 24,
        waste: 22,
        agriculture: 20,
    };

    const projectTypeScore = projectTypeScores[greenObjective] || 20;
    score += projectTypeScore;
    reasoning.project_type = greenObjective || 'unknown';
    reasoning.project_impact = projectTypeScore >= 26 ? 'high' : projectTypeScore >= 22 ? 'medium' : 'moderate';

    // ============================================
    // 2. Cash Flow Stability Score (0-25 points)
    // Based on turnover and years in business
    // ============================================
    const turnoverNum = parseFloat(String(annualTurnover).replace(/[^0-9]/g, '')) || 0;
    const years = parseInt(yearsInBusiness) || 0;

    let cashFlowScore = 0;

    // Turnover component (0-15 points)
    if (turnoverNum >= 10000000) cashFlowScore += 15;  // 1Cr+
    else if (turnoverNum >= 5000000) cashFlowScore += 12;  // 50L+
    else if (turnoverNum >= 2000000) cashFlowScore += 9;   // 20L+
    else if (turnoverNum >= 500000) cashFlowScore += 6;   // 5L+
    else cashFlowScore += 3;

    // Years in business component (0-10 points)
    if (years >= 5) cashFlowScore += 10;
    else if (years >= 3) cashFlowScore += 7;
    else if (years >= 1) cashFlowScore += 4;
    else cashFlowScore += 2;

    score += cashFlowScore;
    reasoning.cash_flow = cashFlowScore >= 20 ? 'stable' : cashFlowScore >= 12 ? 'moderate' : 'developing';

    // ============================================
    // 3. Emission Reduction Potential (0-25 points)
    // Estimated based on savings and project type
    // ============================================
    const savingsNum = parseFloat(String(estimatedSavings).replace(/[^0-9]/g, '')) || 0;
    const loanNum = parseFloat(String(loanAmount).replace(/[^0-9]/g, '')) || 100000;

    // Calculate savings-to-loan ratio (higher is better)
    const savingsRatio = savingsNum / loanNum;

    let emissionScore = 0;
    if (savingsRatio >= 0.5) emissionScore = 25;      // Excellent ROI
    else if (savingsRatio >= 0.3) emissionScore = 20;
    else if (savingsRatio >= 0.15) emissionScore = 15;
    else if (savingsRatio >= 0.05) emissionScore = 10;
    else emissionScore = 5;

    score += emissionScore;
    reasoning.emission_reduction = emissionScore >= 20 ? 'significant' : emissionScore >= 12 ? 'moderate' : 'limited';

    // ============================================
    // 4. Location-Based Climate Risk (0-20 points)
    // Simulated - in production, would use actual climate data
    // ============================================
    const lowRiskStates = ['maharashtra', 'karnataka', 'tamil nadu', 'gujarat', 'telangana'];
    const mediumRiskStates = ['rajasthan', 'madhya pradesh', 'uttar pradesh', 'punjab'];

    const locationLower = (projectLocation || '').toLowerCase();
    let locationScore = 15; // Default

    if (lowRiskStates.some(state => locationLower.includes(state))) {
        locationScore = 20;
        reasoning.climate_risk = 'low';
    } else if (mediumRiskStates.some(state => locationLower.includes(state))) {
        locationScore = 15;
        reasoning.climate_risk = 'medium';
    } else {
        locationScore = 10;
        reasoning.climate_risk = 'elevated';
    }

    score += locationScore;

    // ============================================
    // Calculate Final Results
    // ============================================

    // Ensure score is within bounds
    const finalScore = Math.min(Math.max(Math.round(score), 0), maxScore);

    // Determine sustainability class
    let sustainabilityClass;
    if (finalScore >= 70) {
        sustainabilityClass = 'high';
    } else if (finalScore >= 40) {
        sustainabilityClass = 'medium';
    } else {
        sustainabilityClass = 'low';
    }

    return {
        greenScore: finalScore,
        sustainabilityClass,
        reasoning,
        timestamp: new Date().toISOString(),
        methodology: 'TerraLend AI Scoring v1.0 (Simulated)',
    };
}

/**
 * Run greenwashing prevention checks
 * Simulates cross-verification with government databases
 * 
 * @param {Object} projectData - Project information
 * @returns {Object} Greenwashing check results
 */
export function runGreenwashingCheck(projectData) {
    // Simulate verification checks
    const checks = [
        { name: 'MNRE Registration', status: 'verified', confidence: 95 },
        { name: 'BEE Compliance', status: 'verified', confidence: 92 },
        { name: 'GRI Standards', status: 'verified', confidence: 88 },
        { name: 'Project Documentation', status: 'verified', confidence: 90 },
    ];

    // Calculate overall confidence
    const avgConfidence = checks.reduce((sum, c) => sum + c.confidence, 0) / checks.length;

    // Determine if passed (all checks verified and confidence > 80%)
    const passed = checks.every(c => c.status === 'verified') && avgConfidence >= 80;

    return {
        passed,
        confidenceScore: Math.round(avgConfidence),
        checks,
        flags: [], // In production, would contain any inconsistencies found
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Greenwashing Prevention Agent (Simulated)',
    };
}

/**
 * Assess climate risks for project location
 * 
 * @param {Object} location - Location details
 * @returns {Object} Climate risk assessment
 */
export function assessClimateRisk(location) {
    // Simulated climate risk data
    // In production, would integrate with climate APIs

    const risks = [];
    const locationStr = (location.city || location.state || '').toLowerCase();

    // Drought risk (Central/Western India)
    if (['maharashtra', 'karnataka', 'rajasthan', 'telangana'].some(s => locationStr.includes(s))) {
        risks.push({
            type: 'drought',
            level: 'medium',
            description: 'Moderate drought risk during summer months. May affect water-dependent operations.',
            recommendation: 'Consider water storage and backup systems.',
        });
    }

    // Flood risk (Coastal/Eastern regions)
    if (['mumbai', 'chennai', 'kolkata', 'assam', 'kerala'].some(s => locationStr.includes(s))) {
        risks.push({
            type: 'flood',
            level: 'high',
            description: 'Higher flood risk during monsoon season.',
            recommendation: 'Ensure adequate flood insurance and elevated installations.',
        });
    }

    // Heat stress (Northern plains)
    if (['delhi', 'uttar pradesh', 'bihar', 'punjab'].some(s => locationStr.includes(s))) {
        risks.push({
            type: 'heatwave',
            level: 'medium',
            description: 'Extreme heat events may impact equipment efficiency.',
            recommendation: 'Plan for cooling systems and shade structures.',
        });
    }

    // Determine overall risk level
    let overallLevel = 'low';
    if (risks.some(r => r.level === 'high')) {
        overallLevel = 'high';
    } else if (risks.some(r => r.level === 'medium')) {
        overallLevel = 'medium';
    }

    return {
        level: overallLevel,
        risks,
        notes: risks.length > 0
            ? `${risks.length} climate risk(s) identified for this location.`
            : 'No significant climate risks identified.',
        assessedAt: new Date().toISOString(),
    };
}

export default {
    calculateGreenScore,
    runGreenwashingCheck,
    assessClimateRisk,
};
