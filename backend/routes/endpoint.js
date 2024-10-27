const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {updateDatabase} = require('../database');

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

// Define your routes here
router.get('/', async (req, res) => {
    const ai_res = await generateAIResponse(prompt + JSON.stringify(req.body));

    const token = process.env.GITHUB_TOKEN;
    const repoUrl = `https://${token}:x-oauth-basic@github.com/ATHER-101/Builder.git`;
    const destinationPath = 'Builder';
    const userName = req.query.user;
    const fileName = `${req.query.project}.js`;
    const newContent = ai_res.response.candidates[0].content.parts[0].text;
    const cleanedContent = newContent.replace(/```javascript|```/g, '').trim();

    if (!repoUrl || !destinationPath || !fileName || newContent === undefined) {
        return res.status(400).json({ error: 'repoUrl, destinationPath, fileName, and newContent are required' });
    }

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

    const filePath = path.join(fullPath, 'routes',userName, fileName);

    try {
        // Read existing content of 01.js
        let existingContent = fs.readFileSync(filePath, 'utf8');
        
        // Append the new route to the existing content
        const routeToAppend = `\n${cleanedContent}\n`;
        existingContent += routeToAppend;

        // Write the updated content back to the file
        fs.writeFileSync(filePath, existingContent, 'utf8');
        console.log(`Updated file: ${filePath}`);
    } catch (writeError) {
        console.error("Error writing file:", writeError);
        return res.status(500).json({ error: 'Failed to write file' });
    }

    const endpoint_name = req.body.endpoint_name;
    const method = req.body.method.toUpperCase();
    const endpoint = { endpoint_name, method };
    updateDatabase(userName, req.query.project, endpoint);

    // Add, commit, and push the changes to GitHub
    try {
        await git.add(filePath);
        await git.commit('Update 01.js with new route handler');
        await git.push('origin', 'main'); // Replace 'main' with your branch name if it's different
        console.log('Changes pushed to GitHub successfully.');
    } catch (gitError) {
        console.error("Error pushing changes to GitHub:", gitError);
        return res.status(500).json({ error: 'Failed to push changes to GitHub' });
    }

    return res.send(ai_res.response.candidates[0].content.parts[0].text);
});

const prompt = `
Given the following specifications, generate an Express.js route handler:

The generated code should create an endpoint with specified method at specified route that responds with JSON structure like an array of objects with specified expected output but with real data. And make sure to put the JSON object inside the route handler. Do not use a loop or any kind of code to generate the array of objects in the code. Make sure to give only code snippet. Make sure you give only the route handler and not the imports or exports to fit into this code snippet:

const express = require('express');
const router = express.Router();

module.exports = router;

`;

module.exports = router;
