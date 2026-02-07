/**
 * KYC Model
 * 
 * Stores Know Your Customer verification data.
 * Includes owner info, PAN, Aadhaar, and contact details.
 */

import mongoose from 'mongoose';

const KYCSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    ownerName: {
        type: String,
        required: [true, 'Owner name is required'],
        trim: true
    },
    panNumber: {
        type: String,
        required: [true, 'PAN number is required'],
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
    },
    aadhaarNumber: {
        type: String,
        required: [true, 'Aadhaar number is required'],
        trim: true,
        match: [/^[2-9]{1}[0-9]{11}$/, 'Invalid Aadhaar format']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^(\+91)?[6-9][0-9]{9}$/, 'Invalid phone number']
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true,
        match: [/^[1-9][0-9]{5}$/, 'Invalid pincode']
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
KYCSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('KYC', KYCSchema);
