const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Project management
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  saveProjects: (projects) => ipcRenderer.invoke('save-projects', projects),
  
  // Project scanning
  scanProjects: () => ipcRenderer.invoke('scan-projects'),
  selectScanFolder: () => ipcRenderer.invoke('select-scan-folder'),
  scanProjectResources: (path) => ipcRenderer.invoke('scan-project-resources', path),
  
  // Check if we're running in Electron
  isElectron: true
});
