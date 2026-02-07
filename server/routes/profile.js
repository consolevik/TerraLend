/**
 * Profile Routes
 * 
 * Handles business profile and KYC data management.
 */

import express from 'express';
import BusinessProfile from '../models/BusinessProfile.js';
import KYC from '../models/KYC.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/profile
 * Save or update business profile and KYC data
 */
router.post('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            // Business Profile fields
            gstNumber,
            businessName,
            businessType,
            annualTurnover,
            yearsInBusiness,
            gstVerified,

            // KYC fields
            ownerName,
            panNumber,
            aadhaarNumber,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            kycVerified
        } = req.body;

        // Update or create Business Profile
        let businessProfile = await BusinessProfile.findOne({ user: userId });

        if (businessProfile) {
            // Update existing
            businessProfile.gstNumber = gstNumber || businessProfile.gstNumber;
            businessProfile.businessName = businessName || businessProfile.businessName;
            businessProfile.businessType = businessType || businessProfile.businessType;
            businessProfile.annualTurnover = annualTurnover || businessProfile.annualTurnover;
            businessProfile.yearsInBusiness = yearsInBusiness || businessProfile.yearsInBusiness;
            businessProfile.address = address || businessProfile.address;
            businessProfile.city = city || businessProfile.city;
            businessProfile.state = state || businessProfile.state;
            businessProfile.pincode = pincode || businessProfile.pincode;
            businessProfile.gstVerified = gstVerified || businessProfile.gstVerified;
            await businessProfile.save();
        } else {
            // Create new
            businessProfile = await BusinessProfile.create({
                user: userId,
                gstNumber,
                businessName,
                businessType,
                annualTurnover,
                yearsInBusiness,
                address,
                city,
                state,
                pincode,
                gstVerified
            });
        }

        // Update or create KYC
        let kyc = await KYC.findOne({ user: userId });

        if (kyc) {
            // Update existing
            kyc.ownerName = ownerName || kyc.ownerName;
            kyc.panNumber = panNumber || kyc.panNumber;
            kyc.aadhaarNumber = aadhaarNumber || kyc.aadhaarNumber;
            kyc.email = email || kyc.email;
            kyc.phone = phone || kyc.phone;
            kyc.address = address || kyc.address;
            kyc.city = city || kyc.city;
            kyc.state = state || kyc.state;
            kyc.pincode = pincode || kyc.pincode;
            if (kycVerified) {
                kyc.verified = true;
                kyc.verifiedAt = new Date();
            }
            await kyc.save();
        } else {
            // Create new
            kyc = await KYC.create({
                user: userId,
                ownerName,
                panNumber,
                aadhaarNumber,
                email,
                phone,
                address,
                city,
                state,
                pincode,
                verified: kycVerified || false,
                verifiedAt: kycVerified ? new Date() : null
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            businessProfile,
            kyc
        });
    } catch (error) {
        console.error('[Profile] Update error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update profile'
        });
    }
});

/**
 * GET /api/profile
 * Get user's business profile and KYC data
 */
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const businessProfile = await BusinessProfile.findOne({ user: userId });
        const kyc = await KYC.findOne({ user: userId });

        res.json({
            success: true,
            businessProfile,
            kyc
        });
    } catch (error) {
        console.error('[Profile] Get error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

export default router;
