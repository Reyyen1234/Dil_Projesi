import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './languagesPage.css';

const LanguagesPage = () => {
    const { userType } = useParams();
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [selectedLanguageFile, setSelectedLanguageFile] = useState('');
    const [data, setData] = useState({});
    const [newLangName, setNewLangName] = useState('');
    const [newLangTranslation, setNewLangTranslation] = useState('');
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const navigate = useNavigate();

    const fetchAvailableLanguages = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/${userType}/available-languages`);
            setAvailableLanguages(response.data);
            // Set the default language if available
            if (response.data.length > 0 && !selectedLanguageFile) {
                setSelectedLanguageFile(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching available languages:', error);
        }
    };

    const fetchLanguageData = async (lang) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/${userType}/${lang}`);
            setData(response.data);
        } catch (error) {
            console.error(`Error fetching ${lang} data:`, error);
        }
    };

    useEffect(() => {
        // Fetch available languages on component mount
        fetchAvailableLanguages();
    }, [userType]);

    useEffect(() => {
        if (selectedLanguageFile) {
            fetchLanguageData(selectedLanguageFile);
        }
    }, [selectedLanguageFile]);

    const handleAddLanguage = async () => {
        if (!newLangName || !newLangTranslation) {
            alert('Please provide both the language name and the translation for "hello".');
            return;
        }
        const newLanguageData = { hello: newLangTranslation };

        try {
            await axios.post(`http://localhost:5000/api/${userType}/${newLangName}`, newLanguageData);
            alert(`Language file "${newLangName}.json" created successfully!`);
            // Fetch available languages to update the list
            await fetchAvailableLanguages();
            setSelectedLanguageFile(newLangName);
            setNewLangName('');
            setNewLangTranslation('');
        } catch (error) {
            console.error('Error creating new language:', error.response ? error.response.data : error.message);
            alert('Failed to create new language. Please try again.');
        }
    };

    const handleTranslationChange = (e) => {
        setNewLangTranslation(e.target.value);
    };

    const handleAddKey = async () => {
        if (!newKey || !newValue) {
            alert('Please enter both a key and a value.');
            return;
        }

        const payload = { key: newKey, value: newValue };

        try {
            await axios.post(`http://localhost:5000/api/${userType}/${selectedLanguageFile}/add-key`, payload);
            // Refetch the language data
            const response = await axios.get(`http://localhost:5000/api/${userType}/${selectedLanguageFile}`);
            setData(response.data);
            setNewKey('');
            setNewValue('');
            alert(`Key added successfully to ${selectedLanguageFile}.json!`);
        } catch (error) {
            console.error('Error adding key:', error);
            alert('Failed to add the key.');
        }
    };

    const handleDeleteLanguage = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/${userType}/${selectedLanguageFile}`);
            alert('Language deleted successfully!');
            // Fetch available languages to update the list
            await fetchAvailableLanguages();
            // Optionally select the first available language if any
            if (availableLanguages.length > 0) {
                setSelectedLanguageFile(availableLanguages[0]);
            } else {
                setData({});
            }
        } catch (error) {
            console.error('Error deleting language:', error);
        }
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
                    {availableLanguages.map(lang => (
                        <option key={lang} value={lang}>{`${lang}.json`}</option>
                    ))}
                </select>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Keys</th>
                            {availableLanguages.map(lang => (
                                <th key={lang}>{`${lang}.json`}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(data).map(key => (
                            <tr key={key}>
                                <td>{key}</td>
                                {availableLanguages.map(lang => (
                                    <td key={lang}>{lang === selectedLanguageFile ? data[key] || '-' : '-'}</td>
                                ))}
                            </tr>
                        ))}
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
