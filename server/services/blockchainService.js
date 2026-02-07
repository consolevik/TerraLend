/**
 * Blockchain Service
 * 
 * ============================================
 * ⚠️ SIMULATION NOTICE
 * ============================================
 * 
 * This service SIMULATES blockchain functionality using in-memory
 * storage. It generates realistic-looking transaction hashes and
 * maintains an audit trail for demonstration purposes.
 * 
 * In production, this would integrate with:
 * - Actual blockchain network (Polygon, Ethereum, Hyperledger)
 * - Smart contracts for automated compliance
 * - IPFS for document storage
 * - Cryptographic signing for authenticity
 * ============================================
 */

import crypto from 'crypto';

// ============================================
// IN-MEMORY AUDIT LOG STORAGE
// ⚠️ DEMO ONLY - Use actual blockchain in production
// ============================================
const auditLogs = [];
let blockNumber = 18234500;

/**
 * Generate a realistic-looking transaction hash
 * Uses SHA-256 for realistic appearance
 * 
 * @param {string} data - Data to hash
 * @returns {string} Transaction hash
 */
function generateTxHash(data) {
    const timestamp = Date.now().toString();
    const randomSalt = Math.random().toString(36).substring(2);
    const input = `${data}${timestamp}${randomSalt}`;

    return '0x' + crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Record an event to the simulated blockchain
 * 
 * @param {Object} event - Event details
 * @returns {Object} Recorded transaction details
 */
export function recordEvent(event) {
    const {
        eventType,
        loanId,
        description,
        metadata = {},
    } = event;

    // Generate transaction details
    const txHash = generateTxHash(JSON.stringify(event));
    blockNumber += Math.floor(Math.random() * 5) + 1; // Simulate block progression

    const record = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        txHash,
        blockNumber,
        timestamp: new Date().toISOString(),
        eventType,
        loanId,
        description,
        metadata,
        verifiedBy: getVerifierForEvent(eventType),
        status: 'confirmed',
        gasUsed: Math.floor(Math.random() * 50000) + 21000, // Simulated gas
    };

    // Store in memory (would be on-chain in production)
    auditLogs.unshift(record); // Add to beginning for reverse chronological order

    console.log(`[Blockchain] Recorded: ${eventType} for ${loanId}`);

    return record;
}

/**
 * Get appropriate verifier name based on event type
 */
function getVerifierForEvent(eventType) {
    const verifiers = {
        loan_application: 'TerraLend Core',
        loan_disbursement: 'TerraLend Core',
        verification_complete: 'Green Scoring Agent',
        greenwashing_check: 'Greenwashing Prevention Agent',
        climate_risk_assessment: 'Climate Risk Agent',
        impact_update: 'Impact Analytics Agent',
        payment_received: 'Payment Gateway',
        loan_completed: 'TerraLend Core',
    };
    return verifiers[eventType] || 'TerraLend System';
}

/**
 * Get audit logs with optional filtering
 * 
 * @param {Object} options - Filter options
 * @returns {Array} Filtered audit logs
 */
export function getAuditLogs(options = {}) {
    let logs = [...auditLogs];

    // Filter by loan ID
    if (options.loanId) {
        logs = logs.filter(log => log.loanId === options.loanId);
    }

    // Filter by event type
    if (options.eventType) {
        logs = logs.filter(log => log.eventType === options.eventType);
    }

    // Filter by date range
    if (options.startDate) {
        const startDate = new Date(options.startDate);
        logs = logs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (options.endDate) {
        const endDate = new Date(options.endDate);
        logs = logs.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Limit results
    const limit = options.limit || 50;
    logs = logs.slice(0, limit);

    return logs;
}

/**
 * Verify a transaction hash exists
 * 
 * @param {string} txHash - Transaction hash to verify
 * @returns {Object|null} Transaction record or null
 */
export function verifyTransaction(txHash) {
    const record = auditLogs.find(log => log.txHash === txHash);

    if (!record) {
        return null;
    }

    return {
        ...record,
        verified: true,
        verificationTimestamp: new Date().toISOString(),
    };
}

/**
 * Get blockchain statistics
 * 
 * @returns {Object} Blockchain stats
 */
export function getBlockchainStats() {
    return {
        totalRecords: auditLogs.length,
        latestBlock: blockNumber,
        chainName: 'TerraLend Demo Chain',
        networkId: 'demo-001',
        consensusType: 'Simulated PoS',
        avgBlockTime: '2 seconds',
        isSimulated: true,
    };
}

/**
 * Seed initial demo data
 */
export function seedDemoData() {
    const demoEvents = [
        {
            eventType: 'loan_disbursement',
            loanId: 'TL-2025-001',
            description: 'Loan disbursed: ₹15,00,000 for Solar Installation',
        },
        {
            eventType: 'verification_complete',
            loanId: 'TL-2025-001',
            description: 'AI Verification completed: Green Score 82 (High Impact)',
        },
        {
            eventType: 'greenwashing_check',
            loanId: 'TL-2025-001',
            description: 'Greenwashing check passed: Authenticity Score 95%',
        },
        {
            eventType: 'impact_update',
            loanId: 'TL-2024-042',
            description: 'Monthly impact recorded: 1,800 kg CO₂ saved',
        },
        {
            eventType: 'payment_received',
            loanId: 'TL-2025-001',
            description: 'EMI payment received: ₹45,000',
        },
    ];

    demoEvents.forEach((event, index) => {
        // Stagger timestamps for realism
        setTimeout(() => recordEvent(event), index * 100);
    });
}

// Seed demo data on module load
seedDemoData();

export default {
    recordEvent,
    getAuditLogs,
    verifyTransaction,
    getBlockchainStats,
};
