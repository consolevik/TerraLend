/**
 * Loan Application Model
 * 
 * Core transactional schema for green loan applications.
 * Tracks green objectives, loan details, status, and AI scoring.
 */

import mongoose from 'mongoose';

const LoanApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loanId: {
        type: String,
        unique: true
    },

    // Business snapshot (denormalized for historical accuracy)
    businessName: {
        type: String,
        trim: true
    },
    businessType: {
        type: String,
        enum: ['proprietorship', 'partnership', 'pvt_ltd', 'llp']
    },
    gstNumber: {
        type: String,
        trim: true
    },
    annualTurnover: {
        type: Number
    },
    yearsInBusiness: {
        type: Number
    },

    // Green Objective
    greenObjective: {
        type: String,
        enum: ['solar', 'ev', 'waste', 'water', 'agriculture', 'efficiency'],
        required: [true, 'Green objective is required']
    },
    projectDescription: {
        type: String,
        trim: true
    },
    estimatedSavings: {
        type: Number,
        min: 0
    },
    projectLocation: {
        type: String,
        trim: true
    },
    locationCoordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },

    // Loan Details
    loanAmount: {
        type: Number,
        required: [true, 'Loan amount is required'],
        min: [100000, 'Minimum loan amount is ₹1,00,000'],
        max: [50000000, 'Maximum loan amount is ₹5,00,00,000']
    },
    tenure: {
        type: Number,
        enum: [12, 24, 36, 48, 60],
        required: [true, 'Loan tenure is required']
    },
    purpose: {
        type: String,
        trim: true
    },

    // Status and AI Score
    status: {
        type: String,
        enum: ['pending', 'pending_verification', 'approved', 'rejected', 'cancelled', 'active', 'completed'],
        default: 'pending_verification'
    },
    aiScore: {
        type: Number,
        min: 0,
        max: 100
    },
    sustainabilityClass: {
        type: String,
        enum: ['low', 'medium', 'high']
    },

    // Disbursement & Payment tracking
    disbursedDate: {
        type: Date
    },
    nextPayment: {
        type: Date
    },
    nextPaymentAmount: {
        type: Number
    },
    repaymentProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Timestamps
    appliedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate loan ID before saving
LoanApplicationSchema.pre('save', async function (next) {
    this.updatedAt = Date.now();

    if (!this.loanId) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('LoanApplication').countDocuments();
        this.loanId = `TL-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

// Index for faster queries
LoanApplicationSchema.index({ user: 1, status: 1 });
LoanApplicationSchema.index({ loanId: 1 });

export default mongoose.model('LoanApplication', LoanApplicationSchema);
