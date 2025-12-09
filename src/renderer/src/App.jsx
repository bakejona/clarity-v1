import { useState, useEffect } from "react";
import "./main.css";

// --- ASSET IMPORTS ---
import iconCpu from "./assets/icons/cpu.png";
import iconMem from "./assets/icons/mem.png";
import iconTemp from "./assets/icons/temp.png";
import iconGpu from "./assets/icons/gpu.png";
import iconBattery from "./assets/icons/battery.png";
import iconNet from "./assets/icons/net.png";
import iconAi from "./assets/icons/ai.png";
import iconLaptop from "./assets/icons/laptop.png";
import iconDesktop from "./assets/icons/desktop.png";
import iconTheme from "./assets/icons/theme.png";
import iconDown from "./assets/icons/down.png";
import iconUp from "./assets/icons/up.png";

// --- ICON MAP ---
const ICONS = {
  cpu: iconCpu,
  mem: iconMem,
  temp: iconTemp,
  gpu: iconGpu,
  battery: iconBattery,
  net: iconNet,
  ai: iconAi,
  laptop: iconLaptop,
  desktop: iconDesktop,
  theme: iconTheme,
  down: iconDown,
  up: iconUp,
};

// --- STATIC GRADIENT THEMES ---
const GRADIENT_OPTIONS = [
  {
    name: "Orange Glow",
    gradient:
      "radial-gradient(circle at 10% 90%, rgba(243, 156, 18, 0.9) 0%, rgba(0, 0, 0, 1) 90%)",
    primaryColor: "#f39c12",
  },
  {
    name: "Red Flare",
    gradient:
      "radial-gradient(circle at 10% 90%, rgba(231, 76, 60, 0.9) 0%, rgba(0, 0, 0, 1) 90%)",
    primaryColor: "#e74c3c",
  },
  {
    name: "Teal Beam",
    gradient:
      "radial-gradient(circle at 10% 90%, rgba(52, 231, 196, 0.9) 0%, rgba(0, 0, 0, 1) 90%)",
    primaryColor: "#34e7c4",
  },
  {
    name: "Blue Deep",
    gradient:
      "radial-gradient(circle at 10% 90%, rgba(52, 152, 219, 0.9) 0%, rgba(0, 0, 0, 1) 90%)",
    primaryColor: "#3498db",
  },
  {
    name: "Purple Pulse",
    gradient:
      "radial-gradient(circle at 10% 90%, rgba(155, 89, 182, 0.9) 0%, rgba(0, 0, 0, 1) 90%)",
    primaryColor: "#9b59b6",
  },
  { name: "Default (Black)", gradient: "none", primaryColor: "#f5f7fa" },
];

const saveBackgroundPref = (name) =>
  localStorage.setItem("clarity_background", name);
const loadBackgroundPref = () =>
  localStorage.getItem("clarity_background") || "Orange Glow";

const MetricBar = ({
  percent,
  label,
  value,
  isModal = false,
  colorFn,
  activePrimaryColor,
}) => {
  const defaultColorFn = (p) => {
    if (p <= 60) return activePrimaryColor;
    if (p <= 80) return "#f1c40f";
    return "#e74c3c";
  };
  const getColor = colorFn || defaultColorFn;
  const safePercent = isNaN(percent) ? 0 : Math.min(Math.max(percent, 0), 100);

  return (
    <div style={{ marginTop: "12px", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
          fontSize: isModal ? "0.95rem" : "0.8rem",
          color: "#ccc",
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: "bold", color: "#fff" }}>{value}</span>
      </div>
      <div className="metric-bar-container" style={{ marginTop: "0" }}>
        <div
          className="metric-bar-fill"
          style={{
            width: `${safePercent > 0 ? safePercent : 1}%`,
            backgroundColor: getColor(safePercent),
          }}
        ></div>
      </div>
    </div>
  );
};

