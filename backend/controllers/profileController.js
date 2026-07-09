const db = require("../config/db");

// @desc    Setup or Update user profile
// @route   POST /api/profile/setup
// @access  Private
exports.setupProfile = async (req, res) => {
    const userId = req.user.id;
    const { age, height, weight, cycle_length, last_period_date, known_condition, medication } = req.body;

    try {
        // 1. Check if profile exists
        const [existingRows] = await db.promise().query(
            "SELECT * FROM user_profile WHERE user_id = ?",
            [userId]
        );

        if (existingRows.length > 0) {
            // 2a. Update existing profile
            await db.promise().query(
                `UPDATE user_profile 
         SET age = ?, height = ?, weight = ?, cycle_length = ?, last_period_date = ?, known_condition = ? 
         WHERE user_id = ?`,
                [age, height, weight, cycle_length, last_period_date, known_condition, userId]
            );
        } else {
            // 2b. Insert new profile
            await db.promise().query(
                `INSERT INTO user_profile (user_id, age, height, weight, cycle_length, last_period_date, known_condition) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, age, height, weight, cycle_length, last_period_date, known_condition]
            );
        }

        // Insert medication if provided
        if (medication && medication.trim() !== '') {
            await db.promise().query(
                "INSERT INTO medications (user_id, medicine_name, dosage, time, remaining_tablets, total_tablets) VALUES (?, ?, '1 dose', '08:00', 30, 30)",
                [userId, medication.trim()]
            );
        }

        // 3. Update profile_completed flag in users table
        await db.promise().query(
            "UPDATE users SET profile_completed = TRUE WHERE user_id = ?",
            [userId]
        );

        res.status(200).json({
            message: "Profile saved successfully",
            profileCompleted: true
        });
    } catch (err) {
        console.error("Profile Setup Error:", err.message);
        res.status(500).json({ message: "Server error during profile setup" });
    }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.promise().query(
            `SELECT u.name, u.email, p.* 
             FROM users u 
             LEFT JOIN user_profile p ON u.user_id = p.user_id 
             WHERE u.user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error("Get Profile Error:", err.message);
        res.status(500).json({ message: "Server error fetching profile" });
    }
};
