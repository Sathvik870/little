import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ModelPerformance from './components/ModelPerformance';
import Dashboard from './components/Dashboard';
import Prediction from './components/Prediction';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/model-performance" element={<ModelPerformance />}/>
            <Route path="/prediction" element={<Prediction />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;