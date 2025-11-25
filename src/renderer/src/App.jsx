import { useState, useEffect } from 'react';
import './assets/main.css';

function App() {
  const [stats, setStats] = useState({
    cpuUsage: 0,
    memUsed: '0',
    memTotal: '0',
    temp: 0,
    battery: 'Loading...',
    netSpeed: '0'
  });

  // --- "SIMPLE AI" DIAGNOSTIC LOGIC ---
  const analyzeHealth = (data) => {
    if (data.temp > 80) return "Warning: High system temperature detected. Check ventilation.";
    if (data.cpuUsage > 85) return "Heavy Processing: Your CPU is under high load.";
    if (parseFloat(data.memUsed) > parseFloat(data.memTotal) * 0.9) return "Low Memory: Close unused apps to free up RAM.";
    if (data.battery !== 'Plugged In' && parseInt(data.battery) < 20) return "Battery Low: Connect to power source soon.";
    return "System is running smoothly. No issues detected.";
  };

  // Store the AI message in a variable
  const aiMessage = analyzeHealth(stats);

  useEffect(() => {
    const fetchData = async () => {
      if (window.api) {
        const data = await window.api.getSystemStats();
        if (data) setStats(data);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Clarity</h1>
        <p>System Status: <span style={{ color: '#2ecc71' }}>Online</span></p>
      </header>

      <main className="dashboard-grid">
        {/* Primary Cards */}
        <div className="card primary-card">
          <h3>CPU Usage</h3>
          <div className="metric">{stats.cpuUsage}%</div>
        </div>
        <div className="card primary-card">
          <h3>Memory</h3>
          <div className="metric">{stats.memUsed} <span style={{fontSize:'1rem', color:'#999'}}>/ {stats.memTotal} GB</span></div>
        </div>
        <div className="card primary-card">
          <h3>Temp</h3>
          <div className="metric">{stats.temp}°C</div>
        </div>
        
        {/* Secondary Cards (Now Real!) */}
        <div className="card secondary-card">
          <h3>Energy / Battery</h3>
          <p className="metric" style={{fontSize: '1.2rem'}}>{stats.battery}</p>
        </div>
        <div className="card secondary-card">
          <h3>Network (Down)</h3>
          <p className="metric" style={{fontSize: '1.2rem'}}>↓ {stats.netSpeed} Mbps</p>
        </div>
        <div className="card secondary-card">
           <h3>AI Diagnostics</h3>
           <p className="ai-message">{aiMessage}</p>
        </div>
      </main>
    </div>
  );
}

export default App;