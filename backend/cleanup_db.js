const db = require("./config/db");

const cleanupAndSeed = async () => {
    try {
        console.log("Starting database cleanup...");

        // Disable foreign key checks to allow truncation
        await db.promise().query("SET FOREIGN_KEY_CHECKS = 0");

        // Truncate tables
        const tables = [
            "user_symptom_logs",
            "health_logs",
            "disease_symptom_weights",
            "recommendations",
            "diseases",
            "master_symptoms"
        ];

        for (const table of tables) {
            await db.promise().query(`TRUNCATE TABLE ${table}`);
            console.log(`Truncated ${table}`);
        }

        // Re-enable foreign key checks
        await db.promise().query("SET FOREIGN_KEY_CHECKS = 1");

        // 1. Insert master_symptoms
        const symptoms = [
            "Irregular periods", "Missed periods", "Acne", "Hair fall", "Excess facial hair",
            "Sudden weight gain", "Unexplained weight loss", "Fatigue", "Mood swings",
            "Anxiety", "Depression", "Sleep disturbance", "Cold intolerance",
            "Heat intolerance", "Bloating", "Severe cramps", "Low activity", "Heavy bleeding"
        ];

        const symptomValues = symptoms.map(s => [s]);
        await db.promise().query("INSERT INTO master_symptoms (symptom_name) VALUES ?", [symptomValues]);
        console.log("Seeded master_symptoms");

        // 2. Insert diseases
        const diseases = ["PCOD", "Thyroid", "Anemia", "Endometriosis"];
        const diseaseValues = diseases.map(d => [d]);
        await db.promise().query("INSERT INTO diseases (disease_name) VALUES ?", [diseaseValues]);
        console.log("Seeded diseases");

        // Get IDs for mapping
        const [symptomRows] = await db.promise().query("SELECT symptom_id, symptom_name FROM master_symptoms");
        const symptomMap = Object.fromEntries(symptomRows.map(r => [r.symptom_name, r.symptom_id]));

        const [diseaseRows] = await db.promise().query("SELECT disease_id, disease_name FROM diseases");
        const diseaseMap = Object.fromEntries(diseaseRows.map(r => [r.disease_name, r.disease_id]));

        // 3. Insert weights
        const weights = [
            // PCOD
            ["PCOD", "Irregular periods", 3], ["PCOD", "Missed periods", 3], ["PCOD", "Acne", 2],
            ["PCOD", "Excess facial hair", 3], ["PCOD", "Sudden weight gain", 2], ["PCOD", "Hair fall", 1],
            // Thyroid
            ["Thyroid", "Fatigue", 3], ["Thyroid", "Sudden weight gain", 2], ["Thyroid", "Hair fall", 2],
            ["Thyroid", "Cold intolerance", 3], ["Thyroid", "Depression", 2], ["Thyroid", "Irregular periods", 1],
            // Anemia
            ["Anemia", "Fatigue", 3], ["Anemia", "Unexplained weight loss", 1], ["Anemia", "Mood swings", 1],
            // Endometriosis
            ["Endometriosis", "Severe cramps", 3], ["Endometriosis", "Heavy bleeding", 3], ["Endometriosis", "Bloating", 2]
        ];

        const weightValues = weights.map(([d, s, w]) => [diseaseMap[d], symptomMap[s], w]);
        await db.promise().query("INSERT INTO disease_symptom_weights (disease_id, symptom_id, weight) VALUES ?", [weightValues]);
        console.log("Seeded disease_symptom_weights");

        console.log("Database cleanup and re-seeding COMPLETED successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Cleanup Error:", err.message);
        process.exit(1);
    }
};

cleanupAndSeed();
