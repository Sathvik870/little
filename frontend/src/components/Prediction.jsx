import React, { useState } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8000";

function Prediction() {
    const [formData, setFormData] = useState({
        BMI: 25.0, Age: 5, HighBP: 0, HighChol: 0, Smoker: 0, PhysActivity: 1
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        axios.post(`${API_URL}/predict`, formData)
            .then(response => setResult(response.data))
            .catch(error => console.error("Error making prediction:", error))
            .finally(() => setLoading(false));
    };
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Diabetes Risk Prediction</h1>
            <p className="text-gray-600 mb-8">Fill in the details below to predict the risk of diabetes.</p>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="BMI" className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                                <input type="number" name="BMI" id="BMI" value={formData.BMI} onChange={handleChange} step="0.1" required 
                                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label htmlFor="Age" className="block text-sm font-medium text-gray-700 mb-1">Age Category (1-13)</label>
                                <input type="number" name="Age" id="Age" value={formData.Age} onChange={handleChange} min="1" max="13" required 
                                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label htmlFor="HighBP" className="block text-sm font-medium text-gray-700 mb-1">High Blood Pressure</label>
                                <select name="HighBP" id="HighBP" value={formData.HighBP} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="HighChol" className="block text-sm font-medium text-gray-700 mb-1">High Cholesterol</label>
                                <select name="HighChol" id="HighChol" value={formData.HighChol} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="Smoker" className="block text-sm font-medium text-gray-700 mb-1">Smoker</label>
                                <select name="Smoker" id="Smoker" value={formData.Smoker} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="PhysActivity" className="block text-sm font-medium text-gray-700 mb-1">Physical Activity</label>
                                <select name="PhysActivity" id="PhysActivity" value={formData.PhysActivity} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button type="submit" disabled={loading}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300">
                                {loading ? 'Predicting...' : 'Predict Risk'}
                            </button>
                        </div>
                    </form>
                </div>
                {result && (
                    <div className={`mt-6 p-4 rounded-lg text-center ${result.prediction === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <h3 className="font-bold text-lg">{result.prediction_label}</h3>
                        <p>Model Confidence: {result.confidence_score}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Prediction;