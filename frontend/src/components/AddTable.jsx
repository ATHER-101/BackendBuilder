// components/AddTable.js
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddTable = ({ setIsAddingTable, selectedProject }) => {
    const [tableName, setTableName] = useState('');
    const [columns, setColumns] = useState([{ columnName: '', columnType: 'string' }]);
    const navigate = useNavigate();

    const handleAddColumn = () => {
        setColumns([...columns, { columnName: '', columnType: 'string' }]);
    };

    const handleColumnChange = (index, key, value) => {
        const updatedColumns = [...columns];
        updatedColumns[index][key] = value;
        setColumns(updatedColumns);
    };

    const handleRemoveColumn = (index) => {
        const updatedColumns = columns.filter((_, colIndex) => colIndex !== index);
        setColumns(updatedColumns);
    };

    const handleAddTable = async () => {
        try {
            const response = await axios.post(
                `http://localhost:3000/make-table?project=${selectedProject.project_name}&user=2345`,
                { table_name: tableName, table_columns: columns }
            );

            console.log(response.data);

            setIsAddingTable(false);
            navigate('/');
        } catch (error) {
            console.error('Error Adding Table:', error);
        }

    };

    const handleCancel = () => {
        setIsAddingTable(false);
        navigate('/');
    };

    return (
        <div className="bg-white p-5 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Table</h2>
            <div className="mb-4">
                <input
                    id="tableName"
                    type="text"
                    className="border p-2 w-full rounded"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Table Name"
                />
            </div>

            {columns.map((column, index) => (
                <div key={index} className="flex items-center mb-2">
                    <input
                        type="text"
                        className="border p-2 w-4/5 rounded mr-2"
                        placeholder={`Table Column ${index + 1} Name`}
                        value={column.columnName}
                        onChange={(e) => handleColumnChange(index, 'columnName', e.target.value)}
                    />
                    <select
                        className="border p-2 w-1/3 rounded mr-2"
                        value={column.columnType}
                        onChange={(e) => handleColumnChange(index, 'columnType', e.target.value)}
                    >
                        <option value="string">String</option>
                        <option value="integer">Integer</option>
                        <option value="float">Float</option>
                    </select>
                    <button
                        className="text-green-800 font-bold p-2 rounded"
                        onClick={() => handleRemoveColumn(index)}
                    >
                        X
                    </button>
                </div>
            ))}

            <button
                className="bg-gray-300 text-black px-4 py-2 rounded mb-4"
                onClick={handleAddColumn}
            >
                + Add Column
            </button>

            <div className="flex justify-start mt-4">
                <button className="bg-green-700 text-white px-4 py-2 rounded mr-2" onClick={handleAddTable}>
                    Add Table
                </button>
                <button className="bg-gray-300 text-black px-4 py-2 rounded " onClick={handleCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddTable;
