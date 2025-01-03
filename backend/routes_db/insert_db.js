const express = require('express');
const router = express.Router();

const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {updateDatabase} = require('../database');

router.post('/', async (req, res) => {
    const { endpoint_name, method, table_name } = req.body;
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

    const template = `
router.${method}('/${endpoint_name}', async (req, res) => {
    const { Pool } = require('pg');
    const pool = new Pool({
    host: "${database.host}",
    port: ${database.port},
    user: "${database.user}",
    password: "${database.password}",
    database: "${database.database}",
    ssl: { rejectUnauthorized: false }
    });

    try {
    const columnsRes = await pool.query(\`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '${table_name}';
    \`);

    const columns = columnsRes.rows.map(row => row.column_name);

    // Extract data from request body
    const values = req.body.map(row => columns.map(col => row[col]));

    // Generate query for inserting rows
    const queryText = \`
        INSERT INTO ${table_name} (\${columns.join(', ')})
        VALUES \${values.map((_, i) => \`(\${columns.map((_, j) => \`\$\${i * columns.length + j + 1}\`).join(', ')})\`).join(', ')}
    \`;

    // Flatten values array for parameterized query
    const flattenedValues = values.flat();
    
    // Execute insert query
    await pool.query(queryText, flattenedValues);
    
    res.status(201).send('Data inserted successfully');
    } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting data');
    } finally {
    pool.end();
    }
});

    `;

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
        existingContent += template;

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

    // // Add, commit, and push the changes to GitHub
    try {
        await git.add(filePath);
        await git.commit('Update 01.js with new route handler');
        await git.push('origin', 'main');
        console.log('Changes pushed to GitHub successfully.');
    } catch (gitError) {
        console.error("Error pushing changes to GitHub:", gitError);
        return res.status(500).json({ error: 'Failed to push changes to GitHub' });
    }

    res.send(template);
});


module.exports = router;
