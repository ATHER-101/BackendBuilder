import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CreateRoute from './components/CreateRoute';
import ConnectDatabase from './components/ConnectDatabase';
import ProjectDetails from './components/ProjectDetails';
import AddTable from './components/AddTable';
import CreateDBRoute from './components/CreateDBRoute';

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
  const [isCreatingDBRoute, setIsCreatingDBRoute] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [isConnectingDatabase, setIsConnectingDatabase] = useState(false);
  const [databaseDetails, setDatabaseDetails] = useState({
    host: '',
    port: '',
    user: '',
    password: '',
    database: '',
  });

  const [isAddingTable, setIsAddingTable] = useState(false);

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
    if (!isCreatingRoute && !isConnectingDatabase) {
      navigate('/');
    }
  }, []);

  const navigate = useNavigate();

  const createProject = async () => {
    if (!newProjectName) return;

    try {
      await axios.get(`http://localhost:3000/add-project?project=${newProjectName}&user=2345`);

      const newProject = { project_name: newProjectName, endpoints: [] };
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
      setNewProjectName('');
      setIsCreatingProject(false);
      setSelectedEndpoint(null);
      navigate('/');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const createRoute = async () => {
    let parsedResponse;

    try {
      // Attempt to parse the newRoute.response as JSON
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
    setSelectedEndpoint(updatedProject.endpoints[0]);
    navigate('/');
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
      navigate('/');
    } catch (error) {
      console.error('Error connecting database:', error);
    }
  };

  const handleRouteSelect = (endpoint) => {
    setSelectedEndpoint(endpoint);
  };

  return (
    <>
      {/* <Router> */}
      <Navbar
        selectedProject={selectedProject}
        projects={projects}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        setSelectedProject={setSelectedProject}
        setIsCreatingProject={setIsCreatingProject}
        setSelectedEndpoint={setSelectedEndpoint}
      />
      <div className="flex">
        {selectedProject && (
          <Sidebar
            selectedProject={selectedProject}
            selectedEndpoint={selectedEndpoint}
            handleRouteSelect={handleRouteSelect}
            setIsCreatingRoute={setIsCreatingRoute}
            setIsCreatingDBRoute={setIsCreatingDBRoute}
            setIsConnectingDatabase={setIsConnectingDatabase}
          />
        )}
        <div className="w-4/5 p-5">
          <Routes> {/* Changed from Switch to Routes */}
            <Route path="/create-dummy-route" element={isCreatingRoute ? (
              <CreateRoute
                newRoute={newRoute}
                setNewRoute={setNewRoute}
                createRoute={createRoute}
                setIsCreatingRoute={setIsCreatingRoute}
              />
            ) : null} />
            <Route path="/create-database-route" element={isCreatingDBRoute ? (
              <CreateDBRoute
                setIsCreatingDBRoute={setIsCreatingDBRoute}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                setProjects={setProjects}
              />
            ) : null} />
            <Route path="/connect-database" element={isConnectingDatabase ? (
              <ConnectDatabase
                databaseDetails={databaseDetails}
                setDatabaseDetails={setDatabaseDetails}
                connectDatabase={connectDatabase}
                setIsConnectingDatabase={setIsConnectingDatabase}
              />
            ) : null} />
            <Route path="/add-table" element={<AddTable
              setIsAddingTable={setIsAddingTable}
              selectedProject={selectedProject} />}
            />
            <Route path="/" element={selectedEndpoint ? (
              <ProjectDetails
                endpoint={selectedEndpoint}
                selectedProject={selectedProject}
              />
            ) : (
              <div>Select a route to view details</div>
            )} />
          </Routes>
        </div>
      </div>
      {/* </Router> */}

      {/* Modal for Creating Project */}
      {isCreatingProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-lg font-bold mb-4">Create New Project</h2>
            <input
              type="text"
              placeholder="Project Name"
              className="border p-2 w-full mb-4 rounded"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <div className="flex justify-end">
              <button className="bg-gray-300 text-black px-4 py-2 rounded mr-2" onClick={() => setIsCreatingProject(false)}>
                Cancel
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={createProject}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
