import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './modul.css'

const Module = () => {
    const navigate = useNavigate();
    const [moduleName, setModuleName] = useState('');
    const [includeNewLanguageFile, setIncludeNewLanguageFile] = useState(false);
    const [modules, setModules] = useState([]);
    
    useEffect(() => {
        axios.get('http://localhost:5000/api/modules')
            .then(response => {
                setModules(response.data); // Save modules from the backend to state
            })
            .catch(error => {
                console.error('Error fetching modules:', error);
            });
    }, []);

    const handleButtonClick = (folderName) => {
        if (folderName) {
            navigate(`/languages/${folderName}`);
        }
    };
    const handleCreateModule = () => {
        if (moduleName) {
            // Send a POST request to create the module
            axios.post('http://localhost:5000/api/create-module', { moduleName, includeNewLanguageFile })
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

    return (
        <div className='container'>
            <h1 className='title'>Modul Page</h1>
             <div className="module-container">
                <div className="module-card" onClick={() => handleButtonClick('client')}>
                    <h2>Client</h2>
                    <p>This folder contains client-specific data.</p>
                </div>
                <div className="module-card" onClick={() => handleButtonClick('admin')}>
                    <h2>Admin</h2>
                    <p>This folder contains admin-specific data.</p>
                </div>
            </div> 
            <div className="module-container">
                {modules.map((module) => (
                    <div key={module} className="module-card" onClick={() => handleButtonClick(module)}>
                        <h2>{module}</h2>
                        <p>This folder contains {module}-specific data.</p>
                    </div>
                ))}
            </div>
            <input
                type="text"
                placeholder="Enter module name"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
            />
           {/*  <div>
                <input
                    type="checkbox"
                    checked={includeNewLanguageFile}
                    onChange={(e) => setIncludeNewLanguageFile(e.target.checked)}
                />
                <label>Include newLanguage.json</label>
            </div> */}
            <button onClick={handleCreateModule}>Create Module</button>
        </div>
    );
};

export default Module;



