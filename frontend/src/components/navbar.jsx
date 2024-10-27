// Navbar.js
import React, { useRef, useEffect } from 'react';

const Navbar = ({ selectedProject, projects, dropdownOpen, setDropdownOpen, setSelectedProject, setIsCreatingProject }) => {
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg py-2 px-6 flex justify-between items-center">
      <div className="text-xl font-bold text-green-600">My Projects</div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="bg-green-600 text-white px-4 py-2 rounded flex justify-between items-center w-48"
        >
          {/* Check if selectedProject is not null before accessing name */}
          {selectedProject ? selectedProject.project_name : 'Select a Project'}
          <span className="ml-2">&#x25BC;</span>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-1 p-2 bg-white rounded shadow-lg z-10 w-64">
            <ul className="max-h-48 overflow-auto">
              {projects.map((project, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-green-200 cursor-pointer"
                  onClick={() => {
                    setSelectedProject(project);
                    setDropdownOpen(false);
                  }}
                >
                  {project.project_name}
                </li>
              ))}
            </ul>
            <button
              className="bg-green-600 text-white w-full p-2 rounded"
              onClick={() => {
                setIsCreatingProject(true);
                setDropdownOpen(false);
              }}
            >
              New Project
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
