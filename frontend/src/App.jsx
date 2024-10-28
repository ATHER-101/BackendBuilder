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
  const [isConnectingDatabase, setIsConnectingDatabase] = useState(false);
  const [databaseDetails, setDatabaseDetails] = useState({
    host: '',
    port: '',
    user: '',
    password: '',
    database: '',
  });

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3000/data?user=2345');
      const fetchedProjects = response.data.projects;
      console.log(fetchedProjects);
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

  const createProject = async () => {
    if (!newProjectName) return;

    try {
      await axios.get(`http://localhost:3000/add-project?project=${newProjectName}&user=2345`);

      const newProject = { project_name: newProjectName, endpoints: [] };
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
      setNewProjectName('');
      setIsCreatingProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const createRoute = async () => {
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(newRoute.response);
    } catch (error) {
      console.error("Invalid JSON format for the expected response:", error);
      return;
    }

    const updatedProject = {
      ...selectedProject,
      endpoints: [...selectedProject.endpoints, { endpoint_name: newRoute.endpoint, method: newRoute.method }],
    };

    try {
      const response = await axios.post(
        `http://localhost:3000/add-endpoint?project=${selectedProject.project_name}&user=2345`,
        {
          endpoint_name: newRoute.endpoint,
          method: newRoute.method,
          ...parsedResponse
        }
      );

      console.log(response.data);
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.project_name === selectedProject.project_name ? updatedProject : project
        )
      );

    } catch (error) {
      console.error('Error creating route:', error);
    }

    setSelectedProject(updatedProject);
    setNewRoute({ method: 'GET', endpoint: '', response: '' });
    setIsCreatingRoute(false);
  };

  const connectDatabase = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/connect-db?project=${selectedProject.project_name}&user=2345`,
        databaseDetails
      );

      console.log(response.data);

      const updatedProject = {
        ...selectedProject,
        database: databaseDetails,
      };

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.project_name === selectedProject.project_name ? updatedProject : project
        )
      );

      setSelectedProject(updatedProject);
      setIsConnectingDatabase(false);
    } catch (error) {
      console.error('Error connecting database:', error);
    }
  };

  const handleRouteSelect = (endpoint) => {
    setSelectedEndpoint(endpoint);
    setIsCreatingRoute(false);
    setIsConnectingDatabase(false);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedEndpoint(project.endpoints[0] || null);
    setIsCreatingRoute(false);
    setNewRoute({ method: 'GET', endpoint: '', response: '' });
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
            onClick={() => {
              setIsCreatingRoute(true);
              setIsConnectingDatabase(false);
            }}
          >
            Create Route
          </button>

          {/* Database Information */}
          {selectedProject?.database ? (
            <div className='bg-green-800 w-full mt-6 p-2 rounded text-left'>
              <span className="font-bold">DB</span> - {selectedProject.database.database}
            </div>
          ) : (
            <button
              className="bg-green-800 w-full mt-6 p-2 rounded"
              onClick={() => setIsConnectingDatabase(true)}
            >
              Connect Database
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="w-4/5 p-4">
          {isConnectingDatabase ? (
            <div className="bg-white p-5 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">Connect Database</h2>
              <input
                type="text"
                placeholder="Host"
                className="border p-2 w-full mb-4 rounded"
                value={databaseDetails.host}
                onChange={(e) => setDatabaseDetails({ ...databaseDetails, host: e.target.value })}
              />
              <input
                type="text"
                placeholder="Port"
                className="border p-2 w-full mb-4 rounded"
                value={databaseDetails.port}
                onChange={(e) => setDatabaseDetails({ ...databaseDetails, port: e.target.value })}
              />
              <input
                type="text"
                placeholder="User"
                className="border p-2 w-full mb-4 rounded"
                value={databaseDetails.user}
                onChange={(e) => setDatabaseDetails({ ...databaseDetails, user: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 w-full mb-4 rounded"
                value={databaseDetails.password}
                onChange={(e) => setDatabaseDetails({ ...databaseDetails, password: e.target.value })}
              />
              <input
                type="text"
                placeholder="Database"
                className="border p-2 w-full mb-4 rounded"
                value={databaseDetails.database}
                onChange={(e) => setDatabaseDetails({ ...databaseDetails, database: e.target.value })}
              />
              <button
                className="bg-green-800 text-white px-4 py-2 rounded mr-2"
                onClick={connectDatabase}
              >
                Connect Database
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setIsConnectingDatabase(false)}
              >
                Cancel
              </button>
            </div>
          ) : isCreatingRoute ? (
            <div className="bg-white p-5 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">Create New Route</h2>
              <select
                className="border p-2 w-full mb-4 rounded"
                value={newRoute.method}
                onChange={(e) => setNewRoute({ ...newRoute, method: e.target.value })}
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
                onChange={(e) => setNewRoute({ ...newRoute, endpoint: e.target.value })}
              />
              <textarea
                placeholder="Expected Response (JSON)"
                className="border p-2 w-full mb-4 rounded"
                value={newRoute.response}
                onChange={(e) => setNewRoute({ ...newRoute, response: e.target.value })}
              />
              <button
                className="bg-green-800 text-white px-4 py-2 rounded mr-2"
                onClick={createRoute}
              >
                Create Route
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setIsCreatingRoute(false)}
              >
                Cancel
              </button>
            </div>
          ) : selectedEndpoint ? (
            <div className="bg-white p-5 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">Endpoint Details</h2>
              <p><strong>Method:</strong> {selectedEndpoint.method}</p>
              <p><strong>Endpoint Name:</strong> {selectedEndpoint.endpoint_name}</p>
              <p><strong>Endpoint Link:</strong>
                <a href={`https://builder-nz8k.onrender.com/2345/${selectedProject.project_name}/${selectedEndpoint.endpoint_name}`} target="_blank" rel="noopener noreferrer" className='pl-2'>
                  {`https://builder-nz8k.onrender.com/2345/${selectedProject.project_name}/${selectedEndpoint.endpoint_name}`}
                </a>
              </p>
            </div>
          ) : (
            <div className="bg-white p-5 rounded shadow-lg">
              <h2 className="text-lg font-bold">No Route Selected</h2>
            </div>
          )}
        </div>
      </div >

      {isCreatingProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
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
      )
      }
    </>
  );
}

export default App;
