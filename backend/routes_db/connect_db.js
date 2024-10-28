const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const { updateDatabase } = require('../database');

router.post('/', async (req, res) => {
    const { host, port, user, password, database } = req.body;
    const project = req.query.project;
    const userId = req.query.user;

    // Create a new database pool with provided credentials
    const pool = new Pool({
        host,
        port,
        user,
        password,
        database,
        max: 1, // We only need a single connection to check
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        // Attempt to connect to the database
        const client = await pool.connect();
        // If connection is successful, release the client and send success response
        client.release();

        updateDatabase(userId, project, null, req.body);

        res.status(200).json({ success: true, message: 'Successfully connected to the database.' });
    } catch (error) {
        console.log(error)
        // If connection fails, catch the error and send failure response
        res.status(500).json({ success: false, message: 'Failed to connect to the database.', error: error.message });
    } finally {
        // End the pool to close connections properly
        await pool.end();
    }
});

module.exports = router;
