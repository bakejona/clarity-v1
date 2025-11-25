import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) { console.error(error) }
} else {
  window.electron = electronAPI
  window.api = api
}