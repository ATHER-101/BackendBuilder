import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/navbar';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({
    method: 'GET',
    endpoint: '',
    response: '',
  });
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3000/data?user=2345');
      const fetchedProjects = response.data.projects;
      setProjects(fetchedProjects);
      if (fetchedProjects.length > 0) {
        setSelectedProject(fetchedProjects[0]);
        setSelectedEndpoint(fetchedProjects[0].endpoints[0] || null);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSelectedProject(null);
      setSelectedEndpoint(null);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createRoute = async() => {
    const updatedProject = {
      ...selectedProject,
      endpoints: [...selectedProject.endpoints, { endpoint_name:newRoute.endpoint,method: newRoute.method }],
    };

    try {
      const response = await axios.get('http://localhost:3000/add-endpoint?project=test1&user=2345');
    } catch (error) {
      console.log(error)
    }

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.project_name === selectedProject.project_name ? updatedProject : project
      )
    );
    setSelectedProject(updatedProject);
    setNewRoute({ method: 'GET', endpoint: '', response: '' });
    setIsCreatingRoute(false);
  };

  const handleRouteSelect = (endpoint) => {
    setSelectedEndpoint(endpoint);
    setIsCreatingRoute(false); // Reset when selecting an endpoint
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedEndpoint(project.endpoints[0] || null);
    setIsCreatingRoute(false); // Reset when changing projects
    setNewRoute({ method: 'GET', endpoint: '', response: '' }); // Clear form when changing projects
  };

  return (
    <>
      <Navbar
        selectedProject={selectedProject}
        projects={projects}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        setSelectedProject={handleProjectSelect}
        setIsCreatingProject={setIsCreatingProject}
      />
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="w-1/5 bg-green-600 text-white p-4">
          <ul>
            {selectedProject && selectedProject.endpoints && selectedProject.endpoints.length > 0 ? (
              selectedProject.endpoints.map((endpoint, index) => (
                <li key={index}
                  className={`mb-2 ${selectedEndpoint === endpoint ? 'bg-green-800' : 'bg-green-700'} rounded`}
                  onClick={() => handleRouteSelect(endpoint)}>
                  <button className='w-full h-full p-2 text-left'>
                    <span className="font-bold">{endpoint.method}</span> - {endpoint.endpoint_name}
                  </button>
                </li>
              ))
            ) : (
              <li className="mb-2 p-2 bg-green-800 rounded">No routes available</li>
            )}
          </ul>
          <button
            className="bg-green-800 w-full mt-4 p-2 rounded"
            onClick={() => setIsCreatingRoute(true)}
          >
            Create Route
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-4">
          {/* Endpoint Details or Route Creation Form */}
          {isCreatingRoute ? (
            <div className="bg-white p-5 rounded shadow-lg">
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
                className="border h-[250px] p-2 w-full mb-4 rounded"
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
          ) : (
            selectedEndpoint && (
              <div className="bg-white p-5 rounded shadow-lg">
                <h2 className="text-lg font-bold mb-4">Endpoint Details</h2>
                <p><strong>Method:</strong> {selectedEndpoint.method}</p>
                <p><strong>Endpoint Name:</strong> {selectedEndpoint.endpoint_name}</p>
                {/* Add any additional details as needed */}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

export default App;
