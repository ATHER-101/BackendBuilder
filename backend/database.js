const fs = require('fs');
const path = require('path');

// Path to the database JSON file
const dbPath = path.join(__dirname, 'Builder', 'database.json');

// Helper function to read and parse JSON file
const readDatabase = () => {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
};

// Helper function to write JSON to the file
const writeDatabase = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};

// Add or update user, project, or endpoint in the database
const updateDatabase = (user, projectName, endpoint = null) => {
    const dbData = readDatabase();

    // Find user by ID
    let userData = dbData.find(u => u.user === user);

    if (!userData) {
        // If user doesn't exist, create a new user
        userData = { user, projects: [] };
        dbData.push(userData);
    }

    // Find project by name under the user
    let projectData = userData.projects.find(p => p.project_name === projectName);

    if (!projectData) {
        // If project doesn't exist, create a new project
        projectData = { project_name: projectName, endpoints: [] };
        userData.projects.push(projectData);
    }

    // If endpoint is provided, add it to the project
    if (endpoint) {
        projectData.endpoints.push(endpoint);
    }

    // Write the updated data back to the JSON file
    writeDatabase(dbData);
};

module.exports = { updateDatabase };
