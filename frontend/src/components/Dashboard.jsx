import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const API_URL = import.meta.env.REACT_APP_API_URL;

function Dashboard() {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/dashboard/analytics`)
            .then(response => setAnalytics(response.data))
            .catch(error => console.error("Error fetching dashboard data:", error));
    }, []);

    if (!analytics) return <div>Loading dashboard analytics...</div>;

    const diabetesDistData = {
        labels: analytics.diabetes_distribution.labels,
        datasets: [{
            data: analytics.diabetes_distribution.values,
            backgroundColor: ['#36A2EB', '#FF6384'],
        }],
    };
    
    const ageDistData = {
        labels: analytics.age_distribution.labels,
        datasets: [{
            label: 'Number of People',
            data: analytics.age_distribution.values,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    };
    
    const bmiDistData = {
        labels: analytics.bmi_distribution.labels,
        datasets: [{
            label: 'Number of People',
            data: analytics.bmi_distribution.counts,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
        }],
    };

    const healthVsDiabetesData = {
        labels: analytics.health_vs_diabetes.labels,
        datasets: [{
            label: '% with Diabetes',
            data: analytics.health_vs_diabetes.diabetes_percentage,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
        }]
    };

    return (
        <div>
            <h1>Dataset Analytics Dashboard</h1>
            <div className="dashboard-grid">
                <div className="card">
                    <h3>Diabetes Distribution</h3>
                    <Pie data={diabetesDistData} />
                </div>
                <div className="card">
                    <h3>Diabetes Rate by General Health</h3>
                    <Bar data={healthVsDiabetesData} options={{ indexAxis: 'y' }} />
                </div>
                <div className="card">
                    <h3>Age Distribution</h3>
                    <Bar data={ageDistData} />
                </div>
                <div className="card">
                    <h3>BMI Distribution</h3>
                    <Bar data={bmiDistData} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;