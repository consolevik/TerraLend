/**
 * AI Extraction Service
 * 
 * ============================================
 * ⚠️ SIMULATION NOTICE
 * ============================================
 * 
 * This service provides sustainability claim extraction from free-text input.
 * It supports two modes:
 * 
 * 1. MOCK MODE (Default / Demo): Uses deterministic regex-based parsing
 * 2. LLM MODE: Uses configured LLM API for intelligent extraction
 * 
 * The mock mode ensures hackathon reliability, offline demos, and no runtime failures.
 * Both modes return identical JSON schema for seamless integration.
 * ============================================
 */

// LLM System Prompt for real API integration
export const LLM_SYSTEM_PROMPT = `You are an AI assistant helping extract structured sustainability data
from borrower-provided text.

TASK:
Extract factual project details from the input text.
Return ONLY valid JSON. Do not add explanations.

RULES:
- Do NOT invent or assume data.
- If a value is missing or unclear, return null.
- Do NOT validate claims.
- Do NOT assign scores or approvals.
- Extract only what is explicitly stated.

FIELDS TO EXTRACT:
- project_type (solar | ev | waste | energy_efficiency | water | null)
- capacity_kw (number | null)
- vendor (string | null)
- certifications (array of strings | empty array)
- claimed_impact:
    - co2_saved_tonnes_per_year (number | null)
    - energy_generated_kwh_per_year (number | null)

OUTPUT FORMAT (JSON ONLY):
{
  "project_type": null,
  "capacity_kw": null,
  "vendor": null,
  "certifications": [],
  "claimed_impact": {
    "co2_saved_tonnes_per_year": null,
    "energy_generated_kwh_per_year": null
  }
}`;

/**
 * Check if LLM mode is enabled
 * @returns {boolean} True if LLM API is configured and demo mode is disabled
 */
export function isLLMEnabled() {
    const hasApiKey = !!process.env.LLM_API_KEY;
    const isDemoMode = process.env.DEMO_MODE === 'true';
    return hasApiKey && !isDemoMode;
}

/**
 * Extract sustainability claim using mock/deterministic parsing
 * Uses regex patterns to extract structured data from free text
 * 
 * @param {string} text - Free-text sustainability description
 * @returns {Object} Extracted claim in standard schema
 */
