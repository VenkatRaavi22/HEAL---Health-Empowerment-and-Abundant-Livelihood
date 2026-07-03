const mysql = require("mysql2");
require("dotenv").config({ path: "./backend/.env" });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(async (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
    
    try {
        const promiseDb = db.promise();
        
        // 1. Create period_history table
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS period_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE,
                cycle_length INT,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log("period_history table created or already exists.");

        // 2. Alter health_logs to add flow_intensity, pain_level, physical_markers
        const columnsToAdd = [
            "ADD COLUMN flow_intensity VARCHAR(50)",
            "ADD COLUMN pain_level VARCHAR(50)",
            "ADD COLUMN physical_markers VARCHAR(255)"
        ];
        
        for (const col of columnsToAdd) {
            try {
                await promiseDb.query(`ALTER TABLE health_logs ${col};`);
                console.log(`Successfully added column: ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column for ${col} already exists, skipping.`);
                } else {
                    console.error(`Error adding column ${col}:`, e.message);
                }
            }
        }
        
    } catch (e) {
        console.error("Migration error:", e);
    } finally {
        db.end();
    }
});
