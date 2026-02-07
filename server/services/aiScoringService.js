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
/**
 * Calculate Green Score based on project characteristics
 * Uses strict, weighted rules based on Financial, Geographical, and Impact factors.
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
        locationCoordinates
    } = projectData;

    // Initialize scoring
    let finalScore = 0;
    const reasoning = {};
    const maxScore = 100;

    // Helper to safely parse numbers
    const parseNum = (val) => parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;

    const turnoverVal = parseNum(annualTurnover);
    const savingsVal = parseNum(estimatedSavings);
    const loanVal = parseNum(loanAmount) || 100000; // Avoid div by zero
    const yearsVal = parseNum(yearsInBusiness);

    // ============================================
    // 1. PROJECT IMPACT & CATEGORY (Max 30 Points)
    // ============================================
    let impactScore = 0;
    const impactScores = {
        solar: 30,      // Direct renewable generation
        waste: 30,      // Circular economy
        wind: 30,
        energy_efficiency: 25, // Demand reduction
        ev: 25,         // Emission displacement
        water: 25,      // Resource conservation
        agriculture: 20 // Sustainable practice
    };

    // Normalize category key
    const catKey = (greenObjective || '').toLowerCase().replace(/ /g, '_');
    const baseImpact = impactScores[catKey] || 20;

    impactScore += baseImpact;
    reasoning.category_impact = `+${baseImpact} pts (${greenObjective || 'Standard'} Category)`;

    // Transformative Bonus: If savings > 50% of turnover (High impact on business model)
    if (turnoverVal > 0 && savingsVal > (turnoverVal * 0.5)) {
        impactScore += 5; // Cap handling needed per section? Let's allow section overflow but cap total
        reasoning.transformative_bonus = '+5 pts (High Savings relative to Turnover)';
    }

    // Cap section at 30
    impactScore = Math.min(30, impactScore);
    finalScore += impactScore;


    // ============================================
    // 2. FINANCIAL VIABILITY (Max 30 Points)
    // ============================================
    let financialScore = 0;

    // A. ROI Potential (Savings / Loan Amount) - Max 15
    const roiRatio = savingsVal / loanVal;
    if (roiRatio >= 0.5) {
        financialScore += 15;
        reasoning.roi_potential = '+15 pts (Excellent ROI > 50%)';
    } else if (roiRatio >= 0.25) {
        financialScore += 10;
        reasoning.roi_potential = '+10 pts (Strong ROI > 25%)';
    } else if (roiRatio >= 0.1) {
        financialScore += 5;
        reasoning.roi_potential = '+5 pts (Moderate ROI)';
    } else {
        reasoning.roi_potential = '0 pts (Low ROI < 10%)';
    }

    // B. Business Stability - Max 15
    // Turnover
    if (turnoverVal >= 5000000) { // 50L
        financialScore += 10;
        reasoning.turnover_stability = '+10 pts (Turnover > ₹50L)';
    } else if (turnoverVal >= 1000000) { // 10L
        financialScore += 5;
        reasoning.turnover_stability = '+5 pts (Turnover > ₹10L)';
    } else {
        reasoning.turnover_stability = '+0 pts (Low Turnover)';
    }

    // Years
    if (yearsVal >= 3) {
        financialScore += 5;
        reasoning.business_age = '+5 pts (> 3 Years Vintage)';
    } else if (yearsVal >= 1) {
        financialScore += 2;
        reasoning.business_age = '+2 pts (1-3 Years Vintage)';
    }

    // Cap section at 30
    financialScore = Math.min(30, financialScore);
    finalScore += financialScore;


    // ============================================
    // 3. GEOGRAPHICAL SUITABILITY (Max 30 Points)
    // ============================================
    let geoScore = 0;

    // Derive State
    let state = projectLocation || 'Unknown';
    if (locationCoordinates?.latitude && locationCoordinates?.longitude) {
        const derived = getStateFromCoordinates(locationCoordinates.latitude, locationCoordinates.longitude);
        if (derived !== 'Unknown') state = derived;
    }
    state = state.toLowerCase();

    // A. Suitability Rules (20 pts)
    const category = (greenObjective || '').toLowerCase();

    // Solar
    if (category.includes('solar')) {
        if (['rajasthan', 'gujarat', 'maharashtra', 'karnataka', 'tamil nadu', 'telangana', 'andhra pradesh'].some(s => state.includes(s))) {
            geoScore += 20;
            reasoning.geo_suitability = '+20 pts (High Solar Irradiance Zone)';
        } else if (['kerala', 'west bengal', 'odisha'].some(s => state.includes(s))) {
            geoScore += 10;
            reasoning.geo_suitability = '+10 pts (Moderate Solar Potential)';
        } else {
            geoScore += 5;
            reasoning.geo_suitability = '+5 pts (Standard Solar Potential)';
        }
    }
    // Wind
    else if (category.includes('wind')) {
        if (['tamil nadu', 'gujarat', 'maharashtra', 'karnataka'].some(s => state.includes(s))) {
            geoScore += 20;
            reasoning.geo_suitability = '+20 pts (High Wind Corridor)';
        } else {
            geoScore += 5;
            reasoning.geo_suitability = '+5 pts (Low Wind Potential)';
        }
    }
    // EV / Efficiency (Urban Focus)
    else if (category.includes('ev') || category.includes('efficiency')) {
        if (['delhi', 'maharashtra', 'karnataka', 'telangana', 'tamil nadu'].some(s => state.includes(s))) {
            geoScore += 20;
            reasoning.geo_suitability = '+20 pts (High Urban Adoption Rate)';
        } else {
            geoScore += 10;
            reasoning.geo_suitability = '+10 pts (Growing Adoption Zone)';
        }
    }
    // Agriculture / Water (Resource Scarcity Focus)
    else if (category.includes('agriculture') || category.includes('water')) {
        if (['punjab', 'haryana', 'uttar pradesh', 'madhya pradesh'].some(s => state.includes(s))) {
            geoScore += 20;
            reasoning.geo_suitability = '+20 pts (Process Optimization Zone)';
        } else if (['rajasthan', 'maharashtra', 'gujarat'].some(s => state.includes(s))) {
            geoScore += 20;
            reasoning.geo_suitability = '+20 pts (Critical Resource Impact Zone)';
        } else {
            geoScore += 10;
            reasoning.geo_suitability = '+10 pts (Standard Impact Zone)';
        }
    }
    // Waste
    else if (category.includes('waste')) {
        geoScore += 20; // Universally applicable
        reasoning.geo_suitability = '+20 pts (Universal Need)';
    }
    else {
        geoScore += 10;
        reasoning.geo_suitability = '+10 pts (General Applicability)';
    }

    // B. Climate Risk Resilience (10 pts)
    // Invert risk: Low risk = high score
    const riskAssessment = assessClimateRisk({ state });
    if (riskAssessment.level === 'low') {
        geoScore += 10;
        reasoning.climate_resilience = '+10 pts (Low Climate Risk)';
    } else if (riskAssessment.level === 'medium') {
        geoScore += 5;
        reasoning.climate_resilience = '+5 pts (Moderate Climate Risk)';
    } else {
        reasoning.climate_resilience = '0 pts (High Climate Risk detected)';
    }

    // Cap section at 30
    geoScore = Math.min(30, geoScore);
    finalScore += geoScore;


    // ============================================
    // 4. DATA INTEGRITY & VALIDATION (Max 10 Points)
    // ============================================
    let dataScore = 0;

    // Granular Location Bonus
    if (locationCoordinates?.latitude) {
        dataScore += 5;
        reasoning.data_quality = '+5 pts (Precise Geolocation Verified)';
    }

    // Completeness Bonus (Turnover & Savings present)
    if (turnoverVal > 0 && savingsVal > 0) {
        dataScore += 5;
        reasoning.data_completeness = '+5 pts (Full Financial Disclosure)';
    }

    finalScore += dataScore;

    // ============================================
    // FINAL AGGREGATION
    // ============================================

    // Ensure score is within 0-100
    finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

    // Determine Class
    let sustainabilityClass = 'low';
    if (finalScore >= 80) sustainabilityClass = 'high'; // Stricter threshold
    else if (finalScore >= 50) sustainabilityClass = 'medium';

    return {
        greenScore: finalScore,
        sustainabilityClass,
        reasoning,
        timestamp: new Date().toISOString(),
        methodology: 'TerraLend Enhanced AI v2.0',
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
    getStateFromCoordinates,
    calculateSuitabilityScore
};

/**
 * Get State/Region from Coordinates (Simulated Reverse Geocoding)
 * Uses approximate centroids for major Indian states
 */
