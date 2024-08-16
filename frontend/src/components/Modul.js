import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './modul.css'

const Modul = () => {
    const [userType, setUserType] = useState('');
    const navigate = useNavigate();

    const handleSelectChange = (event) => {
        setUserType(event.target.value);
    };

    const handleButtonClick = () => {
        if (userType) {
            navigate(`/languages/${userType}`);
        } else {
            alert('Please select a user type');
        }
    };

    return (
        <div>
            <h1 className='title'>Modul Page</h1>
        <div className="dropdown-container">
            <select value={userType} onChange={handleSelectChange}>
                <option value="">Select User Type</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
            </select>
            <button  onClick={handleButtonClick}>Go to Languages</button>
        </div>
        </div>
    );
};

export default Modul;
