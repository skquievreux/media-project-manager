import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';

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
            nodeIntegration: true,
            contextIsolation: false,
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
        const downloadsPath = path.join(app.getPath('home'), 'Downloads');
        logError('scan-projects', `Starting scan in ${downloadsPath}`);

        if (!fs.existsSync(downloadsPath)) {
            logError('scan-projects', `Verzeichnis ${downloadsPath} nicht gefunden.`);
            return { error: `Verzeichnis ${downloadsPath} nicht gefunden.` };
        }

        const items = await fs.promises.readdir(downloadsPath, { withFileTypes: true });
        const directories = items.filter(item => item.isDirectory());

        logError('scan-projects', `Found ${directories.length} directories to check.`);

        const projects = [];

        for (const dir of directories) {
            try {
                const match = dir.name.match(/^((?:Album|Song|Commercial|Bilder|Projekt))-(.+)$/);

                if (match) {
                    const type = match[1];
                    const name = match[2];
                    const dirPath = path.join(downloadsPath, dir.name);

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
            } catch (e) {
                logError(`scan-projects:loop:${dir.name}`, e.message);
            }
        }

        logError('scan-projects', `Scan complete. Found ${projects.length} projects.`);
        return { success: true, projects };
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
                            url: `file://${fullPath}`, // Use file protocol for local display
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
