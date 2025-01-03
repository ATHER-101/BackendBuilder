// components/CreateRoute.js
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateDBRoute = ({ setIsCreatingDBRoute, selectedProject, setSelectedProject, setProjects }) => {
	const [newDBRoute, setNewDBRoute] = useState({
		method: 'get',
		endpoint: '',
	});

	const navigate = useNavigate();

	const [tableName, setTableName] = useState("");
	const [response, setResponse] = useState("");

	const createRoute = async () => {
		if (newDBRoute.method === 'get') {
			const newRouteData = {
				endpoint_name: newDBRoute.endpoint,
				method: newDBRoute.method,
				table_name: tableName,
				query: response
			};

			const updatedEndpoints = [
				...selectedProject.endpoints,
				{ endpoint_name: newDBRoute.endpoint, method: newDBRoute.method.toUpperCase() }
			];

			const updatedProject = {
				...selectedProject,
				endpoints: updatedEndpoints,
			};

			try {
				const response = await axios.post(
					`http://localhost:3000/extract-db?project=${selectedProject.project_name}&user=2345`,
					newRouteData
				);

				console.log(response.data);

				// Update the projects list and selected project
				setProjects((prevProjects) =>
					prevProjects.map((project) =>
						project.project_name === selectedProject.project_name ? updatedProject : project
					)
				);

				// Update the selected project state
				setSelectedProject(updatedProject);

				// Reset the form and state after creating the route
				setNewDBRoute({ method: 'GET', endpoint: '' });
				setTableName('');
				setResponse('')
				setIsCreatingDBRoute(false);

				// Optionally redirect or update UI state
				navigate('/');
			} catch (error) {
				console.error('Error creating route:', error);
			}

		} else if (newDBRoute.method === 'post') {
			const newRouteData = {
				endpoint_name: newDBRoute.endpoint,
				method: newDBRoute.method,
				table_name: tableName
			};

			const updatedEndpoints = [
				...selectedProject.endpoints,
				{ endpoint_name: newDBRoute.endpoint, method: newDBRoute.method.toUpperCase() }
			];

			const updatedProject = {
				...selectedProject,
				endpoints: updatedEndpoints,
			};

			try {
				const response = await axios.post(
					`http://localhost:3000/insert-db?project=${selectedProject.project_name}&user=2345`,
					newRouteData
				);

				console.log(response.data);

				// Update the projects list and selected project
				setProjects((prevProjects) =>
					prevProjects.map((project) =>
						project.project_name === selectedProject.project_name ? updatedProject : project
					)
				);

				// Update the selected project state
				setSelectedProject(updatedProject);

				// Reset the form and state after creating the route
				setNewDBRoute({ method: 'GET', endpoint: '' });
				setTableName('');
				setIsCreatingDBRoute(false);

				// Optionally redirect or update UI state
				navigate('/');
			} catch (error) {
				console.error('Error creating route:', error);
			}
		}
	};


	return (
		<div className="bg-white p-5 rounded shadow-lg">
			<h2 className="text-lg font-bold mb-4">Create New Route</h2>
			<select
				className="border p-2 w-full mb-4 rounded"
				value={newDBRoute.method}
				onChange={(e) => setNewDBRoute({ ...newDBRoute, method: e.target.value })}
			>
				<option value="get">GET</option>
				<option value="post">POST</option>
				<option value="put">PUT</option>
				<option value="delete">DELETE</option>
			</select>
			<input
				type="text"
				placeholder="Endpoint"
				className="border p-2 w-full mb-4 rounded"
				value={newDBRoute.endpoint}
				onChange={(e) => setNewDBRoute({ ...newDBRoute, endpoint: e.target.value })}
			/>
			<input
				type="text"
				placeholder="Table Name"
				className="border p-2 w-full mb-4 rounded"
				value={tableName}
				onChange={(e) => setTableName(e.target.value)}
			/>
			{newDBRoute.method == 'get' ?
				<textarea
					placeholder="Expected Response (prompt)"
					className="border p-2 h-[150px] w-full mb-4 rounded"
					value={response}
					onChange={(e) => setResponse(e.target.value)}
				/> : <></>
			}
			<button
				className="bg-green-800 text-white px-4 py-2 rounded mr-2"
				onClick={createRoute}
			>
				Create Route
			</button>
			<Link to='/'>
				<button
					className="bg-gray-300 text-black px-4 py-2 rounded"
					onClick={() => setIsCreatingDBRoute(false)}
				>
					Cancel
				</button>
			</Link>
		</div>
	);
};

export default CreateDBRoute;
