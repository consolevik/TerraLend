/**
 * Business Profile Model
 * 
 * Stores business details linked to a user.
 * Data can be auto-fetched from GST records.
 */

import mongoose from 'mongoose';

const BusinessProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    gstNumber: {
        type: String,
        trim: true,
        uppercase: true,
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format']
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true
    },
    businessType: {
        type: String,
        enum: ['proprietorship', 'partnership', 'pvt_ltd', 'llp'],
        required: [true, 'Business type is required']
    },
    annualTurnover: {
        type: Number,
        min: 0
    },
    yearsInBusiness: {
        type: Number,
        min: 0
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
    gstVerified: {
        type: Boolean,
        default: false
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
BusinessProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('BusinessProfile', BusinessProfileSchema);
