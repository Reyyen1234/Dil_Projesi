import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Modul from './components/Modul';
import LanguagesPage from './components/LanguagesPage';
import './styles.css';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Modul />} />
                <Route path="/languages/:userType" element={<LanguagesPage />} />
            </Routes>
        </Router>
    );
};

export default App;
