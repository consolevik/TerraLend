/**
 * Mock Data API Routes
 * Simulates GST and KYC API integrations
 * 
 * ⚠️ DEMO ONLY - In production, integrate with actual:
 * - GST Portal API
 * - DigiLocker for KYC
 * - UIDAI Aadhaar verification
 */

import express from 'express';

const router = express.Router();

/**
 * POST /api/mock/gst
 * Simulate GST data fetch
 */
router.post('/gst', async (req, res) => {
    try {
        const { gstNumber } = req.body;

        if (!gstNumber || gstNumber.length < 15) {
            return res.status(400).json({
                error: 'Invalid GST number',
                message: 'GST number must be 15 characters',
            });
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return mock business data
        const mockData = {
            gstNumber,
            businessName: 'Green Energy Solutions Pvt Ltd',
            businessType: 'pvt_ltd',
            annualTurnover: '5000000',
            legalName: 'Green Energy Solutions Private Limited',
            tradeName: 'Green Energy Solutions',
            registrationDate: '2019-04-15',
            status: 'Active',
            address: '123 Industrial Area, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400093',
            stateCode: '27',
            verified: true,
            fetchedAt: new Date().toISOString(),
        };

        res.json(mockData);
    } catch (error) {
        console.error('Error in GST mock:', error);
        res.status(500).json({ error: 'Failed to fetch GST data' });
    }
});

/**
 * POST /api/mock/kyc
 * Simulate KYC verification
 */
router.post('/kyc', async (req, res) => {
    try {
        const { panNumber, aadhaarNumber } = req.body;

        if (!panNumber || !aadhaarNumber) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'PAN and Aadhaar numbers are required',
            });
        }

        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return mock verification result
        const result = {
            verified: true,
            panVerified: true,
            aadhaarVerified: true,
            nameMatch: true,
            name: 'Rajesh Kumar',
            panStatus: 'Valid',
            aadhaarStatus: 'Valid',
            verifiedAt: new Date().toISOString(),
            verificationId: `KYC-${Date.now()}`,
        };

        res.json(result);
    } catch (error) {
        console.error('Error in KYC mock:', error);
        res.status(500).json({ error: 'KYC verification failed' });
    }
});

export default router;