export function extractClaimMock(text) {
    const lower = text.toLowerCase();

    // Detect project type
    let project_type = null;
    if (lower.includes('solar') || lower.includes('photovoltaic') || lower.includes('pv panel')) {
        project_type = 'solar';
    } else if (lower.includes('ev') || lower.includes('electric vehicle') || lower.includes('charging station')) {
        project_type = 'ev';
    } else if (lower.includes('waste') || lower.includes('recycling') || lower.includes('composting')) {
        project_type = 'waste';
    } else if (lower.includes('energy efficiency') || lower.includes('led') || lower.includes('insulation') || lower.includes('hvac') || lower.includes('vrf') || lower.includes('variable refrigerant') || lower.includes('lighting system')) {
        project_type = 'energy_efficiency';
    } else if (lower.includes('water') || lower.includes('rainwater') || lower.includes('sewage') || lower.includes('irrigation')) {
        project_type = 'water';
    }

    // Extract capacity (kW)
    let capacity_kw = null;
    const capacityPatterns = [
        /(\d+(?:\.\d+)?)\s*kw/i,
        /(\d+(?:\.\d+)?)\s*kilowatt/i,
        /capacity\s*(?:of\s*)?(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*kw(?:p)?/i
    ];
    for (const pattern of capacityPatterns) {
        const match = text.match(pattern);
        if (match) {
            capacity_kw = Number(match[1]);
            break;
        }
    }

    // Detect vendor
    let vendor = null;
    const vendorPatterns = [
        { pattern: /tata\s*(?:power\s*)?solar/i, name: 'Tata Power Solar' },
        { pattern: /adani\s*(?:green|solar)?/i, name: 'Adani Solar' },
        { pattern: /waaree/i, name: 'Waaree Energies' },
        { pattern: /vikram\s*solar/i, name: 'Vikram Solar' },
        { pattern: /luminous/i, name: 'Luminous' },
        { pattern: /havells/i, name: 'Havells' },
        { pattern: /suzlon/i, name: 'Suzlon Energy' },
        { pattern: /renew\s*power/i, name: 'ReNew Power' },
        { pattern: /hero\s*(?:electric|future)/i, name: 'Hero Electric' },
        { pattern: /ather/i, name: 'Ather Energy' },
        { pattern: /ola\s*electric/i, name: 'Ola Electric' }
    ];
    for (const { pattern, name } of vendorPatterns) {
        if (pattern.test(text)) {
            vendor = name;
            break;
        }
    }

    // Extract certifications
    const certifications = [];
    const certPatterns = [
        { pattern: /iso\s*14001/i, name: 'ISO 14001' },
        { pattern: /iso\s*9001/i, name: 'ISO 9001' },
        { pattern: /leed/i, name: 'LEED' },
        { pattern: /griha/i, name: 'GRIHA' },
        { pattern: /igbc/i, name: 'IGBC' },
        { pattern: /bis/i, name: 'BIS Certified' },
        { pattern: /mnre\s*(?:approved|certified)/i, name: 'MNRE Approved' },
        { pattern: /bee\s*(?:star|rated|certified)/i, name: 'BEE Star Rated' }
    ];
    for (const { pattern, name } of certPatterns) {
        if (pattern.test(text)) {
            certifications.push(name);
        }
    }

    // Extract CO2 savings
    let co2_saved_tonnes_per_year = null;
    const co2Patterns = [
        /(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?)\s*(?:of\s*)?co2/i,
        /co2\s*(?:savings?|reduction|saved?)\s*(?:of\s*)?(\d+(?:\.\d+)?)/i,
        /save\s*(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?)/i,
        /reduce\s*(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?)/i,
        /(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?)\s*(?:carbon|co2)\s*(?:per\s*year|annually)?/i
    ];
    for (const pattern of co2Patterns) {
        const match = text.match(pattern);
        if (match) {
            co2_saved_tonnes_per_year = Number(match[1]);
            break;
        }
    }

    // Extract energy generation/savings
    let energy_generated_kwh_per_year = null;
    const energyPatterns = [
        /(\d+(?:,\d+)*(?:\.\d+)?)\s*kwh\s*(?:per\s*year|annually|\/\s*year)/i,
        /generate\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*kwh/i,
        /(\d+(?:,\d+)*(?:\.\d+)?)\s*kwh\s*(?:of\s*)?(?:electricity|energy|power)/i,
        /annual\s*(?:generation|output)\s*(?:of\s*)?(\d+(?:,\d+)*(?:\.\d+)?)\s*kwh/i,
        // New patterns for energy efficiency descriptions like "30,000 kWh/year"
        /(?:approx\.?|approximately)?\s*(\d+(?:,\d+)*)\s*kwh\s*\/\s*year/i,
        /reduce.*?(\d+(?:,\d+)*)\s*kwh/i,
        /(\d+(?:,\d+)*)\s*kwh[\s\/]*(?:per\s*)?(?:year|yr|annually)/i
    ];
    for (const pattern of energyPatterns) {
        const match = text.match(pattern);
        if (match) {
            // Remove commas and convert to number
            energy_generated_kwh_per_year = Number(match[1].replace(/,/g, ''));
            break;
        }
    }

    return {
        project_type,
        capacity_kw,
        vendor,
        certifications,
        claimed_impact: {
            co2_saved_tonnes_per_year,
            energy_generated_kwh_per_year
        }
    };
}

/**
 * Extract sustainability claim using LLM API
 * Falls back to mock extraction on failure
 * 
 * @param {string} text - Free-text sustainability description
 * @returns {Promise<Object>} Extracted claim in standard schema
 */
export async function extractClaimLLM(text) {
    try {
        // This is a placeholder for real LLM API integration
        // In production, you would call OpenAI, Anthropic, or other LLM APIs here

        const apiKey = process.env.LLM_API_KEY;
        const apiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
        const model = process.env.LLM_MODEL || 'gpt-3.5-turbo';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: LLM_SYSTEM_PROMPT },
                    { role: 'user', content: `INPUT TEXT:\n${text}` }
                ],
                temperature: 0,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response from LLM');
        }

        // Parse JSON from LLM response
        const parsed = JSON.parse(content);

        // Validate and normalize the response
        return {
            project_type: parsed.project_type || null,
            capacity_kw: parsed.capacity_kw || null,
            vendor: parsed.vendor || null,
            certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
            claimed_impact: {
                co2_saved_tonnes_per_year: parsed.claimed_impact?.co2_saved_tonnes_per_year || null,
                energy_generated_kwh_per_year: parsed.claimed_impact?.energy_generated_kwh_per_year || null
            }
        };
    } catch (error) {
        console.error('LLM extraction failed, falling back to mock:', error.message);
        return extractClaimMock(text);
    }
}

/**
 * Main extraction function - automatically selects mode
 * Uses LLM if configured, otherwise falls back to mock
 * 
 * @param {string} text - Free-text sustainability description
 * @returns {Promise<Object>} Extracted claim in standard schema
 */
export async function extractClaim(text) {
    if (isLLMEnabled()) {
        return await extractClaimLLM(text);
    }
    return extractClaimMock(text);
}

export default {
    extractClaim,
    extractClaimMock,
    extractClaimLLM,
    isLLMEnabled,
    LLM_SYSTEM_PROMPT
};
