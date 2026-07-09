const db = require("../config/db");

// Helper to calculate cycle details
const calculateCycle = (profile, history) => {
    let cycleLength = 28; // Default to 28 days for new users
    if (history && history.length >= 3) {
        const lengths = history.map(h => h.cycle_length).filter(l => l > 0);
        if (lengths.length >= 3) {
            // Anomaly filtering: If it happens just once (>35 days), minimize its impact
            const longCycles = lengths.filter(l => l > 35);
            let validLengths = lengths;
            if (longCycles.length === 1) {
                validLengths = lengths.filter(l => l <= 35);
            }
            if (validLengths.length > 0) {
                // Rolling average of the available cycles (up to 12)
                cycleLength = Math.round(validLengths.reduce((a, b) => a + b, 0) / validLengths.length);
            } else {
                cycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
            }
        } else if (profile && profile.cycle_length) {
            cycleLength = profile.cycle_length;
        }
    } else if (profile && profile.cycle_length && (!history || history.length < 3)) {
        // According to instructions, default to 28-day standard until 3 cycles are logged. 
        // But if they provided one, we might use it. The prompt specifically said:
        // "For a brand new user, Flo defaults to standard clinical averages: LMP + 28 days... 
        // Once you have logged data for at least 3 cycles, Flo switches... to a personalized rolling average"
        cycleLength = 28;
    }

    // Clamp cycle length to average 21-35 days as per medical guidelines
    cycleLength = Math.max(21, Math.min(35, cycleLength));


    const today = new Date();
    // Start of current cycle. If we have a history record for current ongoing period, use that.
    // Otherwise use last_period_date from profile
    let lastPeriodStart = profile && profile.last_period_date ? new Date(profile.last_period_date) : today;

    let predictedPeriodDate = new Date(lastPeriodStart);
    predictedPeriodDate.setDate(predictedPeriodDate.getDate() + cycleLength);

    const diffRaw = today.getTime() - predictedPeriodDate.getTime();
    const daysDelayedRaw = Math.floor(diffRaw / (1000 * 60 * 60 * 24));
    
    let isDelayed = false;
    let delayDays = 0;

    if (daysDelayedRaw > 2) { // 2-day buffer window
        isDelayed = true;
        delayDays = daysDelayedRaw;
    }


    const diffTime = today.getTime() - lastPeriodStart.getTime();
    const cycleDay = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

    let needsConsultation = false;
    let consultationReason = null;
    let fertileWindowFrozen = false;

    if (delayDays > 35) {
        fertileWindowFrozen = true;
    }

    if (cycleDay > 90) {
        needsConsultation = true;
        consultationReason = "You completely missed your period for 3 consecutive months (secondary amenorrhea). Please consult a healthcare provider.";
    } else if (cycleDay > 32) {
        needsConsultation = true;
        consultationReason = "Your current cycle is longer than 32 days. If accompanied by sudden weight changes, severe acne, or unusual facial hair growth, please consult a healthcare provider.";
    }

    if (history && history.length > 0) {
        const consistentlyLong = history.filter(h => h.cycle_length > 35);
        if (consistentlyLong.length >= 2) {
            needsConsultation = true;
            consultationReason = "Your cycles are consistently longer than 35 days. Please consult a healthcare provider.";
        }
    }

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
    } else if (cycleDay < ovulationDay - 5 && !fertileWindowFrozen) {
        phase = 'Follicular';
    } else if (cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay && !fertileWindowFrozen) {
        phase = 'Ovulation';
    } else if (fertileWindowFrozen) {
        phase = 'Delayed';
    } else {
        phase = 'Luteal';
    }

    return {
        cycleDay,
        cycleLength,
        phase,
        lastPeriodStart: lastPeriodStart.toISOString().slice(0, 10),
        ovulationDay,
        isDelayed,
        delayDays,
        fertileWindowFrozen,
        needsConsultation,
        consultationReason,
        predictedPeriodDate: predictedPeriodDate.toISOString().slice(0, 10)
    };
};

exports.getStatus = async (req, res) => {
    const userId = req.user.id;
    try {
        const [profileRes] = await db.promise().query("SELECT * FROM user_profile WHERE user_id = ?", [userId]);
        const profile = profileRes[0] || {};
        
        const [history] = await db.promise().query(
            "SELECT * FROM period_history WHERE user_id = ? ORDER BY start_date DESC LIMIT 12",
            [userId]
        );

        const cycleData = calculateCycle(profile, history);
        cycleData.history = history.map(h => ({
            ...h,
            start_date: new Date(h.start_date).toISOString().slice(0, 10),
            end_date: h.end_date ? new Date(h.end_date).toISOString().slice(0, 10) : null
        }));

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
