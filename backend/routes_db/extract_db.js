const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { updateDatabase } = require('../database');

async function generateAIResponse(prompt) {
    const genAI = new GoogleGenerativeAI("AIzaSyBjevwoUgz9l3yfAfX6w7vEvaLlARk6TVY");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent(prompt);
        return result;
    } catch (error) {
        console.error("Error generating response:", error);
    }
}

router.post('/', async (req, res) => {
    const { endpoint_name, method, table_name, query } = req.body;
    const userId = req.query.user;
    const projectName = req.query.project;

    let database;

    // Path to the database.json file
    const databasePath = path.join(__dirname, '../', 'Builder', 'database.json');

    const data = fs.readFileSync(databasePath, 'utf8');

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Loop through each user
    for (const user of jsonData) {
        // Check if the user matches the specified userId
        if (user.user === userId) {
            // Loop through each project for the user
            for (const project of user.projects) {
                // Check if the project matches the specified projectName
                if (project.project_name === projectName) {
                    // Return the database object if it exists
                    database = project.database || null;
                }
            }
        }
    }

    if (!database) {
        return res.send({ error: "No database connected!" })
    }

    const prompt = `
Given the following specifications, generate an Express.js route handler:

{
  "endpoint_name": "${endpoint_name}",
  "method": "${method}"
}

The generated code should create an endpoint with specified method at specified route that gets the data from table '${table_name}' according to the prompt below get the columns of the table if needed from the database table in pgsql database with details:
{
    host: "${database.host}",
    port: ${database.port},
    user: "${database.user}",
    password: "${database.password}",
    database: "${database.database}",
    ssl: {
        rejectUnauthorized: false,
    },
}

And make sure to put the const pool inside the route handler. 
Make sure to give only code snippet. Make sure you give only the route handler and not the imports or exports to fit into this code snippet: 

const express = require('express');
const router = express.Router();

module.exports = router;

{
    "prompt":"${query}"
}
    `;

    const ai_res = await generateAIResponse(prompt);
    const newContent = ai_res.response.candidates[0].content.parts[0].text;
    const cleanedContent = newContent.replace(/```javascript|```/g, '').trim();

    const token = process.env.GITHUB_TOKEN;
    const repoUrl = `https://${token}:x-oauth-basic@github.com/ATHER-101/Builder.git`;
    const destinationPath = 'Builder';
    const fileName = `${projectName}.js`;

    const fullPath = path.join(__dirname, '../', destinationPath);
    const git = simpleGit(); // Define git here

    // Check if the destination directory already exists
    if (fs.existsSync(fullPath)) {
        console.log(`Directory already exists: ${fullPath}`);
    } else {
        // Clone the repository
        await git.clone(repoUrl, fullPath);
        console.log(`Cloned repository to ${fullPath}`);
    }

    git.cwd(destinationPath);

    const filePath = path.join(fullPath, 'routes', userId, fileName);

    try {
        // Read existing content of 01.js
        let existingContent = fs.readFileSync(filePath, 'utf8');

        // Append the new route to the existing content
        existingContent += `\n${cleanedContent}\n`;

        // Write the updated content back to the file
        fs.writeFileSync(filePath, existingContent, 'utf8');
        console.log(`Updated file: ${filePath}`);
    } catch (writeError) {
        console.error("Error writing file:", writeError);
        return res.status(500).json({ error: 'Failed to write file' });
    }

    const _method = method.toUpperCase();
    const endpoint = { endpoint_name, method: _method };
    updateDatabase(userId, projectName, endpoint);

    // Add, commit, and push the changes to GitHub
    try {
        await git.add(filePath);
        await git.commit('Update 01.js with new route handler');
        await git.push('origin', 'main');
        console.log('Changes pushed to GitHub successfully.');
    } catch (gitError) {
        console.error("Error pushing changes to GitHub:", gitError);
        return res.status(500).json({ error: 'Failed to push changes to GitHub' });
    }

    res.send(cleanedContent);
});


module.exports = router;
