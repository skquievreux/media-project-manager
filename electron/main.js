import { app, BrowserWindow, ipcMain, dialog, shell, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import https from 'https';
import {
    saveApiKey,
    getApiKey,
    deleteApiKey,
    listApiKeys
} from './apiKeyManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// Error Logging
const logPath = path.join(app.getPath('userData'), 'error.log');

function logError(context, error) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [${context}] ${error}\n`;
    try {
        fs.appendFileSync(logPath, message);
    } catch (e) {
        console.error('Failed to write to log:', e);
    }
}

// Helper to check if a port is reachable
function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            resolve(true);
            req.abort();
        }).on('error', () => {
            resolve(false);
        });
    });
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: "Media Project Manager",
        backgroundColor: '#0a0a0f'
    });

    if (process.env.NODE_ENV === 'development') {
        // Try ports 5173-5180
        let port = 5173;
        for (let p = 5173; p <= 5180; p++) {
            if (await checkPort(p)) {
                port = p;
                break;
            }
        }

        console.log(`Loading from http://localhost:${port}`);
        mainWindow.loadURL(`http://localhost:${port}`);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    // Register 'media' protocol to serve local files
    protocol.registerFileProtocol('media', (request, callback) => {
        let url = request.url.replace('media://', '');
        // Decode URL to handle spaces and special chars
        url = decodeURIComponent(url);

        // Handle Windows drive letters (e.g., /C:/path -> C:/path)
        if (process.platform === 'win32' && url.startsWith('/') && url.match(/^\/[a-zA-Z]:/)) {
            url = url.slice(1);
        }

        try {
            return callback(url);
        } catch (error) {
            console.error('Failed to register protocol', error);
        }
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for File System Access
ipcMain.handle('scan-projects', async (event) => {
    try {
        // Get all watch folders
        const defaultDownloads = path.join(app.getPath('home'), 'Downloads');
        let watchPaths = [defaultDownloads];

        // Load additional folders if they exist
        const watchFoldersJsonPath = path.join(app.getPath('userData'), 'watchFolders.json');
        if (fs.existsSync(watchFoldersJsonPath)) {
            try {
                const savedFolders = JSON.parse(fs.readFileSync(watchFoldersJsonPath, 'utf-8'));
                // Ensure unique paths
                watchPaths = [...new Set([...watchPaths, ...savedFolders])];
            } catch (e) {
                logError('scan-projects:load-watch', e.message);
            }
        }

        logError('scan-projects', `Scanning ${watchPaths.length} folders.`);
        const allProjects = [];

        for (const scanPath of watchPaths) {
            if (!fs.existsSync(scanPath)) {
                logError('scan-projects', `Directory ${scanPath} not found.`);
                continue;
            }

            try {
                const items = await fs.promises.readdir(scanPath, { withFileTypes: true });
                const directories = items.filter(item => item.isDirectory());

                for (const dir of directories) {
                    try {
                        const match = dir.name.match(/^((?:Album|Song|Commercial|Bilder|Projekt))-(.+)$/);

                        if (match) {
                            const type = match[1];
                            const name = match[2];
                            const dirPath = path.join(scanPath, dir.name);

                            const standardFolders = ['ANFORDERUNGEN', 'KONZEPT', 'UMSETZUNG', 'DOKUMENTATION'];
                            let hasStructure = false;

                            try {
                                const subDirs = await fs.promises.readdir(dirPath);
                                hasStructure = standardFolders.some(folder => subDirs.includes(folder));
                            } catch (e) {
                                continue;
                            }

                            if (hasStructure) {
                                let details = '';
                                if (type === 'Album') {
                                    try {
                                        const tracks = (await fs.promises.readdir(dirPath)).filter(f => f.startsWith('TRACK_')).length;
                                        details = `${tracks} Tracks`;
                                    } catch (e) {
                                        details = '0 Tracks';
                                    }
                                } else {
                                    details = 'Projekt';
                                }

                                allProjects.push({
                                    id: dir.name,
                                    name: name,
                                    type: type.toLowerCase(),
                                    path: dirPath,
                                    details: details,
                                    isManaged: true
                                });
                            }
                        }
                    } catch (e) {
                        logError(`scan-projects:loop:${dir.name}`, e.message);
                    }
                }
            } catch (e) {
                logError(`scan-projects:dir:${scanPath}`, e.message);
            }
        }

        logError('scan-projects', `Scan complete. Found ${allProjects.length} projects.`);
        return { success: true, projects: allProjects };
    } catch (error) {
        logError('scan-projects:main', error.message);
        return { error: error.message };
    }
});

// IPC Handler for Manual Folder Selection
ipcMain.handle('select-scan-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Ordner zum Scannen auswählen'
    });

    if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
    }

    const scanPath = result.filePaths[0];
    logError('select-scan-folder', `Scanning manually selected path: ${scanPath}`);

    try {
        const items = await fs.promises.readdir(scanPath, { withFileTypes: true });
        const directories = items.filter(item => item.isDirectory());
        const projects = [];

        for (const dir of directories) {
            try {
                const match = dir.name.match(/^((?:Album|Song|Commercial|Bilder|Projekt))-(.+)$/);
                if (match) {
                    const type = match[1];
                    const name = match[2];
                    const dirPath = path.join(scanPath, dir.name);

                    const standardFolders = ['ANFORDERUNGEN', 'KONZEPT', 'UMSETZUNG', 'DOKUMENTATION'];
                    let hasStructure = false;
                    try {
                        const subDirs = await fs.promises.readdir(dirPath);
                        hasStructure = standardFolders.some(folder => subDirs.includes(folder));
                    } catch (e) { continue; }

                    if (hasStructure) {
                        let details = 'Projekt';
                        if (type === 'Album') {
                            try {
                                const tracks = (await fs.promises.readdir(dirPath)).filter(f => f.startsWith('TRACK_')).length;
                                details = `${tracks} Tracks`;
                            } catch (e) { }
                        }
                        projects.push({
                            id: dir.name,
                            name: name,
                            type: type.toLowerCase(),
                            path: dirPath,
                            details: details,
                            isManaged: true
                        });
                    }
                }
            } catch (e) { }
        }
        return { success: true, projects };
    } catch (error) {
        return { error: error.message };
    }
});