function App() {
  const [currentBackground, setCurrentBackground] =
    useState(loadBackgroundPref());
  const activeBg =
    GRADIENT_OPTIONS.find((opt) => opt.name === currentBackground) ||
    GRADIENT_OPTIONS[0];
  const activePrimaryColor = activeBg.primaryColor;

  const [stats, setStats] = useState({
    cpuUsage: 0,
    memUsed: "0",
    memTotal: "0",
    temp: 0,
    battery: "Loading...",
    netDown: "0",
    netUp: "0",
    netRxTotal: "0",
    netTxTotal: "0",
    latency: 0,
    linkSpeed: "0",
    interfaceName: "...",
    memDetails: [],
    chipset: "Loading...",
    cores: 0,
    threads: 0,
    totalProcesses: 0,
    topProcesses: [],
    hostname: "Checking...",
    isLaptop: false,
    gpuControllers: [],
    gpuDisplays: [],
  });

  const [selectedCard, setSelectedCard] = useState(null);

  const memUsedVal = parseFloat(stats.memUsed) || 0;
  const memTotalVal = parseFloat(stats.memTotal) || 1;
  const memPercent = Math.round((memUsedVal / memTotalVal) * 100);

  const getCpuStatus = (p) => {
    if (p > 80) return { text: "HIGH", color: "#e74c3c" };
    if (p > 20) return { text: "MODERATE", color: "#f1c40f" };
    return { text: "LOW", color: activePrimaryColor };
  };
  const getTempStatus = (t) => {
    if (t <= 0) return { text: "N/A", color: "#999" };
    if (t > 80) return { text: "HIGH", color: "#e74c3c" };
    if (t > 60) return { text: "MODERATE", color: "#f1c40f" };
    return { text: "NORMAL", color: activePrimaryColor };
  };
  const getNetColor = (s) =>
    parseFloat(s) > 50
      ? activePrimaryColor
      : parseFloat(s) > 10
        ? "#f1c40f"
        : "#e74c3c";
  const getLatencyColor = (l) =>
    l < 50 ? activePrimaryColor : l < 100 ? "#f1c40f" : "#e74c3c";

  const cpuStatus = getCpuStatus(stats.cpuUsage);
  const tempStatus = getTempStatus(stats.temp);

  const analyzeHealth = (data) => {
    if (data.temp > 80) return "Warning: High system temperature.";
    if (data.cpuUsage > 85) return "Heavy Processing: CPU under load.";
    if (memUsedVal > memTotalVal * 0.9) return "Low Memory: Free up RAM.";
    if (data.battery !== "Plugged In" && parseInt(data.battery) < 20)
      return "Battery Low.";
    return "System is running smoothly.";
  };
  const aiMessage = analyzeHealth(stats);

  useEffect(() => {
    const bgOption =
      GRADIENT_OPTIONS.find((opt) => opt.name === currentBackground) ||
      GRADIENT_OPTIONS[0];
    if (bgOption.gradient !== "none") {
      document.body.style.backgroundImage = bgOption.gradient;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = "#000000";
    }
    saveBackgroundPref(currentBackground);
  }, [currentBackground]);

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

  const primaryGpu =
    stats.gpuControllers.length > 0
      ? stats.gpuControllers[0]
      : { model: "Loading...", utilization: 0, temperature: 0 };

  const detailContent = {
    cpu: {
      title: "Processor (CPU)",
      value: `${stats.cpuUsage}%`,
      desc: "The Central Processing Unit is the brain of your computer.",
    },
    mem: {
      title: "Memory (RAM)",
      value: `${stats.memUsed} / ${stats.memTotal} GB`,
      desc: "Random Access Memory holds the data for currently running apps.",
    },
    temp: {
      title: "Core Temp",
      value: stats.temp > 0 ? `${stats.temp}°C` : "N/A",
      desc: "The internal temperature of your CPU.",
    },
    net: {
      title: "Network Connection",
      value: `${stats.linkSpeed} Mbps`,
      desc: "Real-time network traffic statistics.",
    },
    battery: {
      title: "Power Status",
      value: stats.battery,
      desc: "Current battery level or power source status.",
    },
    gpu: {
      title: "Graphics (GPU)",
      value: primaryGpu.model,
      desc: "Handles rendering of images, video, and 3D applications.",
    },
  };

  return (
    <div className="dashboard-container">
      {/* --- SAFE ANIMATED BACKGROUND --- */}
      <div className="gradient-bg">
        <div
          className="gradient-blob blob-1"
          style={{
            background:
              activeBg.primaryColor === "#f5f7fa"
                ? "#333"
                : activeBg.primaryColor,
          }}
        ></div>
        <div
          className="gradient-blob blob-2"
          style={{
            background:
              activeBg.primaryColor === "#f5f7fa"
                ? "#222"
                : activeBg.primaryColor,
          }}
        ></div>
        <div
          className="gradient-blob blob-3"
          style={{
            background:
              activeBg.primaryColor === "#f5f7fa"
                ? "#444"
                : activeBg.primaryColor,
          }}
        ></div>
      </div>

      <header className="dashboard-header">
        <div className="header-logo">
          <h1>CLARITY</h1>
        </div>

        <div className="header-controls">
          {/* Part A: The Line */}
          <div className="status-bar-card">
            <div
              className="device-identity"
              style={{
                color: activePrimaryColor,
                transition: "color 0.5s ease",
              }}
            >
              <img
                src={stats.isLaptop ? ICONS.laptop : ICONS.desktop}
                alt="Device"
              />
              <span>{stats.hostname}</span>
            </div>
            <div className="connection-status">
              <p>System Status:</p>
              <span
                className="status-badge"
                style={{
                  backgroundColor: activePrimaryColor,
                  transition: "background-color 0.5s ease",
                }}
              >
                Online
              </span>
            </div>
          </div>

          {/* Part B: The Dot */}
          <div
            className="theme-toggle-btn"
            onClick={() =>
              document.getElementById("bg-selector").classList.toggle("hidden")
            }
          >
            <img src={ICONS.theme} alt="Theme" />

            <div
              id="bg-selector"
              className="background-selector hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {GRADIENT_OPTIONS.map((option) => (
                <div
                  key={option.name}
                  className="selector-item"
                  onClick={() => setCurrentBackground(option.name)}
                >
                  <div
                    className={`color-circle ${currentBackground === option.name ? "active" : ""}`}
                    style={{ background: option.primaryColor }}
                    title={option.name}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        <div
          className="card primary-card"
          onClick={() => setSelectedCard("cpu")}
        >
          <img src={ICONS.cpu} className="card-icon" alt="CPU" />
          <h3>CPU Usage</h3>
          <div className="metric">{stats.cpuUsage}%</div>
          <p className="status-indicator" style={{ color: cpuStatus.color }}>
            {cpuStatus.text}
          </p>
        </div>

        <div
          className="card primary-card"
          onClick={() => setSelectedCard("mem")}
        >
          <img src={ICONS.mem} className="card-icon" alt="Memory" />
          <h3>Memory</h3>
          <div className="metric">
            {stats.memUsed}{" "}
            <span style={{ fontSize: "1rem", color: "#999" }}>
              / {stats.memTotal} GB
            </span>
          </div>
          <MetricBar
            percent={memPercent}
            label="Usage"
            value={`${memPercent}%`}
            activePrimaryColor={activePrimaryColor}
          />
        </div>

        <div
          className="card primary-card"
          onClick={() => setSelectedCard("temp")}
        >
          <img src={ICONS.temp} className="card-icon" alt="Temp" />
          <h3>Temp</h3>
          <div className="metric">
            {stats.temp > 0 ? (
              `${stats.temp}°C`
            ) : (
              <span style={{ fontSize: "1rem", color: "#999" }}>N/A</span>
            )}
          </div>
          <p className="status-indicator" style={{ color: tempStatus.color }}>
            {tempStatus.text}
          </p>
        </div>

        <div
          className="card secondary-card"
          onClick={() => setSelectedCard("gpu")}
        >
          <img src={ICONS.gpu} className="card-icon" alt="GPU" />
          <h3>Graphics</h3>
          <p
            className="metric"
            style={{
              fontSize: "1.1rem",
              overflow: "hidden",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              marginBottom: "5px",
            }}
          >
            {primaryGpu.model}
          </p>
          <MetricBar
            percent={primaryGpu.utilization || 0}
            label="Load"
            value={`${primaryGpu.utilization || 0}%`}
            activePrimaryColor={activePrimaryColor}
          />
        </div>

        <div
          className="card secondary-card"
          onClick={() => setSelectedCard("battery")}
        >
          <img src={ICONS.battery} className="card-icon" alt="Battery" />
          <h3>Battery</h3>
          <p className="metric" style={{ fontSize: "1.2rem" }}>
            {stats.battery}
          </p>
        </div>

        <div
          className="card secondary-card"
          onClick={() => setSelectedCard("net")}
        >
          <img src={ICONS.net} className="card-icon" alt="Network" />
          <h3>Network</h3>
          <div className="metric" style={{ marginBottom: "5px" }}>
            {stats.linkSpeed}{" "}
            <span style={{ fontSize: "1rem", color: "#aaa" }}>Mbps</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "15px",
              color: "#aaa",
              fontSize: "0.9rem",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <img src={ICONS.down} style={{ width: "16px" }} alt="Down" />{" "}
              {stats.netDown}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <img src={ICONS.up} style={{ width: "16px" }} alt="Up" />{" "}
              {stats.netUp}
            </div>
          </div>
        </div>

        <div className="card ai-card" style={{ cursor: "default" }}>
          <img
            src={ICONS.ai}
            className="card-icon"
            alt="AI"
            style={{ width: "40px", height: "40px", marginBottom: 0 }}
          />
          <p className="ai-message">{aiMessage}</p>
        </div>
      </main>

      {/* --- MODAL OVERLAY --- */}
      {selectedCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCard(null)}>
              ×
            </button>
            <h2>{detailContent[selectedCard].title}</h2>

            {/* CPU */}
            {selectedCard === "cpu" && (
              <div>
                <div
                  className="metric"
                  style={{ fontSize: "3rem", margin: "20px 0" }}
                >
                  {detailContent.cpu.value}
                </div>
                <div className="detail-list">
                  <div className="detail-row">
                    <p>Chipset:</p>
                    <p>{stats.chipset}</p>
                  </div>
                  <div className="detail-row">
                    <p>Cores / Threads:</p>
                    <p>
                      {stats.cores} / {stats.threads}
                    </p>
                  </div>
                  <div className="detail-row">
                    <p>Processes Running:</p>
                    <p>{stats.totalProcesses}</p>
                  </div>
                </div>
                <h3
                  style={{
                    marginTop: "30px",
                    marginBottom: "10px",
                    fontSize: "1.2rem",
                    color: activePrimaryColor,
                  }}
                >
                  Top Processes
                </h3>
                <div className="process-list">
                  {stats.topProcesses && stats.topProcesses.length > 0 ? (
                    stats.topProcesses.map((p, index) => (
                      <div key={index} className="detail-row">
                        <p>{p.name}</p>
                        <p>{p.cpu}%</p>
                      </div>
                    ))
                  ) : (
                    <p className="detail-row">Loading processes...</p>
                  )}
                </div>
              </div>
            )}

            {/* MEMORY */}
            {selectedCard === "mem" && (
              <div>
                <div
                  className="metric"
                  style={{ fontSize: "3rem", margin: "20px 0" }}
                >
                  {detailContent.mem.value}
                </div>
                <MetricBar
                  percent={memPercent}
                  label="Total Usage"
                  value={`${memPercent}%`}
                  activePrimaryColor={activePrimaryColor}
                />
                <h3
                  style={{
                    marginTop: "30px",
                    marginBottom: "10px",
                    fontSize: "1.2rem",
                    color: activePrimaryColor,
                  }}
                >
                  Module Details
                </h3>
                {stats.memDetails.length > 0 ? (
                  stats.memDetails.map((detail, index) => (
                    <div key={index} className="detail-list">
                      <div className="detail-row">
                        <p>
                          Slot {index + 1} ({detail.manufacturer}):
                        </p>
                        <p>
                          {detail.size} {detail.type} @ {detail.speed} MHz
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="detail-row" style={{ color: "#999" }}>
                    Detailed RAM info unavailable.
                  </p>
                )}
              </div>
            )}

            {/* GPU */}
            {selectedCard === "gpu" && (
              <div>
                {stats.gpuControllers.map((gpu, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "30px",
                      paddingBottom: "20px",
                      borderBottom: "1px solid #444",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        fontSize: "1.2rem",
                        color: activePrimaryColor,
                      }}
                    >
                      {gpu.model}
                    </h3>
                    <div style={{ marginBottom: "20px" }}>
                      <MetricBar
                        percent={gpu.utilization || 0}
                        label="Core Load"
                        value={gpu.utilization ? `${gpu.utilization}%` : "N/A"}
                        activePrimaryColor={activePrimaryColor}
                      />
                      <MetricBar
                        percent={gpu.temperature || 0}
                        label="Temp"
                        value={gpu.temperature ? `${gpu.temperature}°C` : "N/A"}
                        activePrimaryColor={activePrimaryColor}
                      />
                    </div>
                    <div className="detail-list">
                      <div className="detail-row">
                        <p>Vendor:</p>
                        <p>{gpu.vendor}</p>
                      </div>
                      <div className="detail-row">
                        <p>VRAM:</p>
                        <p>{gpu.vram}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NETWORK */}
            {selectedCard === "net" && (
              <div className="detail-list" style={{ marginTop: "20px" }}>
                <div
                  className="metric"
                  style={{ fontSize: "3rem", margin: "20px 0" }}
                >
                  {stats.linkSpeed} Mbps
                </div>
                <div className="detail-row">
                  <p>Active Interface:</p>
                  <p>{stats.interfaceName || "Unknown"}</p>
                </div>
                <div className="detail-row">
                  <p>Download Speed:</p>
                  <p
                    style={{
                      color: getNetColor(stats.netDown),
                      fontWeight: "bold",
                    }}
                  >
                    {stats.netDown} Mbps
                  </p>
                </div>
                <div className="detail-row">
                  <p>Upload Speed:</p>
                  <p
                    style={{
                      color: getNetColor(stats.netUp),
                      fontWeight: "bold",
                    }}
                  >
                    {stats.netUp} Mbps
                  </p>
                </div>
                <div className="detail-row">
                  <p>Total Data Rx:</p>
                  <p>{stats.netRxTotal} GB</p>
                </div>
                <div className="detail-row">
                  <p>Total Data Tx:</p>
                  <p>{stats.netTxTotal} GB</p>
                </div>
                <div className="detail-row">
                  <p>Ping (Latency):</p>
                  <p style={{ color: getLatencyColor(stats.latency) }}>
                    {stats.latency ? `${stats.latency} ms` : "Calculating..."}
                  </p>
                </div>
              </div>
            )}

            {/* Default for Temp/Battery */}
            {["temp", "battery"].includes(selectedCard) && (
              <div
                className="metric"
                style={{ fontSize: "3rem", margin: "20px 0" }}
              >
                {detailContent[selectedCard].value}
              </div>
            )}

            <p
              style={{
                lineHeight: "1.6",
                color: "#ccc",
                marginTop: "20px",
                fontSize: "0.9rem",
                fontStyle: "italic",
              }}
            >
              {detailContent[selectedCard].desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
