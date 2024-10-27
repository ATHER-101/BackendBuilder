const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

router.get('/', (req, res) => {
    const userId = req.query.user; // Get the user ID from the query parameter

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Path to the database.json file
    const databasePath = path.join(__dirname,'../','Builder', 'database.json');

    // Read the database.json file
    fs.readFile(databasePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading database file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Parse the JSON data
        const database = JSON.parse(data);
        
        // Find the user by ID
        const user = database.find(user => user.user === userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Respond with the user data
        res.status(200).json(user);
    });
});

module.exports = router;
