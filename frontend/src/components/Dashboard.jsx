import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = "http://localhost:8000";

function Dashboard() {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/dashboard/analytics`)
            .then(response => setAnalytics(response.data))
            .catch(error => console.error("Error fetching dashboard data:", error));
    }, []);

    // FIX #1: Main guard clause. Stop rendering if data is not here yet.
    if (!analytics) {
        return <div className="text-center text-gray-500 mt-10">Loading dashboard analytics...</div>;
    }

    // FIX #2: Use optional chaining (?.) for robust data access.
    // This prevents crashes if the API response is missing a specific key.
    const diabetesDistData = {
        labels: analytics?.diabetes_distribution?.labels || [],
        datasets: [{
            data: analytics?.diabetes_distribution?.values || [],
            backgroundColor: ['#36A2EB', '#FF6384'],
        }],
    };
    
    const ageDistData = {
        labels: analytics?.age_distribution?.labels || [],
        datasets: [{
            label: 'Number of People',
            data: analytics?.age_distribution?.values || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    };
    
    const bmiDistData = {
        labels: analytics?.bmi_distribution?.labels || [],
        datasets: [{
            label: 'Number of People',
            data: analytics?.bmi_distribution?.counts || [],
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
        }],
    };

    const healthVsDiabetesData = {
        labels: analytics?.health_vs_diabetes?.labels || [],
        datasets: [{
            label: '% with Diabetes',
            data: analytics?.health_vs_diabetes?.diabetes_percentage || [],
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
        }]
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Diabetes Distribution</h3>
                    <Pie data={diabetesDistData} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Diabetes Rate by General Health</h3>
                    <Bar data={healthVsDiabetesData} options={{ indexAxis: 'y' }} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Age Distribution</h3>
                    <Bar data={ageDistData} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">BMI Distribution</h3>
                    <Bar data={bmiDistData} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;