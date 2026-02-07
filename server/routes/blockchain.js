/**
 * Blockchain API Routes
 * Handles audit trail and transaction verification
 */

import express from 'express';
import { getAuditLogs, verifyTransaction, getBlockchainStats } from '../services/blockchainService.js';

const router = express.Router();

/**
 * GET /api/blockchain/audit
 * Get all audit logs
 */
router.get('/audit', async (req, res) => {
    try {
        const { loanId, eventType, limit } = req.query;

        const logs = getAuditLogs({
            loanId,
            eventType,
            limit: limit ? parseInt(limit) : 50,
        });

        res.json({
            logs,
            total: logs.length,
            blockchain: getBlockchainStats(),
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

/**
 * GET /api/blockchain/audit/:loanId
 * Get audit logs for a specific loan
 */
router.get('/audit/:loanId', async (req, res) => {
    try {
        const { loanId } = req.params;

        const logs = getAuditLogs({ loanId });

        res.json({
            loanId,
            logs,
            total: logs.length,
        });
    } catch (error) {
        console.error('Error fetching loan audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

/**
 * GET /api/blockchain/verify/:txHash
 * Verify a transaction by hash
 */
router.get('/verify/:txHash', async (req, res) => {
    try {
        const { txHash } = req.params;

        const result = verifyTransaction(txHash);

        if (!result) {
            return res.status(404).json({
                verified: false,
                error: 'Transaction not found',
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(500).json({ error: 'Failed to verify transaction' });
    }
});

/**
 * GET /api/blockchain/stats
 * Get blockchain statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = getBlockchainStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching blockchain stats:', error);
        res.status(500).json({ error: 'Failed to fetch blockchain stats' });
    }
});

export default router;
