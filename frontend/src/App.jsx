// App.js
import React, { useState } from 'react';
import Navbar from './components/navbar';

function App() {
  const [projects, setProjects] = useState([{ name: 'Project 0', routes: [] }]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({
    method: 'GET',
    endpoint: '',
    response: '',
  });

  // Create a new project
  const createProject = () => {
    const newProject = { name: newProjectName, routes: [] };
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  // Create a new route for the selected project
  const createRoute = () => {
    const updatedProject = {
      ...selectedProject,
      routes: [...selectedProject.routes, { ...newRoute }],
    };
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.name === selectedProject.name ? updatedProject : project
      )
    );
    setSelectedProject(updatedProject);
    setNewRoute({ method: 'GET', endpoint: '', response: '' });
    setIsCreatingRoute(false);
  };

  return (
    <>
    {/* Navbar */}
    <Navbar
    selectedProject={selectedProject}
    projects={projects}
    dropdownOpen={dropdownOpen}
    setDropdownOpen={setDropdownOpen}
    setSelectedProject={setSelectedProject}
    setIsCreatingProject={setIsCreatingProject}
  />
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-1/5 bg-green-600 text-white p-4">
        <ul>
          {selectedProject.routes.map((route, index) => (
            <li key={index} className="mb-2 p-2 bg-green-800 rounded">
              <span className="font-bold">{route.method}</span> - {route.endpoint}
            </li>
          ))}
        </ul>
        <button
          className="bg-green-800 w-full mt-4 p-2 rounded"
          onClick={() => setIsCreatingRoute(true)}
        >
          Create Route
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow">

        {/* Modal for Creating New Project */}
        {isCreatingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded shadow-lg w-80">
              <h2 className="text-lg font-bold mb-4">Create New Project</h2>
              <input
                type="text"
                placeholder="Project Name"
                className="border p-2 w-full mb-4 rounded"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <button
                className="bg-green-800 text-white px-4 py-2 rounded mr-2"
                onClick={createProject}
              >
                Create
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setIsCreatingProject(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Modal for Creating New Route */}
        {isCreatingRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded shadow-lg w-80">
              <h2 className="text-lg font-bold mb-4">Create New Route</h2>
              <select
                className="border p-2 w-full mb-4 rounded"
                value={newRoute.method}
                onChange={(e) =>
                  setNewRoute({ ...newRoute, method: e.target.value })
                }
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="text"
                placeholder="Endpoint"
                className="border p-2 w-full mb-4 rounded"
                value={newRoute.endpoint}
                onChange={(e) =>
                  setNewRoute({ ...newRoute, endpoint: e.target.value })
                }
              />
              <textarea
                placeholder="Expected Response (JSON)"
                className="border p-2 w-full mb-4 rounded"
                value={newRoute.response}
                onChange={(e) =>
                  setNewRoute({ ...newRoute, response: e.target.value })
                }
              />
              <button
                className="bg-green-800 text-white px-4 py-2 rounded mr-2"
                onClick={createRoute}
              >
                Create
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setIsCreatingRoute(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default App;
