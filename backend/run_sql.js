const fs = require('fs');
const db = require('./config/db');

async function run() {
    try {
        const sql = fs.readFileSync('../database/update_weights.sql', 'utf-8');
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (let stmt of statements) {
            await db.promise().query(stmt);
        }
        console.log('Successfully updated disease symptom weights!');
    } catch (e) {
        console.error('Error running SQL:', e);
    } finally {
        process.exit();
    }
}
run();
