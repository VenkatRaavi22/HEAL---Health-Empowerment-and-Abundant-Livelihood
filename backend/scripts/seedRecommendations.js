/**
 * seedRecommendations.js
 * Seeds the recommendations table from the CSV file.
 * Handles both possible table structures:
 *  - disease_name + category + risk_level columns (CSV-matched)
 *  - disease_id + type columns (schema.sql version)
 *
 * Run with: node backend/scripts/seedRecommendations.js
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const fs = require("fs");
const db = require("../config/db");

const CSV_PATH = path.resolve(__dirname, "../../database/recommendations.csv");

function parseCSV(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
        // handle commas inside quoted fields
        const values = [];
        let current = "";
        let inQuote = false;
        for (const ch of line) {
            if (ch === '"') { inQuote = !inQuote; }
            else if (ch === "," && !inQuote) { values.push(current); current = ""; }
            else { current += ch; }
        }
        values.push(current);
        return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] || "").trim()]));
    });
}

async function run() {
    try {
        // 1. Detect which columns the recommendations table actually has
        const [cols] = await db.promise().query("SHOW COLUMNS FROM recommendations");
        const colNames = cols.map(c => c.Field);
        console.log("Columns in recommendations table:", colNames.join(", "));

        const hasDiseaseName = colNames.includes("disease_name");
        const hasCategory = colNames.includes("category");
        const hasRiskLevel = colNames.includes("risk_level");

        // 2. If disease_name/category/risk_level don't exist, ALTER the table to add them
        if (!hasDiseaseName) {
            console.log("Adding disease_name column...");
            await db.promise().query("ALTER TABLE recommendations ADD COLUMN disease_name VARCHAR(100) AFTER id");
        }
        if (!hasCategory) {
            console.log("Adding category column...");
            await db.promise().query("ALTER TABLE recommendations ADD COLUMN category VARCHAR(50) AFTER disease_name");
        }
        if (!hasRiskLevel) {
            console.log("Adding risk_level column...");
            await db.promise().query("ALTER TABLE recommendations ADD COLUMN risk_level VARCHAR(20) AFTER category");
        }

        // 3. Parse CSV
        const content = fs.readFileSync(CSV_PATH, "utf8");
        const rows = parseCSV(content);
        console.log(`Parsed ${rows.length} rows from CSV`);

        // 4. Make disease_id nullable so we can omit it when inserting by name
        try {
            await db.promise().query("ALTER TABLE recommendations MODIFY COLUMN disease_id INT NULL DEFAULT NULL");
            console.log("Made disease_id nullable");
        } catch { /* already nullable */ }

        // 5. Clear existing data
        await db.promise().query("DELETE FROM recommendations");
        console.log("Cleared existing recommendations");

        // 6. Get disease ID map for optional FK mapping
        const [diseaseRows] = await db.promise().query("SELECT disease_id, disease_name FROM diseases");
        const diseaseMap = Object.fromEntries(diseaseRows.map(d => [d.disease_name.toLowerCase(), d.disease_id]));

        // 7. Insert rows
        let inserted = 0;
        for (const row of rows) {
            if (!row.title || !row.disease_name) continue;
            const diseaseId = diseaseMap[row.disease_name.toLowerCase()] || null;
            await db.promise().query(
                `INSERT INTO recommendations (disease_id, disease_name, category, risk_level, title, description, image_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    diseaseId,
                    row.disease_name,
                    row.category,
                    row.risk_level,
                    row.title,
                    row.description || "",
                    row.image_url || null
                ]
            );
            inserted++;
        }

        console.log(`✅ Inserted ${inserted} recommendations`);

        // 6. Verify
        const [result] = await db.promise().query(
            `SELECT disease_name, category, risk_level, title, image_url
             FROM recommendations
             WHERE image_url IS NOT NULL AND image_url != ''
             ORDER BY disease_name, category`
        );
        console.log(`\n📸 ${result.length} entries now have images:`);
        result.forEach(r => console.log(`  [${r.disease_name}/${r.category}/${r.risk_level}] ${r.title} → ${r.image_url}`));

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

run();
