// components/ConnectDatabase.js
import React from 'react';
import { Link } from 'react-router-dom';

const ConnectDatabase = ({ databaseDetails, setDatabaseDetails, connectDatabase, setIsConnectingDatabase }) => {
  return (
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
      <Link to='/'>
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded"
          onClick={() => setIsConnectingDatabase(false)}
        >
          Cancel
        </button>
      </Link>
    </div>
  );
};

export default ConnectDatabase;
