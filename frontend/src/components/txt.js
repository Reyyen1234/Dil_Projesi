/* import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './languagesPage.css';

const LanguagesPage = () => {
    const { userType } = useParams();
    const [language, setLanguage] = useState('en');
    const [data, setData] = useState({});
    const [trData, setTrData] = useState({});
    const [newLangData, setNewLangData] = useState({});
    const [newLangName, setNewLangName] = useState('');  // Initialize with empty string
    const [newLangTranslation, setNewLangTranslation] = useState('');
    const [selectedLanguageFile, setSelectedLanguageFile] = useState('en');
    const [newKey, setNewKey] = useState(''); // State for the new key
    const [newValue, setNewValue] = useState(''); // State for the new value
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:5000/api/${userType}/en`)
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching English data:', error));
    
        axios.get(`http://localhost:5000/api/${userType}/tr`)
            .then(response => setTrData(response.data))
            .catch(error => console.error('Error fetching Turkish data:', error));
    
        if (language !== 'en' && language !== 'tr') {
            fetchLanguageData(language);
        }
    }, [userType, language]);

    const fetchLanguageData = (lang) => {
        axios.get(`http://localhost:5000/api/${userType}/${lang}`)
            .then(response => setNewLangData(response.data))
            .catch(error => console.error('Error fetching updated language data:', error));
    };

    const handleAddLanguage = () => {
        if (!newLangName || !newLangTranslation) {
            alert('Please provide both the language name and the translation for "hello".');
            return;
        }
        const newLanguageData = { hello: newLangTranslation };

        axios.post(`http://localhost:5000/api/${userType}/${newLangName}`, newLanguageData)
            .then(response => {
                alert(`Language file "${newLangName}.json" created successfully!`);
                fetchLanguageData(newLangName);  // Fetch the new language data
                // Optionally keep the newLangName for displaying in the table
            })
            .catch(error => {
                console.error('Error creating new language:', error.response ? error.response.data : error.message);
                alert('Failed to create new language. Please try again.');
            });
    };

    const handleTranslationChange = (e) => {
        setNewLangTranslation(e.target.value);
    };
    
    const handleAddKey = async () => {
        if (!newKey || !newValue) {
            alert('Please enter both a key and a value.');
            return;
        }
    
        const languageFile = selectedLanguageFile; // 'en' or 'tr'
        const payload = { key: newKey, value: newValue };
    
        try {
            // Make the POST request to add the key
            await axios.post(`http://localhost:5000/api/${userType}/${languageFile}/add-key`, payload);
    
            // Fetch the updated data from the backend
            const response = await axios.get(`http://localhost:5000/api/${userType}/${languageFile}`);
            if (languageFile === 'en') {
                setData(response.data); // Update the EN data
            } else if (languageFile === 'tr') {
                setTrData(response.data); // Update the TR data
            }
    
            // Clear the input fields
            setNewKey('');
            setNewValue('');
            alert(`Key added successfully to ${languageFile}.json!`);
        } catch (error) {
            console.error('Error adding key:', error);
            alert('Failed to add the key.');
        }
    };

    const handleDeleteLanguage = () => {
        axios.delete(`http://localhost:5000/api/${userType}/${language}`)
            .then(response => {
                alert('Language deleted successfully!');
                setLanguage('en');
            })
            .catch(error => console.error('Error deleting language:', error));
    };

    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div>
            <div className="container">
                <h1 className="title">Karcin Dil Project</h1>
                <h1>Languages Page for {userType}</h1>
                <label>Select language JSON file:</label>
                <select
                    value={selectedLanguageFile}
                    onChange={(e) => setSelectedLanguageFile(e.target.value)}
                >
                    <option value="en">en.json</option>
                    <option value="tr">tr.json</option>
                </select>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Keys</th>
                            <th>EN</th>
                            <th>TR</th>
                         <th>{newLangName || 'new Language'}</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
            Object.keys(selectedLanguageFile === 'en' ? data : trData).map(key => (
                <tr key={key}>
                    <td>{key}</td>
                    <td>{selectedLanguageFile === 'en' ? data[key] : '-'}</td>
                    <td>{selectedLanguageFile === 'tr' ? trData[key] : '-'}</td>
                    <td>{newLangData[key] || ''}</td>
                </tr>
            ))
        }
                    </tbody>
                </table>
                <div className='input-section'>
                <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter new key"
                className="input-text"
            />
            <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter new value"
                className="input-text"
            />
            <button onClick={handleAddKey}>Add Key</button>
                    <input
                        type="text"
                        value={newLangName}
                        onChange={(e) => setNewLangName(e.target.value)}
                        placeholder="Enter new language name"
                    />
                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="Enter translation for 'hello'"
                            value={newLangTranslation}
                            onChange={handleTranslationChange}
                        />
                    </div>
                    
                </div>
                <div className="button-group">
                    <button onClick={handleAddLanguage} className="btn">Add New Language</button>
                    <button onClick={handleDeleteLanguage} className="btn">Delete Current Language</button>
                    <button onClick={handleGoBack} className="btn">Back to Modules</button>
                </div>
            </div>
        </div>
    );
};

export default LanguagesPage;
 */