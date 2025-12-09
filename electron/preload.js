const { contextBridge, ipcRenderer, webUtils } = require('electron');

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

  // API Key Management (Secure)
  saveApiKey: (service, key) => ipcRenderer.invoke('save-api-key', service, key),
  getApiKey: (service) => ipcRenderer.invoke('get-api-key', service),
  deleteApiKey: (service) => ipcRenderer.invoke('delete-api-key', service),
  listApiKeys: () => ipcRenderer.invoke('list-api-keys'),

  // File operations for API results
  downloadFile: (url, savePath) => ipcRenderer.invoke('download-file', url, savePath),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  openPath: (path) => ipcRenderer.invoke('open-path', path),

  // File Utils (Required for File object path access in Renderer)
  getPathForFile: (file) => webUtils.getPathForFile(file),

  // Check if we're running in Electron
  isElectron: true,

  // Generic IPC invoke for flexible extensions
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
});
