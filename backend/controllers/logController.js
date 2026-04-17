const db = require("../config/db");

// @desc    Create daily health log
// @route   POST /api/logs
// @access  Private
exports.createHealthLog = async (req, res) => {
    const userId = req.user.id;
    const { mood, sleep_hours, stress_level, weight, step_count, symptomIds } = req.body;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    try {
        // 1. Insert into health_logs
        const [logResult] = await db.promise().query(
            `INSERT INTO health_logs (user_id, date, mood, sleep_hours, stress_level, weight, step_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, today, mood, sleep_hours, stress_level, weight, step_count]
        );

        const logId = logResult.insertId;

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
