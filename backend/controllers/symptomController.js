const db = require("../config/db");

// @desc    Get all symptoms
// @route   GET /api/symptoms
// @access  Private
exports.getSymptoms = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM master_symptoms");
        res.json(rows);
    } catch (err) {
        console.error("Fetch Symptoms Error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Analyze symptoms and calculate risk
// @route   POST /api/symptoms/analyze
// @access  Private
exports.analyzeSymptoms = async (req, res) => {
    const { symptomIds } = req.body;

    if (!symptomIds || !Array.isArray(symptomIds) || symptomIds.length === 0) {
        return res.status(400).json({ message: "Please select at least one symptom" });
    }

    try {
        // 1. Get total weights per disease for the SELECTED symptoms
        const [scoreRows] = await db.promise().query(`
      SELECT d.disease_name, SUM(w.weight) as obtained_score
      FROM diseases d
      JOIN disease_symptom_weights w ON d.disease_id = w.disease_id
      WHERE w.symptom_id IN (?)
      GROUP BY d.disease_id
    `, [symptomIds]);

        // 2. Get MAX POSSIBLE weight per disease (sum of all weights for that disease)
        const [maxRows] = await db.promise().query(`
      SELECT d.disease_name, SUM(w.weight) as max_score
      FROM diseases d
      JOIN disease_symptom_weights w ON d.disease_id = w.disease_id
      GROUP BY d.disease_id
    `);

        // Create a map for max scores
        const maxScoreMap = Object.fromEntries(maxRows.map(r => [r.disease_name, r.max_score]));

        // 3. Calculate risk percentage
        const results = scoreRows.map(row => {
            const maxScore = maxScoreMap[row.disease_name] || 1;
            const riskPercentage = Math.round((row.obtained_score / maxScore) * 100);
            return {
                disease: row.disease_name,
                riskPercentage: riskPercentage
            };
        });

        // 4. Sort and get top 3
        const topResults = results
            .sort((a, b) => b.riskPercentage - a.riskPercentage)
            .slice(0, 3);

        res.json({ riskAnalysis: topResults });
    } catch (err) {
        console.error("Analysis Error:", err.message);
        res.status(500).json({ message: "Server error during risk analysis" });
    }
};
