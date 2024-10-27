const express = require('express');
const router = express.Router();

const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {updateDatabase} = require('../database');

// Define your routes here
router.get('/', async (req, res) => {
    const token = process.env.GITHUB_TOKEN;
    const repoUrl = `https://${token}:x-oauth-basic@github.com/ATHER-101/Builder.git`;
    const destinationPath = 'Builder';
    const userName = req.query.user;
    const fileName = `${req.query.project}.js`;
    const fileContent = `const express = require('express');
const router = express.Router();

module.exports = router;

`;
    const indexContent = `
const routes_${userName}_${fileName.slice(0, -3)} = require('./routes/${userName}/${fileName.slice(0, -3)}');
app.use('/${userName}/${fileName.slice(0, -3)}', routes_${userName}_${fileName.slice(0, -3)});

`;

    if (!repoUrl || !destinationPath || !fileName === undefined) {
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

    const filePath = path.join(fullPath, 'routes', userName, fileName);

    fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
            console.error('An error occurred while creating the file:', err);
            return;
        }
        console.log(`File created successfully at ${filePath}`);
    });

    try {
        // Read existing content of 01.js
        let existingContent = fs.readFileSync(path.join(fullPath, 'index.js'), 'utf8');

        // Append the new route to the existing content
        existingContent += indexContent;

        // Write the updated content back to the file
        fs.writeFileSync(path.join(fullPath, 'index.js'), existingContent, 'utf8');
        console.log(`Updated file: ${path.join(fullPath, 'index.js')}`);
    } catch (writeError) {
        console.error("Error writing file:", writeError);
        return res.status(500).json({ error: 'Failed to write file' });
    }

    updateDatabase(userName, req.query.project);

    // Add, commit, and push the changes to GitHub
    try {
        await git.add([filePath, path.join(fullPath, 'index.js')]);
        await git.commit('Added new project');
        await git.push('origin', 'main'); // Replace 'main' with your branch name if it's different
        console.log('Changes pushed to GitHub successfully.');
    } catch (gitError) {
        console.error("Error pushing changes to GitHub:", gitError);
        return res.status(500).json({ error: 'Failed to push changes to GitHub' });
    }

    return res.send(indexContent);
});



module.exports = router;
