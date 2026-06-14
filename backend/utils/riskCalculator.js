const db = require("../config/db");

// Data-driven approach uses dynamic max_score per disease from DB
// Base risk (%) granted simply for having a known condition selected in Setup
// Reduced to 0 so the risk can be highly dynamic and fall to 'Low' if no symptoms are logged.
const BASE_RISK_FOR_KNOWN_CONDITION = 0;

/**
 * Clamps a value to [0, 100] and rounds it.
 */
const clamp = (value) => Math.max(0, Math.min(Math.round(value), 100));

/**
 * Checks whether a user's menstrual cycle length is irregular.
 * A cycle is considered irregular if it's < 21 days or > 35 days.
 * Returns false (no irregularity penalty) when cycle data is unavailable.
 */
const getCycleIrregularity = async (userId) => {
    try {
        if (!userId) return false;
        const [rows] = await db.promise().query(
            "SELECT cycle_length FROM user_profile WHERE user_id = ? LIMIT 1",
            [userId]
        );
        if (rows.length === 0 || rows[0].cycle_length == null) return false;
        const len = Number(rows[0].cycle_length);
        return len < 21 || len > 35;
    } catch {
        return false;
    }
};

/**
 * Fetches the known condition selected by the user during Setup.
 * Returns a normalised lowercase string, e.g. "pcos", "thyroid", "endometriosis",
 * or null if nothing was selected.
 */
const getKnownCondition = async (userId) => {
    try {
        if (!userId) return null;
        const [rows] = await db.promise().query(
            "SELECT known_condition FROM user_profile WHERE user_id = ? LIMIT 1",
            [userId]
        );
        if (rows.length === 0 || !rows[0].known_condition) return null;
        return rows[0].known_condition.trim().toLowerCase();
    } catch {
        return null;
    }
};

/**
 * Returns true if a disease name matches the user's known condition.
 * Handles common aliases: pcos / pcod / polycystic ovarian disease → "pcos".
 */
const matchesKnownCondition = (diseaseName, knownCondition) => {
    if (!diseaseName || !knownCondition) return false;
    const dn = diseaseName.toLowerCase();
    const kc = knownCondition.toLowerCase();

    // Normalise PCOS / PCOD aliases
    const pcosAliases = ["pcos", "pcod", "polycystic ovarian disease", "polycystic ovary syndrome"];
    const dnIsPcos = pcosAliases.some(a => dn.includes(a));
    const kcIsPcos = pcosAliases.some(a => kc.includes(a));
    if (dnIsPcos && kcIsPcos) return true;

    // Exact or substring match for Thyroid, Endometriosis, etc.
    return dn.includes(kc) || kc.includes(dn);
};

/**
 * Calculates disease risk percentages based on symptom IDs and user profile.
 *
 * Logic:
 *  - If user has a known condition  → base risk of 40%
 *  - If symptoms are logged         → symptom risk scaled to max 60%, added to base
 *  - Total is clamped to [0, 100]
 *  - If no condition AND no symptoms → 0%
 *  - If symptoms but no known condition → pure symptom score (0–100%)
 *
 * @param {Array}  symptomIds - Array of logged symptom IDs.
 * @param {number} userId     - ID of the current user.
 * @param {Object} logData    - Optional health log data containing stress_level, sleep_hours, weight.
 * @returns {Promise<Array>}  - Array of { disease, riskPercentage } objects.
 */
const calculateRisk = async (symptomIds, userId = null, logData = null) => {
    const hasSymptoms = symptomIds && symptomIds.length > 0;

    // Fetch profile data once (known condition + cycle irregularity) in parallel
    const [knownCondition, isCycleIrregular] = await Promise.all([
        getKnownCondition(userId),
        getCycleIrregularity(userId),
    ]);

    try {
        // 1. Fetch all diseases and their maximum possible weighted scores
        const [maxRows] = await db.promise().query(`
            SELECT d.disease_name, SUM(w.weight) AS max_score,
                   COUNT(w.symptom_id) AS total_symptoms
            FROM diseases d
            JOIN disease_symptom_weights w ON d.disease_id = w.disease_id
            GROUP BY d.disease_id
        `);

        // 2. If no symptoms logged → base risk only (40% for known condition, 0% otherwise)
        if (!hasSymptoms) {
            return maxRows.map(row => ({
                disease: row.disease_name,
                riskPercentage: matchesKnownCondition(row.disease_name, knownCondition)
                    ? BASE_RISK_FOR_KNOWN_CONDITION
                    : 0,
            }));
        }

        // 3. Fetch weighted scores for the selected symptoms per disease
        const [scoreRows] = await db.promise().query(`
            SELECT d.disease_name, SUM(w.weight) AS obtained_score
            FROM diseases d
            JOIN disease_symptom_weights w ON d.disease_id = w.disease_id
            WHERE w.symptom_id IN (?)
            GROUP BY d.disease_id
        `, [symptomIds]);

        const maxScoreMap = Object.fromEntries(
            maxRows.map(r => [r.disease_name, { max_score: r.max_score, total_symptoms: r.total_symptoms }])
        );

        // 4. Calculate combined risk for each disease that had matched symptoms
        const riskMap = {};
        for (const row of scoreRows) {
            const info = maxScoreMap[row.disease_name];
            const maxScore = (info?.max_score) || 1;
            const diseaseName = row.disease_name.toLowerCase();
            const isKnown = matchesKnownCondition(row.disease_name, knownCondition);

            // 40-pt base from known condition; 0 otherwise
            const baseRisk = isKnown ? BASE_RISK_FOR_KNOWN_CONDITION : 0;

            // Standard ratio-based normalization for all diseases based on data-driven weights
            const rawRatio = Math.min(row.obtained_score / maxScore, 1);
            
            // Add a slight penalty for cycle irregularity for reproductive conditions
            const cyclePenalty = (isCycleIrregular && (diseaseName.includes("pcos") || diseaseName.includes("pcod") || diseaseName.includes("endometriosis"))) ? 15 : 0;
            
            symptomRisk = (rawRatio * 100);
            symptomRisk = Math.min(symptomRisk + cyclePenalty, 100);

            // Apply lifestyle penalty
            let lifestylePenalty = 0;
            if (logData) {
                if (logData.stress_level > 7) lifestylePenalty += 5;
                if (logData.sleep_hours && logData.sleep_hours < 6) lifestylePenalty += 5;
                if (logData.mood && logData.mood.toLowerCase() === 'low') lifestylePenalty += 5;
            }

            riskMap[row.disease_name] = clamp(baseRisk + symptomRisk + lifestylePenalty);
        }

        // 5. Build final list — diseases with no symptom match still get base risk if known
        const allRisks = maxRows.map(row => ({
            disease: row.disease_name,
            riskPercentage: riskMap[row.disease_name] ??
                (matchesKnownCondition(row.disease_name, knownCondition)
                    ? BASE_RISK_FOR_KNOWN_CONDITION
                    : 0),
        }));

        // 6. Deduplicate by disease name, keeping the highest percentage
        const seen = new Map();
        for (const entry of allRisks) {
            const existing = seen.get(entry.disease);
            if (!existing || entry.riskPercentage > existing.riskPercentage) {
                seen.set(entry.disease, entry);
            }
        }

        return Array.from(seen.values());
    } catch (err) {
        console.error("Risk Calculator Utility Error:", err.message);
        throw err;
    }
};

module.exports = { calculateRisk };
