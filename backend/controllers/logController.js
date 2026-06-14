const db = require("../config/db");

// @desc    Create daily health log
// @route   POST /api/logs
// @access  Private
exports.createHealthLog = async (req, res) => {
    const userId = req.user.id;
    const { mood, sleep_hours, stress_level, weight, step_count, symptomIds } = req.body;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    try {
        // 1. Check if a log already exists for today
        const [existing] = await db.promise().query(
            "SELECT log_id FROM health_logs WHERE user_id = ? AND date = ?",
            [userId, today]
        );

        let logId;
        if (existing.length > 0) {
            logId = existing[0].log_id;
            // Update existing log
            await db.promise().query(
                `UPDATE health_logs SET mood = ?, sleep_hours = ?, stress_level = ?, weight = ?, step_count = ? WHERE log_id = ?`,
                [mood, sleep_hours, stress_level, weight, step_count, logId]
            );
            // Clear existing symptoms for this log
            await db.promise().query("DELETE FROM user_symptom_logs WHERE log_id = ?", [logId]);
        } else {
            // Insert new log
            const [logResult] = await db.promise().query(
                `INSERT INTO health_logs (user_id, date, mood, sleep_hours, stress_level, weight, step_count) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, today, mood, sleep_hours, stress_level, weight, step_count]
            );
            logId = logResult.insertId;
        }

        // 2. Insert into user_symptom_logs if symptoms are provided
        if (symptomIds && Array.isArray(symptomIds) && symptomIds.length > 0) {
            const symptomData = symptomIds.map(symptomId => [logId, symptomId]);
            await db.promise().query(
                "INSERT INTO user_symptom_logs (log_id, symptom_id) VALUES ?",
                [symptomData]
            );
        }

        res.status(201).json({
            message: "Daily log saved successfully"
        });
    } catch (err) {
        console.error("Health Log Error:", err.message);
        res.status(500).json({ message: "Server error during health log submission" });
    }
};

// @desc    Get health logs for the last 7 days
// @route   GET /api/logs/weekly
// @access  Private
exports.getWeeklyLogs = async (req, res) => {
    const userId = req.user.id;
    try {
        const [logs] = await db.promise().query(
            `SELECT date, mood, sleep_hours, stress_level, weight, step_count 
             FROM health_logs 
             WHERE user_id = ? 
             AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             ORDER BY date ASC`,
            [userId]
        );
        res.json(logs);
    } catch (err) {
        console.error("Weekly Log Fetch Error:", err.message);
        res.status(500).json({ message: "Server error fetching weekly logs" });
    }
};
