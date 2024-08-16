import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import "./languagesPage.css"

const LanguagesPage = () => {
    const { userType } = useParams();
    const [language, setLanguage] = useState('en');
    const [data, setData] = useState({});
    const [trData, setTrData] = useState({});
    const [newLangData, setNewLangData] = useState({});
    const [newLangName, setNewLangName] = useState('New Language');
   
    useEffect(() => {
        // Fetch English data
        axios.get(`http://localhost:5000/api/${userType}/en`)
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching English data:', error));
    
        // Fetch Turkish data
        axios.get(`http://localhost:5000/api/${userType}/tr`)
            .then(response => setTrData(response.data))
            .catch(error => console.error('Error fetching Turkish data:', error));
    
        // Fetch New Language data (if it exists)
        if (language !== 'en' && language !== 'tr') {
            axios.get(`http://localhost:5000/api/${userType}/${language}`)
                .then(response => {
                    const fetchedData = response.data;
                    setNewLangData(fetchedData);
                    if (fetchedData.langName) {
                        setNewLangName(fetchedData.langName);
                    } else {
                        setNewLangName('New Language'); // Default if no langName is present
                    }
                })
                .catch(error => console.error('Error fetching new language data:', error));
        }
    }, [userType, language]);
    
        const handleAddLanguage = () => {
            if (Object.keys(newLangData).length === 0) {
                alert('Please enter valid language data before adding.');
                return;
            }
        
            // Ensure correct type for new languages
            axios.post(`http://localhost:5000/api/newLanguages/${language}`, newLangData)
                .then(response => {
                    alert('Language added successfully!');
                    // Optionally refresh the data
                    return axios.get(`http://localhost:5000/api/${userType}/${language}`);
                })
                .then(res => {
                    setData(res.data); // Update the data after re-fetching
                })
                .catch(error => console.error('Error adding language:', error));
        };
        
    const handleUpdateLanguage = () => {
        if (Object.keys(newLangData).length === 0) {
            alert('Please enter data to update.');
            return;
        }
    
        axios.put(`http://localhost:5000/api/${userType}/${language}`, newLangData)
            .then(response => {
                alert('Language updated successfully!');
                setData(response.data); // Refresh data with updated content
            })
            .catch(error => console.error('Error updating language:', error));
    };
    

    const handleDeleteLanguage = () => {
        axios.delete(`http://localhost:5000/api/${userType}/${language}`)
            .then(response => {
                alert('Language deleted successfully!');
                setLanguage('en'); // Default back to English
            })
            .catch(error => console.error('Error deleting language:', error));
    };

    return (
        <div>
             <div className="container">
             <h1 className="title">Karcin Dil Project</h1>
              {/*   <button onClick={() => handleLanguageChange('newLang', 'New Language')}>New Language</button> */}
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
                    <td>{trData[key] || '-'}</td> {/* Show Turkish data or a dash if it doesn't exist */}
                    <td>{newLangData[key] || '-'}</td> {/* Show new language data or a dash */}
                 </tr>
                            ))
                }
            </tbody>
        </table>
            <textarea
                placeholder="Enter a valid JSON object, e.g. { 'hello': 'Merhaba' }"
                defaultValue={JSON.stringify(newLangData, null, 2)}
                onChange={(e) => {
        try {
            const jsonData = JSON.parse(e.target.value);
            setNewLangData(jsonData);
        } catch (error) {
            console.error('Invalid JSON input:', error);
            }
              }}
            />
             <button onClick={handleAddLanguage}>Add Language</button> 
            <button onClick={handleUpdateLanguage}>Update Language</button>
            <button onClick={handleDeleteLanguage}>Delete Current Language</button>
        </div>
        </div>
    );
};

export default LanguagesPage;