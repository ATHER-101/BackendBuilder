// components/ProjectDetails.js
import React from 'react';

const ProjectDetails = ({ endpoint, selectedProject }) => {
    return (
        <div className="bg-white p-5 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Project: {selectedProject.project_name}</h2>
            {endpoint ? (
                <div>
                    <div className="mb-2">
                        <span className="font-bold">Endpoint Name:</span> {endpoint.endpoint_name}
                    </div>
                    <div className="mb-2">
                        <span className="font-bold">HTTP Method:</span> {endpoint.method}
                    </div>
                    <p><strong>Endpoint Link:</strong>
                        <a href={`https://builder-nz8k.onrender.com/2345/${selectedProject.project_name}/${endpoint.endpoint_name}`} target="_blank" rel="noopener noreferrer" className='pl-2'>
                            {`https://builder-nz8k.onrender.com/2345/${selectedProject.project_name}/${endpoint.endpoint_name}`}
                        </a>
                    </p>
                </div>
            ) : (
                <div>No endpoint selected. Please select an endpoint from the sidebar.</div>
            )}
        </div>
    );
};

export default ProjectDetails;
