import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './modul.css';

const Module = () => {
    const navigate = useNavigate();
    const [moduleName, setModuleName] = useState('');
    const [modules, setModules] = useState([]);
    const [newModuleName, setNewModuleName] = useState(''); // State to handle new module name for update
    const [editingModule, setEditingModule] = useState(null); // Track the module being edited

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = () => {
        axios.get('http://localhost:5000/api/modules')
            .then(response => {
                setModules(response.data); // Save modules from the backend to state
            })
            .catch(error => {
                console.error('Error fetching modules:', error);
            });
    };

    const handleButtonClick = (folderName) => {
        if (folderName) {
            navigate(`/languages/${folderName}`);
        }
    };

    const handleCreateModule = () => {
        if (moduleName) {
            // Send a POST request to create the module
            axios.post('http://localhost:5000/api/create-module', { moduleName })
                .then(response => {
                    alert(response.data.message);
                    return axios.get('http://localhost:5000/api/modules');
                })
                .then(res => {
                    setModules(res.data); // Update the module list
                })
                .catch(error => {
                    console.error('Error creating module:', error);
                    alert('Error creating module');
                });
        } else {
            alert('Please enter a module name');
        }
    };

    const handleUpdateModuleName = (oldModuleName) => {
        if (!newModuleName) {
            alert('Please enter a new module name');
            return;
        }

        axios.put(`http://localhost:5000/api/modules/${oldModuleName}`, { newModuleName })
            .then(response => {
                console.log(response.data);
                alert(response.data.message);
                fetchModules(); // Refresh the module list
            })
            .catch(error => {
                console.error('Error:', error.response?.data || error.message);
                alert('Error updating module name');
            });
    };
    

    return (
        <div className='container'>
            <h1 className='title'>Module Page</h1>
            <div className="module-container">
                {modules.map((module) => (
                    <div key={module} className="module-card">
                        {editingModule === module ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter new module name"
                                    value={newModuleName}
                                    onChange={(e) => setNewModuleName(e.target.value)}
                                />
                                <button onClick={() => handleUpdateModuleName(module)}>Update Module Name</button>
                                <button onClick={() => setEditingModule(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <h2>{module}</h2>
                                <p>This folder contains {module}-specific data.</p>
                                <button onClick={() => setEditingModule(module)}>Edit Module Name</button>
                                <button onClick={() => handleButtonClick(module)}>Go to Module</button>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <input
                type="text"
                placeholder="Enter module name"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
            />
            <button onClick={handleCreateModule}>Create Module</button>
        </div>
    );
};

export default Module;




