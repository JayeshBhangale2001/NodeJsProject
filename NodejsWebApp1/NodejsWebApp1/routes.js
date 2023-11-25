/*const express = require('express');
const router = express.Router();

module.exports = (connection) => {
    router.get('/teammates-birthdays', (req, res) => {
        // Use 'connection' for database operations
        connection.query('SELECT username, BirthDate FROM users_birthdays', (err, results) => {
            if (err) {
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    });

    router.post('/add-birthday', (req, res) => {
        const { username, birthDate } = req.body;

        // Use 'connection' for database operations
        connection.query(
            'INSERT INTO users_birthdays (username, BirthDate) VALUES (?, ?)',
            [username, birthDate],
            (err) => {
                if (err) {
                    res.status(500).json({ error: 'Failed to add birthday' });
                    return;
                }
                res.json({ message: 'Birthday added successfully' });
            }
        );
    });

    return router;
};*/