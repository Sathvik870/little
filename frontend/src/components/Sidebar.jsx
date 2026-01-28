import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
    return (
        <div className="sidebar">
            <h2>Diabetes Predictor</h2>
            <ul>
                <li><NavLink to="/" end>Model Performance</NavLink></li>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                <li><NavLink to="/prediction">Prediction</NavLink></li>
            </ul>
        </div>
    );
}

export default Sidebar;