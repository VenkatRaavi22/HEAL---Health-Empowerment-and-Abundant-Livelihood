const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function updateProfiles() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // Update all users who just have 'Thyroid' to include a type so it reflects properly
        const [result] = await connection.execute(
            `UPDATE user_profile 
             SET known_condition = 'Thyroid - Hypothyroidism (Underactive)' 
             WHERE known_condition = 'Thyroid'`
        );

        console.log(`Updated ${result.affectedRows} user profiles.`);
        
        await connection.end();
    } catch (err) {
        console.error('Error updating profiles:', err.message);
    }
}

updateProfiles();
