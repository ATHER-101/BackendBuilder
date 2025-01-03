// components/CreateRoute.js
import React from 'react';
import { Link } from 'react-router-dom';

const CreateRoute = ({ newRoute, setNewRoute, createRoute, setIsCreatingRoute }) => {
  return (
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
        className="border p-2 h-[250px] w-full mb-4 rounded"
        value={newRoute.response}
        onChange={(e) => setNewRoute({ ...newRoute, response: e.target.value })}
      />
      <button
        className="bg-green-800 text-white px-4 py-2 rounded mr-2"
        onClick={createRoute}
      >
        Create Route
      </button>
      <Link to='/'>
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded"
          onClick={() => setIsCreatingRoute(false)}
        >
          Cancel
        </button>
      </Link>
    </div>
  );
};

export default CreateRoute;
