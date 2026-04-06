# Clarity Dashboard v1.0.0

Clarity is a minimalist, real-time system resource monitor built for simplicity and focus. It provides a clean overview of your computer's health without the clutter of complex task managers.

---

## Features

- **Real-Time Monitoring** — Live updates every 2 seconds for CPU, Memory (RAM), GPU, Temperature, Battery, and Network
- **Smart Diagnostics** — Built-in health analysis with human-readable summaries ("System is running smoothly", "High CPU Load", etc.)
- **Deep Dive Modals** — Click any card for advanced specs:
  - CPU: Chipset model, core/thread count, top 5 processes by CPU usage
  - Memory: Per-slot module details (type, speed, size, manufacturer)
  - GPU: Utilization, temperature, VRAM, vendor
  - Network: Active interface, link speed, download/upload speeds, ping/latency
- **Visual Alerts** — Color-coded indicators (green / yellow / red) for instant status recognition
- **Theme Picker** — 6 gradient themes with animated glassmorphism backgrounds
- **Privacy First** — All data is read locally. No cloud connections, no telemetry

---

## Installation

### macOS (Apple Silicon & Intel)

1. Download **`clarity-dashboard-darwin-arm64-1.0.0.zip`** from the [Releases](../../releases) page
2. Unzip the file — you'll get **Clarity Dashboard.app**
3. Drag it to your **Applications** folder
4. Double-click to open

> **Seeing a security warning?**
> This app is not notarized with Apple. Right-click the app icon, choose **Open**, then click **Open** in the dialog.
> If the warning persists, go to **System Settings → Privacy & Security** and click **Open Anyway**.

---

### Windows

1. Download **`clarity-dashboard-win32-x64-setup.exe`** from the [Releases](../../releases) page
2. Run the installer
3. If you see **"Windows protected your PC"**: click **More info** then **Run anyway**
4. Clarity will launch automatically after install

---

## Build From Source

**Requirements:** Node.js 18+, npm

```bash
# Clone the repo
git clone https://github.com/bakejona/clarity-v1.git
cd clarity-v1

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build + package for your current platform
npm run build && npm run make
```

Packaged installers are output to `dist/make/`.

| Platform | Output |
|----------|--------|
| macOS | `dist/make/zip/darwin/arm64/` |
| Windows | `dist/make/squirrel.windows/` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 + Vite |
| Desktop | Electron 28 |
| System Data | systeminformation |
| Styling | Custom CSS (glassmorphism) |
| Packaging | Electron Forge |

---

Created by Jonathan Baker
