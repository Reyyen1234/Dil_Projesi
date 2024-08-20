import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './languagesPage.css';

const LanguagesPage = () => {
    const { userType } = useParams();
    const [language, setLanguage] = useState('en');
    const [data, setData] = useState({});
    const [trData, setTrData] = useState({});
    const [newLangData, setNewLangData] = useState({});
    const [newLangName, setNewLangName] = useState('New Language');
    const [newLangFileName, setNewLangFileName] = useState(''); // State for the new language file name
    const [newKey, setNewKey] = useState(''); // State for the new key
    const [newValue, setNewValue] = useState(''); // State for the new value
    const [selectedLanguageFile, setSelectedLanguageFile] = useState('en');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data for selected language
        axios.get(`http://localhost:5000/api/${userType}/en`)
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching English data:', error));

        axios.get(`http://localhost:5000/api/${userType}/tr`)
            .then(response => setTrData(response.data))
            .catch(error => console.error('Error fetching Turkish data:', error));

        if (language !== 'en' && language !== 'tr') {
            axios.get(`http://localhost:5000/api/${userType}/${language}`)
                .then(response => {
                    const fetchedData = response.data;
                    setNewLangData(fetchedData);
                    setNewLangName(fetchedData.langName || 'New Language');
                })
                .catch(error => console.error('Error fetching new language data:', error));
        }
    }, [userType, language]);

    const handleInputChange = (key, value) => {
        setNewLangData(prevData => ({ ...prevData, [key]: value }));
    };

    const handleAddLanguage = () => {
        if (!newLangFileName) {
            alert('Please enter a name for the new language.');
            return;
        }

        if (Object.keys(newLangData).length === 0) {
            alert('Please enter valid language data before adding.');
            return;
        }

        axios.post(`http://localhost:5000/api/${userType}/${newLangFileName}`, newLangData)
            .then(response => {
                alert('Language added successfully!');
                return axios.get(`http://localhost:5000/api/${userType}/${newLangFileName}`);
            })
            .then(res => {
                setData(res.data);
                setNewLangFileName(''); // Clear the input field after adding
                setNewLangData({}); // Clear the language data after adding
            })
            .catch(error => console.error('Error adding language:', error));
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
                <label>Select language file to update:</label>
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
                            <th>{newLangName}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.keys(data).map(key => (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>{data[key]}</td>
                                    <td>{trData[key] || '-'}</td>
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
                        value={newLangFileName}
                        onChange={(e) => setNewLangFileName(e.target.value)}
                        placeholder="Enter new language name"
                    />
                    {
                        // Render translation inputs only if newLangData is not empty
                        Object.keys(newLangData).length > 0 && Object.keys(newLangData).map(key => (
                            <div key={key} className="input-wrapper">
                                <input
                                    type="text"
                                    value={newLangData[key] || ''}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    placeholder={`Enter ${newLangName} translation`}
                                />
                            </div>
                        ))
                    }
                </div>
                <div className="button-group">
                    <button onClick={handleAddLanguage} className="btn">Add Language</button>
                    <button onClick={handleDeleteLanguage} className="btn">Delete Current Language</button>
                    <button onClick={handleGoBack} className="btn">Back to Modules</button>
                </div>
            </div>
        </div>
    );
};

export default LanguagesPage;

