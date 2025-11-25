import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import si from 'systeminformation'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
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
  
  // --- SYSTEM STATS HANDLER (UPDATED) ---
  ipcMain.handle('get-system-stats', async () => {
    try {
      // 1. Fetch all data in parallel for speed
      const [cpu, mem, temp, battery, net] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.cpuTemperature(),
        si.battery(),
        si.networkStats()
      ]);

      // 2. Process Network Speed (sum of all interfaces)
      const netRx = net.length > 0 ? net[0].rx_sec : 0; // Download bytes/sec
      const netTx = net.length > 0 ? net[0].tx_sec : 0; // Upload bytes/sec
      const netSpeed = (netRx / 1024 / 1024 * 8).toFixed(1); // Convert to Mbps

      // 3. Return clean object
      return {
        cpuUsage: Math.round(cpu.currentLoad),
        memUsed: (mem.active / 1024 / 1024 / 1024).toFixed(2),
        memTotal: (mem.total / 1024 / 1024 / 1024).toFixed(2),
        temp: temp.main || 0,
        battery: battery.hasBattery ? `${battery.percent}%` : 'Plugged In',
        netSpeed: netSpeed // Mbps
      };
    } catch (error) {
      console.error("Stats error:", error);
      return null;
    }
  })

  createWindow()
})