const fs = require('fs');
const path = require('path');
const db = require('./backend/config/db');

const sqlFilePath = path.join(__dirname, 'database', 'update_weights.sql');
const sqlStr = fs.readFileSync(sqlFilePath, 'utf8');

// mysql2 doesn't support executing multiple statements by default unless multipleStatements: true is set
// So we can split by semicolon and execute one by one
const statements = sqlStr.split(';').map(s => s.trim()).filter(s => s.length > 0);

(async () => {
    try {
        for (const statement of statements) {
            await db.promise().query(statement);
        }
        console.log('Successfully updated database weights!');
        process.exit(0);
    } catch (err) {
        console.error('Error applying SQL:', err);
        process.exit(1);
    }
})();
