const express = require('express');
const pg = require('pg');
const { Client } = require('pg');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI("AIzaSyBjevwoUgz9l3yfAfX6w7vEvaLlARk6TVY"); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Database client configuration
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'G4Z1,-/j>[4i',
    database: 'postgres'
});

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
app.get('/generator', async (req, res) => {
    const userInput = req.body;

    try {
        // Generate the SQL query asynchronously
        const createTableQuery = await generateSqlQuery(userInput);
        console.log("Generated SQL Query:", createTableQuery);

        // Connect to the database
        await client.connect();

        // Execute the SQL query
        await client.query(createTableQuery);
        console.log(`Table '${userInput.table_name}' created successfully.`);

        // Send success response
        res.json({ message: `Table '${userInput.table_name}' created successfully.` });
    } catch (error) {
        console.error("Error creating table:", error);
        res.status(500).json({ error: "Failed to create table." });
    } finally {
        await client.end();
        console.log("Disconnected from the database");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
