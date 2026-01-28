import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = "http://localhost:8000";

const StatCard = ({ title, value, unit = '' }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center items-center text-center">
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className="text-4xl font-bold text-gray-800 mt-2">
            {value.toLocaleString()}<span className="text-2xl font-semibold text-gray-500">{unit}</span>
        </p>
    </div>
);

const getColorForValue = (value) => {
    if (value === 1) return 'bg-gray-700 text-white';
    const absoluteValue = Math.abs(value);
    const alpha = Math.min(absoluteValue * 1.5, 1);
    if (value > 0) {
        return `rgba(59, 130, 246, ${alpha})`;
    } else {
        return `rgba(239, 68, 68, ${alpha})`;
    }
};

function Dashboard() {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/dashboard/analytics`)
            .then(response => setAnalytics(response.data))
            .catch(error => console.error("Error fetching dashboard data:", error));
    }, []);

    if (!analytics) {
        return <div className="text-center text-gray-500 mt-10">Loading Dashboard Analytics...</div>;
    }

    const pieChartData = {
        labels: analytics.diabetes_distribution?.labels,
        datasets: [{
            data: analytics.diabetes_distribution?.values,
            backgroundColor: ['#3B82F6', '#FBBF24', '#EF4444'],
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }],
    };

    const genderBarData = {
        labels: analytics.gender_bar_chart_data?.labels,
        datasets: [{
            label: 'Count',
            data: analytics.gender_bar_chart_data?.values,
            backgroundColor: ['#EC4899', '#3B82F6'],
            borderRadius: 8,
            barPercentage: 0.6,
        }],
    };

    const healthMetricsData = {
        labels: analytics.health_metrics_avg?.labels,
        datasets: [{
            label: 'Average Value',
            data: analytics.health_metrics_avg?.values,
            backgroundColor: ['#10B981', '#F59E0B', '#6366F1'],
            borderRadius: 8,
        }],
    };

    const diabetesByAgeData = {
        labels: analytics.diabetes_by_age?.labels,
        datasets: [
            { label: 'No Diabetes', data: analytics.diabetes_by_age?.no_diabetes_perc, backgroundColor: '#3B82F6' },
            { label: 'Pre-diabetes', data: analytics.diabetes_by_age?.prediabetes_perc, backgroundColor: '#FBBF24' },
            { label: 'Diabetes', data: analytics.diabetes_by_age?.diabetes_perc, backgroundColor: '#EF4444' },
        ],
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Male Smokers" value={analytics.kpi_stats?.male_smoker_percentage} unit="%" />
                <StatCard title="Male Heavy Drinkers" value={analytics.kpi_stats?.male_alcohol_percentage} unit="%" />
                <StatCard title="Physically Active" value={analytics.kpi_stats?.phys_activity_percentage} unit="%" />
                <StatCard title="Have High Cholesterol" value={analytics.kpi_stats?.high_chol_percentage} unit="%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Diabetes Status Distribution</h3>
                        <div className="w-full max-w-xs mx-auto">
                            <Pie data={pieChartData} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Average Health Metrics</h3>
                        <div className="h-80">
                            <Bar data={healthMetricsData} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-4 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 px-2">Feature Correlation Heatmap</h3>
                        <table className="w-full text-xs text-center">
                            <thead>
                                <tr>
                                    <th className="p-1"></th>
                                    {analytics.correlation_data?.labels.map(label => (
                                        <th key={label} className="p-1 transform -rotate-45 h-16 w-8 text-left text-gray-600">{label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.correlation_data?.data.map((row, i) => (
                                    <tr key={i}>
                                        <th className="p-1 text-left text-gray-600">{analytics.correlation_data.labels[i]}</th>
                                        {row.map((value, j) => (
                                            <td key={j} className="p-1">
                                                <div
                                                    className="w-full h-full rounded flex items-center justify-center font-semibold text-white"
                                                    style={{ backgroundColor: getColorForValue(value) }}
                                                    title={value.toFixed(3)}
                                                >
                                                    <span className="opacity-75">{value.toFixed(1)}</span>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Gender Distribution</h3>
                        <div className="h-80">
                            <Bar data={genderBarData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Diabetes Rate by Age Category (%)</h3>
                <div className="h-96">
                    <Bar data={diabetesByAgeData} options={{
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } },
                        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (value) => `${value}%` } } }
                    }} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;