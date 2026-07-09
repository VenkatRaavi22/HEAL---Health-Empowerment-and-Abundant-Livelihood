const mysql = require("mysql2");
require("dotenv").config({ path: "./backend/.env" });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
    
    // Add the column if it doesn't exist
    const query = `
        ALTER TABLE medications 
        ADD COLUMN last_processed_date DATE DEFAULT (CURRENT_DATE);
    `;
    db.query(query, (err) => {
        if (err) {
            // It might already exist, handle gracefully
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("Column last_processed_date already exists.");
            } else {
                console.error("Error altering table:", err.message);
            }
        } else {
            console.log("Column last_processed_date added successfully.");
        }
        
        // Also update any existing rows that have NULL
        db.query("UPDATE medications SET last_processed_date = CURRENT_DATE WHERE last_processed_date IS NULL", (err2) => {
            if (err2) console.error("Error updating null rows:", err2);
            else console.log("Updated existing rows to current date.");
            db.end();
        });
    });
});
