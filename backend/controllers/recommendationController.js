const db = require("../config/db");
const { calculateRisk } = require("../utils/riskCalculator");

// @desc    Get personalized recommendations by disease name
// @route   GET /api/recommendations/:diseaseName
// @access  Private
exports.getRecommendationsByDisease = async (req, res) => {
    const { diseaseName } = req.params;
    const userId = req.user.id;

    try {
        // 1. Get the user's latest health log ID
        const [logRows] = await db.promise().query(
            "SELECT log_id FROM health_logs WHERE user_id = ? ORDER BY date DESC, log_id DESC LIMIT 1",
            [userId]
        );

        let riskPercentage = 0;
        if (logRows.length > 0) {
            const latestLogId = logRows[0].log_id;

            // 2. Get symptoms associated with this log
            const [symptomRows] = await db.promise().query(
                "SELECT symptom_id FROM user_symptom_logs WHERE log_id = ?",
                [latestLogId]
            );

            const symptomIds = symptomRows.map(s => s.symptom_id);

            // 3. Calculate risk for the requested disease
            const risks = await calculateRisk(symptomIds);
            const diseaseRisk = risks.find(r => r.disease.toLowerCase() === diseaseName.toLowerCase());
            riskPercentage = diseaseRisk ? diseaseRisk.riskPercentage : 0;
        }

        // 4. Determine risk level
        let riskLevel = "low";
        if (riskPercentage > 70) {
            riskLevel = "high";
        } else if (riskPercentage > 30) {
            riskLevel = "moderate";
        }

        // 5. Fetch recommendations filtered by disease and risk_level
        const [recoRows] = await db.promise().query(
            "SELECT category, title, description, image_url FROM recommendations WHERE disease_name = ? AND risk_level = ?",
            [diseaseName, riskLevel]
        );

        // 6. Group recommendations by category
        const grouped = {
            yoga: [],
            exercise: [],
            diet: [],
            ayurveda: []
        };

        recoRows.forEach(row => {
            if (grouped[row.category]) {
                grouped[row.category].push({
                    title: row.title,
                    description: row.description,
                    image_url: row.image_url
                });
            }
        });

        res.json({
            disease: diseaseName,
            riskLevel: riskLevel,
            recommendations: grouped
        });

    } catch (err) {
        console.error("Recommendation Personalization Error:", err.message);
        res.status(500).json({ message: "Server error during recommendation selection" });
    }
};
