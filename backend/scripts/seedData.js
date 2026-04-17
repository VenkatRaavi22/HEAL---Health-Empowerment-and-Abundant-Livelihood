const db = require("../config/db");

const seed = async () => {
    try {
        console.log("Starting seeding...");

        // 1. Insert Diseases
        const diseases = ["PCOD", "Thyroid", "Anemia", "Endometriosis"];
        for (const disease of diseases) {
            await db.promise().query("INSERT IGNORE INTO diseases (disease_name) VALUES (?)", [disease]);
        }

        // 2. Insert Symptoms
        const symptoms = [
            "Irregular periods", "Heavy bleeding", "Severe cramps", "Acne",
            "Weight gain", "Hair loss", "Fatigue", "Mood swings",
            "Bloating", "Sugar cravings", "Cold intolerance", "Low hemoglobin symptoms"
        ];
        for (const symptom of symptoms) {
            await db.promise().query("INSERT IGNORE INTO master_symptoms (symptom_name) VALUES (?)", [symptom]);
        }

        // Get IDs for mapping
        const [diseaseRows] = await db.promise().query("SELECT * FROM diseases");
        const [symptomRows] = await db.promise().query("SELECT * FROM master_symptoms");

        const diseaseMap = Object.fromEntries(diseaseRows.map(d => [d.disease_name, d.disease_id]));
        const symptomMap = Object.fromEntries(symptomRows.map(s => [s.symptom_name, s.symptom_id]));

        // 3. Insert Weights (Logical Mapping 1-10)
        const weights = [
            // PCOD
            [diseaseMap["PCOD"], symptomMap["Irregular periods"], 10],
            [diseaseMap["PCOD"], symptomMap["Acne"], 8],
            [diseaseMap["PCOD"], symptomMap["Weight gain"], 9],
            [diseaseMap["PCOD"], symptomMap["Hair loss"], 7],
            [diseaseMap["PCOD"], symptomMap["Sugar cravings"], 8],
            [diseaseMap["PCOD"], symptomMap["Mood swings"], 6],
            [diseaseMap["PCOD"], symptomMap["Bloating"], 4],
            // Thyroid
            [diseaseMap["Thyroid"], symptomMap["Weight gain"], 10],
            [diseaseMap["Thyroid"], symptomMap["Fatigue"], 9],
            [diseaseMap["Thyroid"], symptomMap["Cold intolerance"], 10],
            [diseaseMap["Thyroid"], symptomMap["Hair loss"], 8],
            [diseaseMap["Thyroid"], symptomMap["Irregular periods"], 7],
            [diseaseMap["Thyroid"], symptomMap["Bloating"], 5],
            // Anemia
            [diseaseMap["Anemia"], symptomMap["Fatigue"], 10],
            [diseaseMap["Anemia"], symptomMap["Low hemoglobin symptoms"], 10],
            [diseaseMap["Anemia"], symptomMap["Hair loss"], 6],
            [diseaseMap["Anemia"], symptomMap["Heavy bleeding"], 8],
            [diseaseMap["Anemia"], symptomMap["Mood swings"], 4],
            // Endometriosis
            [diseaseMap["Endometriosis"], symptomMap["Severe cramps"], 10],
            [diseaseMap["Endometriosis"], symptomMap["Heavy bleeding"], 9],
            [diseaseMap["Endometriosis"], symptomMap["Irregular periods"], 8],
            [diseaseMap["Endometriosis"], symptomMap["Bloating"], 7],
            [diseaseMap["Endometriosis"], symptomMap["Fatigue"], 5],
            [diseaseMap["Endometriosis"], symptomMap["Mood swings"], 5],
        ];

        // Clear existing weights to avoid duplicates if re-running
        await db.promise().query("DELETE FROM disease_symptom_weights");

        for (const [diseaseId, symptomId, weight] of weights) {
            if (diseaseId && symptomId) {
                await db.promise().query(
                    "INSERT INTO disease_symptom_weights (disease_id, symptom_id, weight) VALUES (?, ?, ?)",
                    [diseaseId, symptomId, weight]
                );
            }
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
};

seed();
