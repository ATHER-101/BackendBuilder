const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Database pool configuration
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

// Function to fetch table columns dynamically
async function getTableColumns(tableName) {
    const query = `SELECT column_name FROM information_schema.columns WHERE table_name = $1`;
    const res = await pool.query(query, [tableName]);
    return res.rows.map(row => row.column_name);
}

// Function to generate SQL query using Gemini AI
async function generateSqlFromNaturalLanguage(naturalLanguageInput, tableName, columns) {
    const columnsString = columns.join(', ');
    
    const prompt = `
    Convert the following natural language input into a SQL SELECT query. 
    The query should include the necessary fields and constraints based on the input.
    {
        "table_name": "${tableName}",
        "table_columns": [${columnsString}]
    }
    Input:
    "${naturalLanguageInput}"

    Please return only the SQL query without any additional explanation or comments.
    `;

    const genAI = new GoogleGenerativeAI("AIzaSyBjevwoUgz9l3yfAfX6w7vEvaLlARk6TVY"); // Replace with your actual API key
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent(prompt);
        const sqlQuery = result?.response?.candidates[0]?.content?.parts[0]?.text;

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

// Route to handle natural language SQL query and data extraction
router.get('/', async (req, res) => {
    const { query } = req.body;

    try {
        // Step 1: Determine the table name based on the query
        const tableName = "test6"; // You can extract table name from the query if needed

        // Step 2: Fetch the columns dynamically
        const columns = await getTableColumns(tableName);
        console.log("Fetched Columns:", columns);

        // Step 3: Generate SQL query from natural language input
        const sqlQuery = await generateSqlFromNaturalLanguage(query, tableName, columns);
        console.log("Generated SQL Query:", sqlQuery);

        // Step 4: Execute the generated SQL query
        const result = await pool.query(sqlQuery);
        const jsonData = result.rows;
        
        res.json({ data: jsonData });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Failed to process request" });
    }
});

module.exports = router;
