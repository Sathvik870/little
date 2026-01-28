import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ModelPerformance from './components/ModelPerformance';
import Dashboard from './components/Dashboard';
import Prediction from './components/Prediction';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<ModelPerformance />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/prediction" element={<Prediction />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;