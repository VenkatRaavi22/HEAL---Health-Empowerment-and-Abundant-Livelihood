const db = require("../config/db");
const { calculateRisk } = require("../utils/riskCalculator");

// @desc    Get risk analysis based on latest health log
// @route   GET /api/risk/latest
// @access  Private
exports.getLatestRisk = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Get the latest health log for the user
        const [logRows] = await db.promise().query(
            "SELECT log_id, stress_level, sleep_hours, weight, mood FROM health_logs WHERE user_id = ? ORDER BY date DESC, log_id DESC LIMIT 1",
            [userId]
        );

        if (logRows.length === 0) {
            // If no logs found, calculate risk based purely on known condition profile
            const risks = await calculateRisk([], userId, null);
            const topRisks = risks
                .sort((a, b) => b.riskPercentage - a.riskPercentage)
                .slice(0, 3);
            return res.json({ riskAnalysis: topRisks });
        }

        const latestLog = logRows[0];
        const latestLogId = latestLog.log_id;

        // 2. Get symptoms associated with this log
        const [symptomRows] = await db.promise().query(
            "SELECT symptom_id FROM user_symptom_logs WHERE log_id = ?",
            [latestLogId]
        );

        const symptomIds = symptomRows.map(s => s.symptom_id);

        // 3. Calculate risk using utility
        const risks = await calculateRisk(symptomIds, userId, latestLog);

        // 4. Sort and return top 3
        const topRisks = risks
            .sort((a, b) => b.riskPercentage - a.riskPercentage)
            .slice(0, 3);

        res.json({ riskAnalysis: topRisks });
    } catch (err) {
        console.error("Risk Controller Error:", err.message);
        res.status(500).json({ message: "Server error during risk calculation" });
    }
};
