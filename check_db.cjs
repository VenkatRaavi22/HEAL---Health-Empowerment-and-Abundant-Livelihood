const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Manually load .env since it's in a different folder
const envPath = path.join(__dirname, "backend", ".env");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error(".env file not found at:", envPath);
    process.exit(1);
}

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
    console.log("Connected to MySQL database");

    db.query("SHOW TABLES LIKE 'users'", (err, results) => {
        if (err) {
            console.error("Error checking tables:", err.message);
            db.end();
            process.exit(1);
        }
        if (results.length === 0) {
            console.log("Table 'users' DOES NOT exist!");
        } else {
            console.log("Table 'users' exists.");
            db.query("DESCRIBE users", (err, results) => {
                if (err) {
                    console.error("Error describing 'users' table:", err.message);
                } else {
                    console.log("'users' table structure:");
                    console.table(results);
                }
                db.end();
            });
        }
    });
});
