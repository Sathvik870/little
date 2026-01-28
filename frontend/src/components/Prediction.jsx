import React, { useState } from 'react';
import axios from 'axios';
import { Lightbulb, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const API_URL = "http://localhost:8000";

const getResultStyle = (predictedClass) => {
    switch (predictedClass) {
        case 0: return {
            classes: 'bg-green-100 text-green-800 border-green-300',
            icon: <CheckCircle className="h-8 w-8 text-green-600" />
        };
        case 1: return {
            classes: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            icon: <AlertTriangle className="h-8 w-8 text-yellow-600" />
        };
        case 2: return {
            classes: 'bg-red-100 text-red-800 border-red-300',
            icon: <XCircle className="h-8 w-8 text-red-600" />
        };
        default: return {
            classes: 'bg-gray-100 text-gray-800 border-gray-300',
            icon: null
        };
    }
};

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
    
    const resultStyle = result ? getResultStyle(result.model_prediction.predicted_class) : {};

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Diabetes Risk Prediction</h1>
            <p className="text-gray-600 mb-8">Fill in the details to get an AI-powered risk assessment and personalized recommendations.</p>

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
                    <div className="mt-8 space-y-6">
                        <div className={`p-6 rounded-lg border-l-4 ${resultStyle.classes}`}>
                            <div className="flex items-center space-x-4">
                                {resultStyle.icon}
                                <div>
                                    <p className="font-bold text-lg">Model Prediction: {result.model_prediction.risk_level}</p>
                                    <p className="text-sm">Confidence: {result.model_prediction.confidence}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Lightbulb className="h-6 w-6 text-blue-500" />
                                <h3 className="font-bold text-lg text-gray-800">AI Health Insights</h3>
                            </div>
                            <div className="space-y-4 text-gray-700">
                                <p>
                                    <strong className="font-semibold">Assessment:</strong> {result.ai_recommendation.condition}
                                </p>
                                <p>
                                    <strong className="font-semibold">Explanation:</strong> {result.ai_recommendation.explanation}
                                </p>
                                <div>
                                    <strong className="font-semibold block mb-2">Recommendations:</strong>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        {result.ai_recommendation.recommendations.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Prediction;