// IPC Handler for Scanning Project Resources
ipcMain.handle('scan-project-resources', async (event, projectPath) => {
    try {
        if (!fs.existsSync(projectPath)) {
            return { error: `Project path not found: ${projectPath}` };
        }

        const assets = [];
        const assetExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.mp3', '.wav', '.pdf', '.txt', '.md'];

        // Recursive function to scan for assets
        async function scanDir(dir) {
            const items = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    await scanDir(fullPath);
                } else {
                    const ext = path.extname(item.name).toLowerCase();
                    if (assetExtensions.includes(ext)) {
                        // Determine type based on extension
                        let type = 'document';
                        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) type = 'image';
                        if (['.mp4', '.mov'].includes(ext)) type = 'video';
                        if (['.mp3', '.wav'].includes(ext)) type = 'audio';

                        assets.push({
                            id: Date.now() + Math.random(),
                            name: item.name,
                            type: type,
                            url: `media://${fullPath}`, // Use custom media protocol for local display
                            path: fullPath,
                            size: (await fs.promises.stat(fullPath)).size
                        });
                    }
                }
            }
        }

        await scanDir(projectPath);
        return { success: true, assets };
    } catch (error) {
        logError(`scan-project-resources:${projectPath}`, error.message);
        return { error: error.message };
    }
});

// Persistence Handlers
const projectsStorePath = path.join(app.getPath('userData'), 'projects.json');

ipcMain.handle('save-projects', async (event, projects) => {
    try {
        fs.writeFileSync(projectsStorePath, JSON.stringify(projects, null, 2));
        return { success: true };
    } catch (error) {
        logError('save-projects', error.message);
        return { error: error.message };
    }
});

ipcMain.handle('load-projects', async () => {
    try {
        if (fs.existsSync(projectsStorePath)) {
            const data = fs.readFileSync(projectsStorePath, 'utf-8');
            return { success: true, projects: JSON.parse(data) };
        }
        return { success: true, projects: null }; // No file yet
    } catch (error) {
        logError('load-projects', error.message);
        return { error: error.message };
    }
});

// Watch Folders Persistence
const watchFoldersPath = path.join(app.getPath('userData'), 'watchFolders.json');

ipcMain.handle('save-watch-folders', async (event, folders) => {
    try {
        fs.writeFileSync(watchFoldersPath, JSON.stringify(folders, null, 2));
        return { success: true };
    } catch (error) {
        logError('save-watch-folders', error.message);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-watch-folders', async () => {
    try {
        const defaultFolder = path.join(app.getPath('home'), 'Downloads');
        let folders = [defaultFolder];

        if (fs.existsSync(watchFoldersPath)) {
            const data = fs.readFileSync(watchFoldersPath, 'utf-8');
            const saved = JSON.parse(data);
            folders = [...new Set([...folders, ...saved])];
        }
        return { success: true, folders };
    } catch (error) {
        logError('get-watch-folders', error.message);
        return { success: false, error: error.message };
    }
});

// ============================================================================
// API Key Management Handlers
// ============================================================================

ipcMain.handle('save-api-key', async (event, service, key) => {
    try {
        const result = saveApiKey(service, key);
        if (result.success) {
            console.log(`✅ API key for ${service} saved successfully`);
        }
        return result;
    } catch (error) {
        logError('save-api-key', error.message);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-api-key', async (event, service) => {
    try {
        return getApiKey(service);
    } catch (error) {
        logError('get-api-key', error.message);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-api-key', async (event, service) => {
    try {
        const result = deleteApiKey(service);
        if (result.success) {
            console.log(`🗑️ API key for ${service} deleted successfully`);
        }
        return result;
    } catch (error) {
        logError('delete-api-key', error.message);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('list-api-keys', async () => {
    try {
        return listApiKeys();
    } catch (error) {
        logError('list-api-keys', error.message);
        return { success: false, error: error.message };
    }
});

// ============================================================================
// File Operations for API Results
// ============================================================================

ipcMain.handle('download-file', async (event, url, savePath) => {
    try {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            const fullPath = path.isAbsolute(savePath)
                ? savePath
                : path.join(app.getPath('downloads'), savePath);

            // Ensure directory exists
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const file = fs.createWriteStream(fullPath);

            protocol.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Download failed: ${response.statusCode}`));
                    return;
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    console.log(`✅ File downloaded: ${fullPath}`);
                    resolve({ success: true, path: fullPath });
                });

                file.on('error', (error) => {
                    fs.unlink(fullPath, () => { });
                    reject(error);
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    } catch (error) {
        logError('download-file', error.message);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-file', async (event, filePath) => {
    try {
        await shell.openPath(filePath);
        return { success: true };
    } catch (error) {
        logError('open-file', error.message);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-path', async (event, filePath) => {
    try {
        await shell.openPath(filePath);
        return { success: true };
    } catch (error) {
        logError('open-path', error.message);
        return { error: error.message };
    }
});

console.log('✅ All IPC handlers registered successfully');