export function getStateFromCoordinates(lat, long) {
    if (!lat || !long) return 'Unknown';

    // Simplified centroids for demo
    const locations = [
        { state: 'Maharashtra', lat: 19.75, long: 75.71 },
        { state: 'Karnataka', lat: 15.31, long: 75.71 },
        { state: 'Rajasthan', lat: 27.02, long: 74.21 },
        { state: 'Tamil Nadu', lat: 11.12, long: 78.65 },
        { state: 'Gujarat', lat: 22.25, long: 71.19 },
        { state: 'Assam', lat: 26.20, long: 92.93 },
        { state: 'Delhi', lat: 28.70, long: 77.10 },
        { state: 'Telangana', lat: 18.11, long: 79.01 }
    ];

    // Find nearest neighbor
    let minDist = Number.MAX_VALUE;
    let nearestState = 'Unknown';

    locations.forEach(loc => {
        const dist = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.long - long, 2));
        if (dist < minDist) {
            minDist = dist;
            nearestState = loc.state;
        }
    });

    // If too far from any centroid (> 5 degrees ~ 500km), keep unknown or nearest
    return nearestState;
}

/**
 * Calculate Suitability Score (Category vs Location)
 * Rewards high-potential matches and penalizes risky ones
 */
export function calculateSuitabilityScore(category, locationState) {
    if (!category || !locationState) return { score: 0, reason: 'Insufficient data' };

    const state = locationState.toLowerCase();
    const cat = category.toLowerCase();
    let score = 0;
    let reason = 'Neutral match';

    // Rules Engine

    // Solar Rules
    if (cat.includes('solar')) {
        if (['rajasthan', 'gujarat', 'maharashtra', 'karnataka', 'tamil nadu'].some(s => state.includes(s))) {
            score = 10;
            reason = 'High solar irradiance region (+10)';
        } else if (['assam', 'meghalaya'].some(s => state.includes(s))) {
            score = -5;
            reason = 'Low solar potential region (-5)';
        }
    }

    // Agriculture / Water Rules
    if (cat.includes('agriculture') || cat.includes('water')) {
        if (['rajasthan', 'gujarat'].some(s => state.includes(s))) {
            // Needed most here, but risky if water not available? 
            // Let's reward solution providers in scarce areas
            score = 10;
            reason = 'Critical solution for water-scarce region (+10)';
        } else if (['punjab', 'haryana'].some(s => state.includes(s))) {
            score = 5;
            reason = 'Supports sustainable farming in high-yield zone (+5)';
        }
    }

    // Wind (Simulated if added later) / EV
    if (cat.includes('ev')) {
        if (['delhi', 'maharashtra', 'karnataka'].some(s => state.includes(s))) {
            score = 10;
            reason = 'High EV adoption potential (+10)';
        }
    }

    return { score, reason };
}
