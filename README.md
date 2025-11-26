# Clarity Dashboard v1.0.0 🚀
Clarity is a minimalist, real-time system resource monitor built for simplicity and focus. It provides a clean overview of your computer's health without the clutter of complex task managers.

(Optional: Upload a screenshot of your app here)

## ✨ Key Features
Real-Time Monitoring: accurate, live updates for CPU, Memory (RAM), GPU, Temperature, Battery, and Network speeds.

Smart Diagnostics: Built-in logic analyzes your stats to provide simple, human-readable health summaries (e.g., "High Load," "Battery Low").

Deep Dive Modals: Click any card to reveal advanced specifications:

CPU: Chipset model, Core/Thread counts, and Top 5 resource-hogging processes.

Memory: Detailed breakdown of individual RAM sticks/modules.

GPU: VRAM usage, Core Utilization, Clock speeds, and driver versions.

Network: Active Interface, Link Capacity, and Ping/Latency stability.

Visual Alerts: Color-coded indicators (Green/Yellow/Red) for instant status recognition.

Privacy Focused: All data is processed locally on your machine. No cloud connections.

## 📥 Installation
macOS (Apple Silicon & Intel)
Download Clarity-1.0.0.dmg on the releases page.

Double-click to open and drag the app to your Applications folder.

Note: Since this is a student project, it is not signed by the Mac App Store.

If you see a warning that the app is damaged or cannot be opened:

Right-click the app icon and select Open.

Click Open in the popup dialog.

Windows
Download Clarity-1.0.0-setup.exe on the releases page.

Run the installer.

If you see a "Windows protected your PC" warning:

Click More Info.

Click Run Anyway.

## 💻 Running Clarity Locally (Development Mode)
If you are a developer, you can run and modify the Clarity Dashboard directly from the source code.

Get the Code & Install Dependencies
Download the Code: Download the zipped source files (or clone the repository).
Open in VS Code: Open the project folder (clarity-v1 or similar) in Visual Studio Code.

Install Libraries: Open the Integrated Terminal (Ctrl + ~) and run the installer commands. This downloads all necessary dependencies (React, Electron, systeminformation).

Bash

npm install
If you see any warnings about packages failing to compile (e.g., osx-temperature-sensor), run npm run postinstall to rebuild them for Electron.

Launch the Application
In the same VS Code Terminal, run the development script:
Bash

npm run dev
Verify: A new desktop window should open automatically, displaying the Clarity Dashboard. Data (like CPU, Memory, Network speed) should start updating every 2 seconds.

Working with the Code
Frontend (UI): Edit the files in the src/renderer/src/ folder (App.jsx and main.css). Changes will appear instantly in the running Electron window thanks to Hot Module Replacement (HMR).
Backend (Data): Edit src/main/index.js to adjust data fetching logic (like adding new system metrics). You will need to stop the app (Ctrl + C) and run npm run dev again after editing backend files.

## 🛠 Tech Stack
Frontend: React.js + Vite

Backend: Electron.js

System Data: systeminformation library

Styling: Custom CSS with FontAwesome 6

Created by Jonathan Baker as a Capstone Project.
