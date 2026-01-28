import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
    const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200";
    const activeLinkClasses = "bg-gray-900 text-white";
    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="h-20 flex items-center justify-center border-b border-gray-700">
                <h2 className="text-2xl font-bold">Diabetes AI</h2>
            </div>

            <nav className="flex-1">
                <ul>
                    <li>
                        <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/model-performance" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                            Model Performance
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/prediction" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                            Prediction
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;