// components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ selectedProject, selectedEndpoint, handleRouteSelect, setIsCreatingRoute, setIsCreatingDBRoute, setIsConnectingDatabase }) => {
  return (
    <div className="w-1/5 h-screen bg-green-600 text-white p-4">
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

      <Link to='/create-dummy-route'>
        <button
          className="bg-green-800 w-full mt-1 p-2 rounded"
          onClick={() => {
            setIsCreatingRoute(true);
            setIsConnectingDatabase(false);
          }}
        >
          Create Dummy Route
        </button>
      </Link>

      {/* Database Information */}
      {selectedProject?.database ? (
        <>
          <Link to='/create-database-route'>
            <button
              className="bg-green-800 w-full mt-2 p-2 rounded"
              onClick={() => {
                setIsCreatingDBRoute(true);
                setIsConnectingDatabase(false);
              }}
            >
              Create Database Route
            </button>
          </Link>
          <div className='bg-green-700 w-full mt-7 p-2 rounded text-left'>
            <span className="font-bold">DB</span> - {selectedProject.database.database}

            {/* Create Table Button */}
          </div>
          <Link to='/add-table'>
            <button
              className="bg-green-800 w-full mt-3 p-2 rounded"
              onClick={() => console.log("Create Table Clicked")}
            >
              Add Table
            </button>
          </Link>
        </>
      ) : (
        <Link to='/connect-database'>
          <button
            className="bg-green-800 w-full mt-6 p-2 rounded"
            onClick={() => setIsConnectingDatabase(true)}
          >
            Connect Database
          </button>
        </Link>
      )}
    </div>
  );
};

export default Sidebar;
