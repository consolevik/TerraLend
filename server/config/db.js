/**
 * MongoDB Database Connection
 * 
 * Connects to MongoDB using Mongoose with connection pooling
 * and proper error handling.
 */

import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout fast if no DB
        });

        isConnected = true;
        console.log(`[MongoDB] Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('[MongoDB] Connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[MongoDB] Disconnected');
            isConnected = false;
        });

        return conn;
    } catch (error) {
        console.error('[MongoDB] Connection failed:', error.message);
        console.warn('[System] Switching to In-Memory Mode (Demo)');
        isConnected = false;
        // Do NOT exit process
    }
};

export const isDbConnected = () => isConnected;
export default connectDB;
