/**
 * In-Memory Data Store
 * 
 * ⚠️ DEMO ONLY - This stores all data in memory.
 * In production, use a proper database (PostgreSQL, MongoDB, etc.)
 */

// Loan applications store
export const loans = new Map();

// Verification results store
export const verifications = new Map();

// Impact metrics store
export const impactMetrics = new Map();

// User data store
export const users = new Map();

// Initialize demo data
export function initializeDemoData() {
    // Demo loan
    loans.set('TL-2025-001', {
        id: 'TL-2025-001',
        userId: 'demo-user-001',
        status: 'active',
        amount: 1500000,
        tenure: 36,
        greenObjective: 'solar',
        projectType: 'Solar Installation',
        businessName: 'Green Energy Solutions Pvt Ltd',
        businessType: 'pvt_ltd',
        annualTurnover: '5000000',
        yearsInBusiness: 5,
        projectLocation: 'Mumbai, Maharashtra',
        projectDescription: '50kW rooftop solar installation for manufacturing unit',
        disbursedDate: '2025-01-15',
        nextPayment: '2025-03-01',
        nextPaymentAmount: 45000,
        progress: 35,
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-02-01T14:30:00Z',
    });

    loans.set('TL-2024-042', {
        id: 'TL-2024-042',
        userId: 'demo-user-001',
        status: 'completed',
        amount: 500000,
        tenure: 12,
        greenObjective: 'ev',
        projectType: 'EV Charging Station',
        businessName: 'Green Energy Solutions Pvt Ltd',
        disbursedDate: '2024-06-20',
        completedDate: '2025-01-20',
        progress: 100,
        createdAt: '2024-06-15T09:00:00Z',
        updatedAt: '2025-01-20T16:00:00Z',
    });

    // Demo verification
    verifications.set('TL-2025-001', {
        loanId: 'TL-2025-001',
        completed: true,
        greenScore: 82,
        sustainabilityClass: 'high',
        reasoning: {
            cash_flow: 'stable',
            project_type: 'solar',
            climate_risk: 'low',
            emission_reduction: 'significant',
        },
        greenwashingCheck: {
            passed: true,
            confidenceScore: 95,
        },
        climateRisk: {
            level: 'low',
            notes: 'Favorable climate conditions for solar installation.',
        },
        completedAt: '2025-01-10T12:00:00Z',
    });

    // Demo impact metrics
    impactMetrics.set('demo-user-001', {
        userId: 'demo-user-001',
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
    });

    // Demo user
    users.set('demo-user-001', {
        id: 'demo-user-001',
        name: 'Rajesh Kumar',
        email: 'rajesh@greensolutions.in',
        role: 'borrower',
        businessName: 'Green Energy Solutions Pvt Ltd',
    });

    console.log('[DataStore] Demo data initialized');
}

// Initialize on import
initializeDemoData();

export default {
    loans,
    verifications,
    impactMetrics,
    users,
};
