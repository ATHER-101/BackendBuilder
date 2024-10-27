const express = require('express');
const router = express.Router();

const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Define your routes here
router.get('/', async (req, res) => {
    const token = process.env.GITHUB_TOKEN;
    const repoUrl = `https://${token}:x-oauth-basic@github.com/ATHER-101/Builder.git`;
    const destinationPath = 'Builder';
    const userName = req.query.user;

    if (!repoUrl || !destinationPath || !userName === undefined) {
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

    const folderPath = path.join(fullPath, 'routes', userName);

    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            return console.error(`Error creating folder: ${err.message}`);
        }
        console.log('Folder created successfully!');
    });

    return res.sendStatus(200);
});



module.exports = router;
