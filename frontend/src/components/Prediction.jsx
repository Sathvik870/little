import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL;

function Prediction() {
    const [formData, setFormData] = useState({
        BMI: 25.0,
        Age: 5,
        HighBP: 0,
        HighChol: 0,
        Smoker: 0,
        PhysActivity: 1
    });
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/predict`, formData)
            .then(response => setResult(response.data))
            .catch(error => console.error("Error making prediction:", error));
    };

    return (
        <div>
            <h1>Diabetes Risk Prediction</h1>
            <p>Fill in the details below to predict the risk of diabetes using the Logistic Regression model.</p>
            <div className="card">
                <form onSubmit={handleSubmit} className="prediction-form">
                    <div className="form-group">
                        <label>BMI</label>
                        <input type="number" name="BMI" value={formData.BMI} onChange={handleChange} step="0.1" required />
                    </div>
                    <div className="form-group">
                        <label>Age Category (1-13)</label>
                        <input type="number" name="Age" value={formData.Age} onChange={handleChange} min="1" max="13" required />
                    </div>
                    <div className="form-group">
                        <label>High Blood Pressure</label>
                        <select name="HighBP" value={formData.HighBP} onChange={handleChange}>
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>High Cholesterol</label>
                        <select name="HighChol" value={formData.HighChol} onChange={handleChange}>
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Smoker</label>
                        <select name="Smoker" value={formData.Smoker} onChange={handleChange}>
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Physical Activity in past 30 days</label>
                        <select name="PhysActivity" value={formData.PhysActivity} onChange={handleChange}>
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <button type="submit" className="predict-btn">Predict</button>
                </form>
            </div>
            {result && (
                <div className={`prediction-result ${result.prediction === 0 ? 'result-success' : 'result-error'}`}>
                    <h3>Prediction Result</h3>
                    <p><strong>Status:</strong> {result.prediction_label}</p>
                    <p><strong>Confidence:</strong> {result.confidence_score}</p>
                </div>
            )}
        </div>
    );
}

export default Prediction;