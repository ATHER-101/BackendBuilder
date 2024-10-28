const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { getDatabaseDetails } = require('../database');

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI("AIzaSyBjevwoUgz9l3yfAfX6w7vEvaLlARk6TVY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to generate SQL query using AI
async function generateSqlQuery(input) {
    const prompt = `
    Given the following specifications, generate an SQL query that creates a table with the name specified in the \`table_name\` property. 
    The table should have columns based on the \`table_columns\` object, mapping the JavaScript types to their corresponding SQL data types. 
    Do not include any additional explanations or comments, just provide the SQL query.

    Input Object:
    ${JSON.stringify(input, null, 2)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const sqlQuery = result?.response?.candidates[0]?.content?.parts[0]?.text;

        // Clean up the query if needed
        const cleanedSqlQuery = sqlQuery?.replace(/```sql\n|\n```/g, '').trim();

        if (!cleanedSqlQuery) {
            throw new Error("Generated SQL query is undefined or invalid.");
        }

        return cleanedSqlQuery;
    } catch (error) {
        console.error("Error generating SQL query:", error);
        throw error;
    }
}

// Route for table creation
router.post('/', async (req, res) => {  // Change GET to POST
    const userInput = req.body;

    const db_details = getDatabaseDetails(req.query.user, req.query.project);
    const pool = new Pool({
        ...db_details,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if no connection is available
        ssl: {
            rejectUnauthorized: false,
        },
    });
    let client;

    try {
        // Generate the SQL query asynchronously
        const createTableQuery = await generateSqlQuery(userInput);
        console.log("Generated SQL Query:", createTableQuery);

        // Connect to the database using the pool
        client = await pool.connect();

        // Execute the SQL query
        await client.query(createTableQuery);
        console.log(`Table '${userInput.table_name}' created successfully.`);

        // Send success response
        res.json({ message: `Table '${userInput.table_name}' created successfully.` });
    } catch (error) {
        console.error("Error creating table:", error);
        res.status(500).json({ error: "Failed to create table." });
    } finally {
        // Release the client back to the pool
        if (client) {
            client.release();
        }
        console.log("Client released back to the pool");
    }
});

module.exports = router;
