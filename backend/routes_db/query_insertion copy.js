const express = require('express');
const { Client } = require('pg');
const app = express();
const port = 3002;

// Middleware for parsing JSON requests
app.use(express.json());

// Database client configuration
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'G4Z1,-/j>[4i',
    database: 'postgres'
});

// Route to insert data into a table dynamically
app.get('/insertion', async (req, res) => {
    const inputData = req.body; // Expecting JSON data in the request body

    const tableName = inputData.table_name;
    const users = inputData.data;

    if (!tableName || !Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    // Extract column names dynamically from the first object in the array
    const columns = Object.keys(users[0]);
    const columnNames = columns.join(", ");
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");

    const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;

    try {
        await client.connect(); // Connect to the database
        await client.query('BEGIN'); // Start transaction

        for (const user of users) {
            // Extract values in the same order as columns
            const values = columns.map(column => user[column]);
            await client.query(insertQuery, values);
        }

        await client.query('COMMIT'); // Commit transaction
        res.json({ message: "Data inserted successfully" });
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Failed to insert data" });
    } finally {
        await client.end(); // Disconnect from the database
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
