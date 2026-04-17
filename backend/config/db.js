const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection on startup
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        console.error("Check your .env credentials: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
    } else {
        console.log("Connected to MySQL database");
        connection.release();
    }
});

module.exports = db;