import { useState, useEffect } from 'react';
import './main.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
// --- REUSABLE METRIC BAR COMPONENT ---
const MetricBar = ({ percent, label, value, isModal = false, colorFn }) => {
    const defaultColorFn = (p) => {
        if (p <= 60) return '#2ecc71'; // Green
        if (p <= 80) return '#f1c40f'; // Yellow
        return '#e74c3c'; // Red
    };

    const getColor = colorFn || defaultColorFn;
    const safePercent = isNaN(percent) ? 0 : Math.min(Math.max(percent, 0), 100);

    return (
        <div style={{ marginTop: '12px', width: '100%' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '4px',
                fontSize: isModal ? '0.95rem' : '0.8rem',
                color: '#666'
            }}>
                <span>{label}</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{value}</span>
            </div>
            <div className="metric-bar-container" style={{ marginTop: '0' }}>
                <div 
                    className="metric-bar-fill" 
                    style={{ 
                        width: `${safePercent > 0 ? safePercent : 1}%`, 
                        backgroundColor: getColor(safePercent) 
                    }}
                ></div>
            </div>
        </div>
    );
};

function App() {
  const [stats, setStats] = useState({
    cpuUsage: 0, memUsed: '0', memTotal: '0', temp: 0, battery: 'Loading...',
    netDown: '0', netUp: '0', netRxTotal: '0', netTxTotal: '0', latency: 0,
    linkSpeed: '0', interfaceName: '...',
    memDetails: [], chipset: 'Loading...', cores: 0, threads: 0,
    totalProcesses: 0, topProcesses: [],
    hostname: 'Checking Device...', isLaptop: false,
    gpuControllers: [], gpuDisplays: []
  });
  
  const [selectedCard, setSelectedCard] = useState(null);

  // --- HELPER LOGIC ---
  const memUsedVal = parseFloat(stats.memUsed) || 0;
  const memTotalVal = parseFloat(stats.memTotal) || 1; 
  const memPercent = Math.round((memUsedVal / memTotalVal) * 100);
  
  const getCpuStatus = (percent) => {
    if (percent > 80) return { text: 'HIGH', color: '#e74c3c' };
    if (percent > 20) return { text: 'MODERATE', color: '#f1c40f' };
    return { text: 'LOW', color: '#2ecc71' };
  };
  const getTempStatus = (temp) => {
    if (temp <= 0) return { text: 'N/A', color: '#999' };
    if (temp > 80) return { text: 'HIGH', color: '#e74c3c' };
    if (temp > 60) return { text: 'MODERATE', color: '#f1c40f' };
    return { text: 'NORMAL', color: '#2ecc71' };
  };
  const getNetColor = (mbps) => {
      const speed = parseFloat(mbps);
      if (speed > 50) return '#2ecc71';
      if (speed > 10) return '#f1c40f';
      return '#e74c3c';
  };
  const getLatencyColor = (ms) => {
      if (ms < 50) return '#2ecc71';
      if (ms < 100) return '#f1c40f';
      return '#e74c3c';
  };

  const cpuStatus = getCpuStatus(stats.cpuUsage);
  const tempStatus = getTempStatus(stats.temp);

  const analyzeHealth = (data) => {
    if (data.temp > 80) return "Warning: High system temperature detected. Check ventilation.";
    if (data.cpuUsage > 85) return "Heavy Processing: Your CPU is under high load.";
    if (memUsedVal > memTotalVal * 0.9) return "Low Memory: Close unused apps to free up RAM.";
    if (data.battery !== 'Plugged In' && parseInt(data.battery) < 20) return "Battery Low: Connect to power source soon.";
    return "System is running smoothly. No issues detected.";
  };
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

  const primaryGpu = stats.gpuControllers.length > 0 ? stats.gpuControllers[0] : { model: "Loading...", utilization: 0, temperature: 0 };

  const detailContent = {
    cpu: { title: "Processor (CPU)", value: `${stats.cpuUsage}%`, desc: "The Central Processing Unit is the brain of your computer." },
    mem: { title: "Memory (RAM)", value: `${stats.memUsed} / ${stats.memTotal} GB`, desc: "Random Access Memory holds the data for currently running apps." },
    temp: { title: "Core Temperature", value: stats.temp > 0 ? `${stats.temp}°C` : 'N/A', desc: "The internal temperature of your CPU." },
    net: { title: "Network Connection", value: `${stats.linkSpeed} Mbps`, desc: "Real-time network traffic statistics." },
    battery: { title: "Power Status", value: stats.battery, desc: "Current battery level or power source status." },
    gpu: { title: "Graphics (GPU)", value: primaryGpu.model, desc: "Handles rendering of images, video, and 3D applications." }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Clarity</h1>
        <div className="device-identity">
            <i className={`fa ${stats.isLaptop ? 'fa-laptop' : 'fa-desktop'}`} aria-hidden="true"></i>
            <span>{stats.hostname}</span>
        </div>
        <p style={{ display: 'flex', alignItems: 'center', marginTop: '10px', color: '#777' }}>
            System Status: 
            <span className="status-badge">Online</span>
        </p>
      </header>

      <main className="dashboard-grid">
        {/* --- CPU --- */}
        <div className="card primary-card" onClick={() => setSelectedCard('cpu')}>
          <i className="fa fa-microchip card-icon" style={{ color: '#e67e22' }}></i>
          <h3>CPU Usage</h3>
          <div className="metric">{stats.cpuUsage}%</div>
          <p className="status-indicator" style={{ color: cpuStatus.color }}>{cpuStatus.text}</p>
        </div>
        
        {/* --- MEMORY --- */}
        <div className="card primary-card" onClick={() => setSelectedCard('mem')}>
          <i className="fa fa-server card-icon" style={{ color: '#e91e63' }}></i>
          <h3>Memory</h3>
          <div className="metric">{stats.memUsed} <span style={{fontSize:'1rem', color:'#999'}}>/ {stats.memTotal} GB</span></div>
          <MetricBar percent={memPercent} label="Usage" value={`${memPercent}%`} />
        </div>
        
        {/* --- TEMP --- */}
        <div className="card primary-card" onClick={() => setSelectedCard('temp')}>
          <i className="fa fa-thermometer-half card-icon" style={{ color: '#e74c3c' }}></i>
          <h3>Temp</h3>
          <div className="metric">{stats.temp > 0 ? `${stats.temp}°C` : <span style={{fontSize: '1rem', color: '#999'}}>N/A</span>}</div>
          <p className="status-indicator" style={{ color: tempStatus.color }}>{tempStatus.text}</p>
        </div>

        {/* --- GPU --- */}
        <div className="card secondary-card" onClick={() => setSelectedCard('gpu')}>
          <i className="fa fa-video-camera card-icon" style={{ color: '#3498db' }}></i>
          <h3>Graphics / GPU</h3>
          <p className="metric" style={{fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', marginBottom: '5px'}}>
            {primaryGpu.model}
          </p>
          <MetricBar percent={primaryGpu.utilization || 0} label="Utilization" value={primaryGpu.utilization ? `${primaryGpu.utilization}%` : 'N/A'} />
          <MetricBar percent={primaryGpu.temperature || 0} label="Temperature" value={primaryGpu.temperature ? `${primaryGpu.temperature}°C` : 'N/A'} />
        </div>

        {/* --- BATTERY --- */}
        <div className="card secondary-card" onClick={() => setSelectedCard('battery')}>
          <i className="fa fa-bolt card-icon" style={{ color: '#2ecc71' }}></i>
          <h3>Energy / Battery</h3>
          <p className="metric" style={{fontSize: '1.2rem'}}>{stats.battery}</p>
        </div>

        {/* --- NETWORK --- */}
        <div className="card secondary-card" onClick={() => setSelectedCard('net')}>
          <i className="fa fa-wifi card-icon" style={{ color: '#9b59b6' }}></i>
          <h3>Network</h3>
          <div className="metric" style={{marginBottom: '5px'}}>
            {stats.linkSpeed} <span style={{fontSize: '1rem', color: '#999'}}>Mbps</span>
          </div>
          <div style={{display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#777'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <i className="fa fa-arrow-down" style={{color: getNetColor(stats.netDown)}}></i>
                <span>{stats.netDown}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <i className="fa fa-arrow-up" style={{color: getNetColor(stats.netUp)}}></i>
                <span>{stats.netUp}</span>
            </div>
          </div>
        </div>
        
        {/* --- AI DIAGNOSTICS (Updated Class) --- */}
        <div className="card ai-card" style={{cursor: 'default'}}>
           <h3>
             <i className="fa-solid fa-robot card-icon" style={{ color: '#34495e' }}></i>
             AI Diagnostics
           </h3>
           <p className="ai-message">{aiMessage}</p>
        </div>
      </main>

      {/* --- MODAL OVERLAY --- */}
      {selectedCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCard(null)}>×</button>
            <h2>{detailContent[selectedCard].title}</h2>
            
            {/* CPU MODAL */}
            {selectedCard === 'cpu' ? (
                <div style={{marginBottom: '20px'}}>
                    <div className="metric" style={{fontSize: '3rem', margin: '10px 0'}}>{detailContent.cpu.value}</div>
                    <p className="status-indicator" style={{ color: cpuStatus.color, fontSize: '1.5rem', marginTop: '0', marginBottom: '20px' }}>{cpuStatus.text}</p>
                    <h3 style={{marginTop: '30px', marginBottom: '10px', fontSize: '1.2rem'}}>Technical Details</h3>
                    <div className="detail-list">
                        <div className="detail-row"><p>Chipset:</p><p>{stats.chipset}</p></div>
                        <div className="detail-row"><p>Cores / Threads:</p><p>{stats.cores} / {stats.threads}</p></div>
                        <div className="detail-row"><p>Processes Running:</p><p>{stats.totalProcesses}</p></div>
                    </div>
                    <h3 style={{marginTop: '30px', marginBottom: '10px', fontSize: '1.2rem'}}>Top 5 Usage</h3>
                    <div className="process-list">
                      {stats.topProcesses.map((p, index) => (
                          <div key={index} className="detail-row">
                              <p>{p.name}</p><p>{p.cpu}%</p>
                          </div>
                      ))}
                    </div>
                </div>

            /* MEMORY MODAL */
            ) : selectedCard === 'mem' ? (
                <div style={{marginBottom: '20px'}}>
                    <div className="metric" style={{fontSize: '3rem', margin: '10px 0'}}>{detailContent.mem.value}</div>
                    <MetricBar percent={memPercent} label="Total Usage" value={`${memPercent}%`} isModal={true} />
                    <h3 style={{marginTop: '30px', marginBottom: '10px', fontSize: '1.2rem'}}>Module Details</h3>
                    {stats.memDetails.length > 0 ? (
                        stats.memDetails.map((detail, index) => (
                            <div key={index} className="detail-list">
                                <div className="detail-row"><p>Slot {index + 1} ({detail.manufacturer}):</p><p>{detail.size} {detail.type} @ {detail.speed} MHz</p></div>
                            </div>
                        ))
                    ) : <p className="detail-row">Memory details unavailable.</p>}
                </div>

            /* GPU MODAL */
            ) : selectedCard === 'gpu' ? (
                <div style={{marginBottom: '20px'}}>
                    {stats.gpuControllers.map((gpu, index) => (
                        <div key={index} style={{marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee'}}>
                            <h3 style={{marginTop: '10px', marginBottom: '10px', fontSize: '1.2rem', color: '#007bff'}}>
                                {gpu.model}
                            </h3>
                            <div style={{marginBottom: '20px'}}>
                                <MetricBar percent={gpu.utilization || 0} label="Core Utilization" value={gpu.utilization ? `${gpu.utilization}%` : 'N/A'} isModal={true} />
                                <MetricBar percent={gpu.temperature || 0} label="Temperature" value={gpu.temperature ? `${gpu.temperature}°C` : 'N/A'} isModal={true} />
                            </div>
                            <div className="detail-list">
                                <div className="detail-row"><p>Vendor:</p><p>{gpu.vendor}</p></div>
                                <div className="detail-row"><p>VRAM:</p><p>{gpu.vram}</p></div>
                                {gpu.clockCore > 0 && <div className="detail-row"><p>Core Clock:</p><p>{gpu.clockCore} MHz</p></div>}
                            </div>
                        </div>
                    ))}
                    <div className="disclaimer">
                        <strong>Note:</strong> Some manufacturers (e.g., Apple Silicon) hide specific internal metrics like VRAM, Clock Speeds, and Real-time Temperatures from standard monitoring tools to optimize battery life and security.
                    </div>
                </div>

            /* NETWORK MODAL */
            ) : selectedCard === 'net' ? (
                <div style={{marginBottom: '20px'}}>
                    <div className="metric" style={{fontSize: '3rem', margin: '10px 0'}}>{stats.linkSpeed} <span style={{fontSize: '1.5rem', color:'#999'}}>Mbps</span></div>
                    <p className="status-indicator" style={{ color: '#2ecc71', marginBottom: '20px' }}>LINK CAPACITY</p>
                    <h3 style={{marginTop: '30px', marginBottom: '10px', fontSize: '1.2rem'}}>Session Statistics</h3>
                    <div className="detail-list">
                        <div className="detail-row"><p>Active Interface:</p><p>{stats.interfaceName || 'Unknown'}</p></div>
                        <div className="detail-row">
                            <p>Download Speed:</p>
                            <p style={{color: getNetColor(stats.netDown), fontWeight:'bold'}}>{stats.netDown} Mbps</p>
                        </div>
                        <div className="detail-row">
                            <p>Upload Speed:</p>
                            <p style={{color: getNetColor(stats.netUp), fontWeight:'bold'}}>{stats.netUp} Mbps</p>
                        </div>
                        <div className="detail-row"><p>Total Data Received:</p><p>{stats.netRxTotal} GB</p></div>
                        <div className="detail-row"><p>Total Data Sent:</p><p>{stats.netTxTotal} GB</p></div>
                        <div className="detail-row">
                            <p>Network Stability (Ping):</p>
                            <p style={{color: getLatencyColor(stats.latency)}}>{stats.latency ? `${stats.latency} ms` : 'Calculating...'}</p>
                        </div>
                    </div>
                </div>

            /* DEFAULT MODAL */
            ) : (
                <div className="metric" style={{fontSize: '3rem', margin: '20px 0'}}>{detailContent[selectedCard].value}</div>
            )}
            
            <p style={{lineHeight: '1.6', color: '#555', marginTop: '20px'}}>{detailContent[selectedCard].desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;