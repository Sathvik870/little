import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8000";

const MetricCells = ({ data }) => {
    if (!data) return <td colSpan="4">Data not available</td>;
    return (
        <>
            <td className="px-6 py-4 font-mono">{data.precision.toFixed(3)}</td>
            <td className="px-6 py-4 font-mono">{data.recall.toFixed(3)}</td>
            <td className="px-6 py-4 font-mono">{data['f1-score'].toFixed(3)}</td>
            <td className="px-6 py-4 font-mono">{data.support.toLocaleString()}</td>
        </>
    );
};


function ModelPerformance() {
    const [reports, setReports] = useState(null);
    const [bestModel, setBestModel] = useState('');

    useEffect(() => {
        axios.get(`${API_URL}/models/performance`)
            .then(response => {
                const data = response.data;
                setReports(data);

                let maxAccuracy = 0;
                let bestModelName = '';
                Object.keys(data).forEach(modelName => {
                    if (data[modelName].accuracy > maxAccuracy) {
                        maxAccuracy = data[modelName].accuracy;
                        bestModelName = modelName;
                    }
                });
                setBestModel(bestModelName);
            })
            .catch(error => console.error("Error fetching model performance:", error));
    }, []);

    if (!reports) {
        return <div className="text-center text-gray-500">Loading model performance data...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Model Metrics & Performance</h1>
            <p className="text-gray-600 mb-8">
                A detailed comparison of the performance metrics for each classification model.
            </p>

            {/* Container to allow horizontal scrolling on smaller screens */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-100 border-b">
                        {/* First header row with main categories */}
                        <tr>
                            <th rowSpan="2" className="px-6 py-3 border-r">Model</th>
                            <th rowSpan="2" className="px-6 py-3 border-r">Accuracy</th>
                            <th colSpan="4" className="px-6 py-3 text-center border-r">Class 0 (No Diabetes)</th>
                            <th colSpan="4" className="px-6 py-3 text-center border-r">Class 1 (Diabetes)</th>
                            <th colSpan="4" className="px-6 py-3 text-center border-r">Macro Avg</th>
                            <th colSpan="4" className="px-6 py-3 text-center border-r">Weighted Avg</th>
                            <th rowSpan="2" className="px-6 py-3">Best</th>
                        </tr>
                        {/* Second header row with specific metrics */}
                        <tr>
                            {/* We repeat this block for each category */}
                            {['precision', 'recall', 'f1-score', 'support'].map(metric => (
                                <th key={`class0-${metric}`} className="px-6 py-3 border-r border-t">{metric}</th>
                            ))}
                             {['precision', 'recall', 'f1-score', 'support'].map(metric => (
                                <th key={`class1-${metric}`} className="px-6 py-3 border-r border-t">{metric}</th>
                            ))}
                             {['precision', 'recall', 'f1-score', 'support'].map(metric => (
                                <th key={`macro-${metric}`} className="px-6 py-3 border-r border-t">{metric}</th>
                            ))}
                             {['precision', 'recall', 'f1-score', 'support'].map(metric => (
                                <th key={`weighted-${metric}`} className="px-6 py-3 border-r border-t">{metric}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(reports).map(modelName => {
                            const report = reports[modelName];
                            return (
                                <tr 
                                    key={modelName} 
                                    className={`border-b hover:bg-gray-50 ${modelName === bestModel ? 'bg-green-50' : 'bg-white'}`}
                                >
                                    <td className="px-6 py-4 font-semibold text-gray-900 border-r">{modelName}</td>
                                    <td className="px-6 py-4 font-bold text-blue-600 border-r">
                                        {(report.accuracy * 100).toFixed(2)}%
                                    </td>
                                    <MetricCells data={report['0']} />
                                    <MetricCells data={report['1']} />
                                    <MetricCells data={report['macro avg']} />
                                    <MetricCells data={report['weighted avg']} />
                                    <td className="px-6 py-4 text-center text-xl">
                                        {modelName === bestModel ? '✅' : ''}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ModelPerformance;