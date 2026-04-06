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
      const defaultIfaceId = await si.networkInterfaceDefault();
      const [cpuLoad, mem, temp, battery, netStats, netInterfaces, memLayout, cpuInfo, procInfo, osInfo, graphics, latency] = await Promise.all([
        si.currentLoad(), si.mem(), si.cpuTemperature(), si.battery(),
        si.networkStats(), si.networkInterfaces(), si.memLayout(), si.cpu(),
        si.processes(), si.osInfo(), si.graphics(), si.inetLatency()
      ]);

      // Network
      const ifaceList = Array.isArray(netInterfaces) ? netInterfaces : Object.values(netInterfaces);
      const activeStat = netStats.find(i => i.iface === defaultIfaceId) || netStats[0] || {};
      const activeInterface = ifaceList.find(i => i.iface === defaultIfaceId) || {};
      const netRxSec = activeStat.rx_sec || 0;
      const netTxSec = activeStat.tx_sec || 0;
      const netDown = (netRxSec / 1024 / 1024 * 8).toFixed(1);
      const netUp = (netTxSec / 1024 / 1024 * 8).toFixed(1);
      const netRxTotal = ((activeStat.rx_bytes || 0) / 1024 / 1024 / 1024).toFixed(2);
      const netTxTotal = ((activeStat.tx_bytes || 0) / 1024 / 1024 / 1024).toFixed(2);
      const linkSpeed = activeInterface.speed ? activeInterface.speed.toString() : 'Unknown';
      const interfaceName = activeInterface.ifaceName || activeInterface.iface || defaultIfaceId || 'Unknown';

      // Memory modules
      const memDetails = memLayout
        .filter(stick => stick.size > 0)
        .map(stick => ({
          type: stick.type || 'Unknown',
          speed: stick.clockSpeed ? stick.clockSpeed.toString() : 'N/A',
          size: (stick.size / 1024 / 1024 / 1024).toFixed(0) + ' GB',
          manufacturer: stick.manufacturer || 'Unknown'
        }));

      // Processes
      const topProcesses = procInfo.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 5)
        .map(p => ({ name: p.name, cpu: p.cpu.toFixed(1) }));

      // GPU controllers
      const gpuControllers = graphics.controllers.map(gpu => ({
        model: gpu.model || 'Unknown',
        vendor: gpu.vendor || 'Unknown',
        vram: gpu.vram > 0 ? gpu.vram + ' MB' : 'Shared/Dynamic',
        driver: gpu.driverVersion || 'N/A',
        bus: gpu.bus || 'Internal',
        utilization: gpu.utilizationGpu || 0,
        temperature: gpu.temperatureGpu || 0,
        clockCore: gpu.clockCore || 0,
        clockMem: gpu.clockMemory || 0,
        memoryUsed: gpu.memoryUsed || 0,
        memoryTotal: gpu.memoryTotal || 0
      }));

      // Displays
      const gpuDisplays = (graphics.displays || []).map(d => ({
        vendor: d.vendor || 'Unknown',
        model: d.model || d.deviceName || 'Display',
        main: d.main || false,
        resolutionX: d.currentResX || d.resolutionX || 0,
        resolutionY: d.currentResY || d.resolutionY || 0
      }));

      // Battery: desktop = "Plugged In", laptop = percent string
      const hasBattery = battery.hasBattery;
      const batteryStr = hasBattery
        ? (battery.isCharging ? `${battery.percent}% (Charging)` : `${battery.percent}%`)
        : 'Plugged In';

      return {
        cpuUsage: Math.round(cpuLoad.currentLoad),
        memUsed: (mem.active / 1024 / 1024 / 1024).toFixed(2),
        memTotal: (mem.total / 1024 / 1024 / 1024).toFixed(2),
        temp: temp.main || temp.max || 0,
        battery: batteryStr,
        memDetails,
        chipset: cpuInfo.brand || cpuInfo.manufacturer || 'Unknown',
        cores: cpuInfo.physicalCores || cpuInfo.cores,
        threads: cpuInfo.cores,
        totalProcesses: procInfo.all,
        topProcesses,
        hostname: osInfo.hostname,
        isLaptop: hasBattery,
        gpuControllers,
        gpuDisplays,
        netDown,
        netUp,
        netRxTotal,
        netTxTotal,
        latency: latency || 0,
        linkSpeed,
        interfaceName
      };

    } catch (error) {
      console.error("Stats error:", error);
      return null;
    }
  })  

  createWindow()
})