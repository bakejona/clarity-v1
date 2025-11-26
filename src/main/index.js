import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import si from 'systeminformation'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  
ipcMain.handle('get-system-stats', async () => {
    try {
      // 1. Identify the default (active) interface first
      const defaultIfaceId = await si.networkInterfaceDefault();

      // 2. Fetch all data
      const [cpuLoad, mem, temp, battery, netStats, netInterfaces, memLayout, cpuInfo, procInfo, osInfo, graphics, latency] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.cpuTemperature(),
        si.battery(),
        si.networkStats(),      // Stats (Rx/Tx speed) for all interfaces
        si.networkInterfaces(), // Static info (Link speed, type) for all interfaces
        si.memLayout(),
        si.cpu(),
        si.processes(),
        si.osInfo(),
        si.graphics(),
        si.inetLatency()
      ]);

      // 3. Find the active interface data
      // Filter stats to find the one matching defaultIfaceId
      const activeStat = netStats.find(i => i.iface === defaultIfaceId) || netStats[0];
      const activeInterface = netInterfaces.find(i => i.iface === defaultIfaceId) || {};

      // 4. Process Network Speeds
      const netRxSec = activeStat.rx_sec || 0;
      const netTxSec = activeStat.tx_sec || 0;
      const netDown = (netRxSec / 1024 / 1024 * 8).toFixed(1); // Mbps
      const netUp = (netTxSec / 1024 / 1024 * 8).toFixed(1);   // Mbps
      
      // Total Data
      const netRxTotal = (activeStat.rx_bytes / 1024 / 1024 / 1024).toFixed(2); 
      const netTxTotal = (activeStat.tx_bytes / 1024 / 1024 / 1024).toFixed(2);

      // Link Speed (Capacity) - e.g. 1000Mb/s
      const linkSpeed = activeInterface.speed || 'Unknown';

      // 5. Process Memory Details
      const memDetails = memLayout.map(stick => ({
          type: stick.type, speed: stick.clockSpeed || 'N/A',
          size: (stick.size / 1024 / 1024 / 1024).toFixed(0) + ' GB',
          manufacturer: stick.manufacturer || 'Unknown'
      }));

      // 6. Process Top 5 Processes
      const topProcesses = procInfo.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 5)
        .map(p => ({ name: p.name, cpu: p.cpu.toFixed(1) }));

      // 7. Process GPU
      const gpuControllers = graphics.controllers.map(gpu => ({
        model: gpu.model, vendor: gpu.vendor, vram: gpu.vram > 0 ? (gpu.vram / 1024).toFixed(0) + ' MB' : 'Shared/Dynamic',
        driver: gpu.driverVersion || 'N/A', bus: gpu.bus || 'Internal',
        utilization: gpu.utilizationGpu || 0, temperature: gpu.temperatureGpu || 0,
        clockCore: gpu.clockCore || 0, clockMem: gpu.clockMemory || 0,
        memoryUsed: gpu.memoryUsed ? (gpu.memoryUsed / 1024).toFixed(0) : 0, 
        memoryTotal: gpu.memoryTotal ? (gpu.memoryTotal / 1024).toFixed(0) : 0
      }));

      return {
        cpuUsage: Math.round(cpuLoad.currentLoad),
        memUsed: (mem.active / 1024 / 1024 / 1024).toFixed(2),
        memTotal: (mem.total / 1024 / 1024 / 1024).toFixed(2),
        temp: temp.main || 0,
        battery: battery.hasBattery ? `${battery.percent}%` : 'Plugged In',
        memDetails: memDetails,
        chipset: cpuInfo.brand || cpuInfo.model || 'Unknown Chipset',
        cores: cpuInfo.cores, threads: cpuInfo.processors, totalProcesses: procInfo.all,
        topProcesses: topProcesses,
        hostname: osInfo.hostname, isLaptop: battery.hasBattery,
        gpuControllers: gpuControllers, gpuDisplays: graphics.displays,
        // --- CORRECTED NETWORK DATA ---
        netDown: netDown,
        netUp: netUp,
        netRxTotal: netRxTotal,
        netTxTotal: netTxTotal,
        latency: latency,
        linkSpeed: linkSpeed, // <-- NEW
        interfaceName: activeInterface.ifaceName || defaultIfaceId // <-- NEW (e.g. "Wi-Fi")
      };
    } catch (error) {
      console.error("Stats error:", error);
      return null;
    }
  })  

  createWindow()
})