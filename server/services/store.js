/**
 * In-Memory Data Store for Demo Mode
 * 
 * Stores data when MongoDB is unavailable.
 * This acts as a centralized database for the in-memory fallback.
 */

export const localUsers = [];
export const localLoans = [];

// Helper to find user by ID
export const getLocalUserById = (id) => localUsers.find(u => u._id === id);
