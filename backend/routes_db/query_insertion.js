const express = require('express');
const router = express.Router();
const { Pool } = require('pg');  

// Database connection pool configuration
const pool = new Pool({
    host: 'ep-jolly-glitter-a40z54ab.us-east-1.aws.neon.tech',
    port: 5432,
    user: 'neondb_owner',
    password: 'Rhm5pKdjblE3',
    database: 'neondb',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if no connection is available
    ssl: {
        rejectUnauthorized: false,
    },
});

// Route to insert data into a table dynamically
router.get('/', async (req, res) => { // Change GET to POST
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

    const client = await pool.connect(); // Connect to the pool

    try {
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
        client.release(); // Release the client back to the pool
        console.log("Client released back to the pool");
    }
});

module.exports = router;


// Given the following specifications, generate an Express.js route handler:

// {
//   "endpoint_name": "set-user",
//   "method": "post"
// }

// The generated code should create an endpoint with specified method at specified route that inserts the given data (multiple rows) through request body in table 'test' get the columns of the table from the database table in pgsql database with details:
// {
//     host: "ep-jolly-glitter-a40z54ab.us-east-1.aws.neon.tech",
//     port: 5432,
//     user: "neondb_owner",
//     password: "Rhm5pKdjblE3",
//     database: "neondb",
//     ssl: {
//         rejectUnauthorized: false,
//     },
//   }

// And make sure to put the const pool inside the route handler. 
// Make sure to give only code snippet. Make sure you give only the route handler and not the imports or exports to fit into this code snippet: 

// const express = require('express');
// const router = express.Router();

// module.exports = router;