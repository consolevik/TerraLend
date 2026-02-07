/**
 * TerraLend API Service
 * 
 * Centralized API communication layer with authentication support.
 * All API calls use the VITE_API_BASE_URL environment variable.
 * 
 * NOTE: This connects to a demo backend with simulated AI and blockchain.
 * In production, these would connect to real AI/ML services and blockchain networks.
 */

// API Base URL from environment variable - never hardcoded
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Token storage key
const TOKEN_KEY = 'terralend_token';
const USER_KEY = 'terralend_user';

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Get stored auth token
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store auth token
 */
export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove auth token (logout)
 */
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get stored user data
 */
export function getStoredUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!getToken();
}

// ============================================
// BASE API REQUEST
// ============================================

/**
 * Base fetch wrapper with error handling and auth
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle unauthorized (token expired)
            if (response.status === 401) {
                removeToken();
            }

            throw new ApiError(
                errorData.error || errorData.message || `API Error: ${response.status}`,
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network or other errors
        throw new ApiError(
            'Network error. Please check your connection and try again.',
            0,
            { originalError: error.message }
        );
    }
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 */
export async function register(email, password) {
    const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
        setToken(response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 */
export async function login(email, password) {
    const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
        setToken(response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
}

/**
 * Logout user
 */
export function logout() {
    removeToken();
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
    return apiRequest('/api/auth/me');
}

// ============================================
// PROFILE ENDPOINTS
// ============================================

/**
 * Save or update user profile (business + KYC)
 * @param {Object} profileData - Profile data
 */
export async function saveProfile(profileData) {
    return apiRequest('/api/profile', {
        method: 'POST',
        body: JSON.stringify(profileData),
    });
}

/**
 * Get user's profile data
 */
export async function getProfile() {
    return apiRequest('/api/profile');
}

// ============================================
// LOAN API ENDPOINTS
// ============================================

/**
 * Submit a new loan application
 * @param {Object} loanData - Loan application data
 */
export async function submitLoanApplication(loanData) {
    return apiRequest('/api/loans', {
        method: 'POST',
        body: JSON.stringify(loanData),
    });
}

/**
 * Get all loans for current user
 * @param {string} status - Optional status filter
 */
export async function getLoans(status = null) {
    const endpoint = status ? `/api/loans?status=${status}` : '/api/loans';
    return apiRequest(endpoint);
}

/**
 * Get loan details by ID
 * @param {string} loanId - Loan ID
 */
export async function getLoanById(loanId) {
    return apiRequest(`/api/loans/${loanId}`);
}

/**
 * Get all loans for a user (legacy compatibility)
 * @param {string} userId - User ID
 * @param {string} role - User role (borrower, lender, regulator)
 */
export async function getUserLoans(userId, role = 'borrower') {
    return apiRequest(`/api/loans/user/${userId}?role=${role}`);
}

// ============================================
// VERIFICATION API ENDPOINTS
// ============================================

/**
 * Initiate AI-powered green scoring verification
 * @param {string} loanId - Loan ID to verify
 */
export async function initiateVerification(loanId) {
    return apiRequest('/api/verify/green-score', {
        method: 'POST',
        body: JSON.stringify({ loanId }),
    });
}

/**
 * Get verification status for a loan
 * @param {string} loanId - Loan ID
 */
export async function getVerificationStatus(loanId) {
    return apiRequest(`/api/verify/status/${loanId}`);
}

/**
 * Run greenwashing check
 * @param {string} loanId - Loan ID
 */
export async function runGreenwashingCheck(loanId) {
    return apiRequest('/api/verify/greenwashing', {
        method: 'POST',
        body: JSON.stringify({ loanId }),
    });
}

// ============================================
// IMPACT API ENDPOINTS
// ============================================

/**
 * Get impact metrics for a loan
 * @param {string} loanId - Loan ID
 */
export async function getImpactMetrics(loanId) {
    return apiRequest(`/api/impact/${loanId}`);
}

/**
 * Get aggregated impact metrics for user's portfolio
 * @param {string} userId - User ID
 */
export async function getPortfolioImpact(userId) {
    return apiRequest(`/api/impact/portfolio/${userId}`);
}

/**
 * Generate impact report PDF
 * @param {string} loanId - Loan ID
 */
export async function generateImpactReport(loanId) {
    return apiRequest(`/api/impact/report/${loanId}`);
}

// ============================================
// BLOCKCHAIN AUDIT ENDPOINTS
// ============================================

/**
 * Get blockchain audit logs
 * @param {string} loanId - Optional loan ID filter
 */
export async function getAuditLogs(loanId = null) {
    const endpoint = loanId
        ? `/api/blockchain/audit/${loanId}`
        : '/api/blockchain/audit';
    return apiRequest(endpoint);
}

/**
 * Verify a transaction hash
 * @param {string} txHash - Transaction hash
 */
export async function verifyTransaction(txHash) {
    return apiRequest(`/api/blockchain/verify/${txHash}`);
}

// ============================================
// MOCK DATA ENDPOINTS (for GST/KYC simulation)
// ============================================

/**
 * Simulate GST data fetch
 * @param {string} gstNumber - GST registration number
 */
export async function fetchGSTData(gstNumber) {
    return apiRequest('/api/mock/gst', {
        method: 'POST',
        body: JSON.stringify({ gstNumber }),
    });
}

/**
 * Simulate KYC verification
 * @param {Object} kycData - KYC details
 */
export async function verifyKYC(kycData) {
    return apiRequest('/api/mock/kyc', {
        method: 'POST',
        body: JSON.stringify(kycData),
    });
}

// ============================================
// CLIMATE RISK ENDPOINTS
// ============================================

/**
 * Get climate risk assessment for a location
 * @param {Object} location - Location details
 */
export async function getClimateRisk(location) {
    return apiRequest('/api/climate/risk', {
        method: 'POST',
        body: JSON.stringify(location),
    });
}

export { ApiError };
