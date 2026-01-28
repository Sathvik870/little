import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL;

function ModelPerformance() {
    const [reports, setReports] = useState(null);
    const [bestModel, setBestModel] = useState('');

    useEffect(() => {
        axios.get(`${API_URL}/models/performance`)
            .then(response => {
                const data = response.data;
                setReports(data);

                // Find the model with the highest accuracy
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
        return <div>Loading model performance data...</div>;
    }

    return (
        <div>
            <h1>Model Metrics & Performance</h1>
            <p>This page shows the classification reports for three different models trained on the dataset. The model with the highest accuracy is highlighted.</p>
            {Object.keys(reports).map(modelName => (
                <div key={modelName} className={`card ${modelName === bestModel ? 'highlight' : ''}`}>
                    <h3>{modelName} {modelName === bestModel && ' (Best Accuracy)'}</h3>
                    <p><strong>Overall Accuracy:</strong> {reports[modelName].accuracy.toFixed(4)}</p>
                    <h4>Classification Report:</h4>
                    <pre>{JSON.stringify(reports[modelName], null, 2)}</pre>
                </div>
            ))}
        </div>
    );
}

export default ModelPerformance;