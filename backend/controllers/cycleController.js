const db = require("../config/db");

// Helper to calculate cycle details
const calculateCycle = (profile, history) => {
    let cycleLength = 28;
    if (history && history.length > 0) {
        const lengths = history.map(h => h.cycle_length).filter(l => l > 0);
        if (lengths.length > 0) {
            cycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
        } else if (profile.cycle_length) {
            cycleLength = profile.cycle_length;
        }
    } else if (profile && profile.cycle_length) {
        cycleLength = profile.cycle_length;
    }

    const today = new Date();
    // Start of current cycle. If we have a history record for current ongoing period, use that.
    // Otherwise use last_period_date from profile
    let lastPeriodStart = profile && profile.last_period_date ? new Date(profile.last_period_date) : today;

    // Fast forward to the most recent cycle start if it's way in the past
    while (true) {
        let nextPeriodDate = new Date(lastPeriodStart);
        nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
        if (nextPeriodDate <= today) {
            lastPeriodStart = nextPeriodDate;
        } else {
            break;
        }
    }

    const diffTime = today.getTime() - lastPeriodStart.getTime();
    const cycleDay = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Phases
    // Menstrual: Days 1-5 (approx)
    // Follicular: Days 1-13 (overlaps Menstrual, but usually we consider post-menstrual)
    // Ovulation: Day 14 (if 28 day cycle, or cycleLength - 14)
    // Luteal: Day 15 to cycleLength

    const lutealPhaseLength = 14;
    const ovulationDay = Math.max(1, cycleLength - lutealPhaseLength);
    const menstrualDays = 5;

    let phase = 'Luteal';
    if (cycleDay <= menstrualDays) {
        phase = 'Menstrual';
    } else if (cycleDay < ovulationDay - 5) {
        phase = 'Follicular';
    } else if (cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay) {
        phase = 'Ovulation';
    } else {
        phase = 'Luteal';
    }

    return {
        cycleDay,
        cycleLength,
        phase,
        lastPeriodStart: lastPeriodStart.toISOString().slice(0, 10),
        ovulationDay
    };
};

exports.getStatus = async (req, res) => {
    const userId = req.user.id;
    try {
        const [profileRes] = await db.promise().query("SELECT * FROM user_profile WHERE user_id = ?", [userId]);
        const profile = profileRes[0] || {};
        
        const [history] = await db.promise().query(
            "SELECT * FROM period_history WHERE user_id = ? ORDER BY start_date DESC LIMIT 6",
            [userId]
        );

        const cycleData = calculateCycle(profile, history);

        res.json(cycleData);
    } catch (err) {
        console.error("Cycle Status Error:", err);
        res.status(500).json({ message: "Server error fetching cycle status" });
    }
};

exports.logPeriod = async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.body; // YYYY-MM-DD
    
    try {
        // Find if an active period exists
        const [existing] = await db.promise().query(
            "SELECT * FROM period_history WHERE user_id = ? ORDER BY start_date DESC LIMIT 1",
            [userId]
        );

        if (existing.length > 0 && existing[0].end_date == null && existing[0].start_date <= new Date(startDate)) {
            // Update existing
            await db.promise().query(
                "UPDATE period_history SET start_date = ?, end_date = ? WHERE id = ?",
                [startDate, endDate || null, existing[0].id]
            );
        } else {
            // Insert new. Calculate cycle_length for the PREVIOUS period if possible
            if (existing.length > 0) {
                const prevStart = new Date(existing[0].start_date);
                const currStart = new Date(startDate);
                const diffTime = currStart.getTime() - prevStart.getTime();
                const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                await db.promise().query(
                    "UPDATE period_history SET cycle_length = ? WHERE id = ?",
                    [diffDays, existing[0].id]
                );
            }
            await db.promise().query(
                "INSERT INTO period_history (user_id, start_date, end_date) VALUES (?, ?, ?)",
                [userId, startDate, endDate || null]
            );
        }

        // Always update user_profile last_period_date
        await db.promise().query(
            "UPDATE user_profile SET last_period_date = ? WHERE user_id = ?",
            [startDate, userId]
        );

        res.json({ message: "Period logged successfully" });
    } catch (err) {
        console.error("Log Period Error:", err);
        res.status(500).json({ message: "Server error logging period" });
    }
};

exports.getForecast = async (req, res) => {
    const userId = req.user.id;
    try {
        const [profileRes] = await db.promise().query("SELECT * FROM user_profile WHERE user_id = ?", [userId]);
        const cycleData = calculateCycle(profileRes[0] || {}, []);
        
        let message = "";
        let suggestions = [];
        
        if (cycleData.phase === 'Menstrual') {
            message = "Estrogen and progesterone are low. You might experience cramps or fatigue.";
            suggestions = [
                "Rest and stay hydrated.",
                "Consider iron-rich foods.",
                "Gentle yoga or stretching can alleviate cramps."
            ];
        } else if (cycleData.phase === 'Follicular') {
            message = "Estrogen is rising. Energy levels may bounce back and mood typically improves.";
            suggestions = [
                "Great time for high-intensity workouts.",
                "Focus on complex carbohydrates.",
                "Take advantage of higher social energy."
            ];
        } else if (cycleData.phase === 'Ovulation') {
            message = "Estrogen peaks. High fertility window. You might notice changes in basal body temperature.";
            suggestions = [
                "Stay hydrated and avoid heavy caffeine.",
                "Listen to your body's energy levels.",
                "Monitor any slight pelvic pain (mittelschmerz)."
            ];
        } else {
            message = "Progesterone rises. You might experience PMS symptoms like bloating or mood changes.";
            suggestions = [
                "Reduce sodium to avoid bloating.",
                "Prioritize sleep and stress management.",
                "Cravings are normal; focus on balanced macros."
            ];
        }

        res.json({
            message,
            suggestions,
            disclaimer: "Predictions are estimates, not diagnostic tools or guaranteed birth control."
        });
    } catch (err) {
        console.error("Forecast Error:", err);
        res.status(500).json({ message: "Server error fetching forecast" });
    }
};
