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

// Silence annoying Autofill errors in DevTools/Console
app.commandLine.appendSwitch('disable-features', 'AutofillAddressEnabled,AutofillCreditCardEnabled,AutofillPasswordManagerEnabled');


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

// Register privileges to allow fetching local resources
protocol.registerSchemesAsPrivileged([
    { scheme: 'media', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } }
]);

app.whenReady().then(() => {
    // Register 'media' protocol to serve local files
    // Register 'media' protocol to serve local files
    protocol.registerFileProtocol('media', (request, callback) => {
        try {
            // Strip protocol and all leading slashes (media://, media:///, etc.)
            let url = request.url.replace(/^media:\/\/+/, '');
            url = decodeURIComponent(url);

            // Handle Windows drive letters where colon might be missing or stripped
            // Case 1: "c/Users/..." -> "c:/Users/..."
            if (process.platform === 'win32' && url.match(/^[a-zA-Z]\//)) {
                url = url.charAt(0) + ':' + url.slice(1);
            }

            // Case 2: "/c:/Users/..." -> "c:/Users/..." (if strip failed to catch leading slash from path)
            if (process.platform === 'win32' && url.match(/^\/[a-zA-Z]:/)) {
                url = url.slice(1);
            }

            const normalizedPath = path.normalize(url);
            // console.log(`Media Protocol: ${request.url} -> ${normalizedPath}`);

            return callback({ path: normalizedPath });
        } catch (error) {
            console.error('Failed to handle media protocol request:', error);
            return callback({ error: -2 }); // FILE_NOT_FOUND
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

// Utility: Select Directory
ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Projektordner auswählen'
    });
    if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true };
    }
    return { path: result.filePaths[0] };
});

// Utility: Get Auto-Save Project Root (Magic Workflow)
ipcMain.handle('get-standard-path', async () => {
    // Default to Downloads/MediaProjects as requested by user workflow
    const downloadsPath = app.getPath('downloads');
    const standardPath = path.join(downloadsPath, 'MediaProjects');

    // Ensure it exists
    try {
        await fs.promises.mkdir(standardPath, { recursive: true });
    } catch (e) {
        console.error("Could not create standard path", e);
    }

    return { path: standardPath };
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
        const ignoredFolders = ['.git', 'node_modules', 'dist', 'build', '.idea', '.vscode', 'tmp', 'temp'];

        // Recursive function to scan for assets
        async function scanDir(dir) {
            try {
                const items = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);

                    if (item.isDirectory()) {
                        if (ignoredFolders.includes(item.name) || item.name.startsWith('.')) continue;
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
                                url: 'media:///' + fullPath.split(path.sep).join('/'), // Standardize URL path
                                path: fullPath,
                                size: (await fs.promises.stat(fullPath)).size
                            });
                        }
                    }
                }
            } catch (err) {
                console.warn(`Skipping scan of ${dir}: ${err.message}`);
            }
        }

        await scanDir(projectPath);
        return { success: true, assets };
    } catch (error) {
        logError(`scan-project-resources:${projectPath}`, error.message);
        return { error: error.message };
    }
});

// IPC Handler for Intelligent File Import
ipcMain.handle('import-file', async (event, { sourcePath, destinationFolder, newFilename }) => {
    try {
        const destPath = path.join(destinationFolder, newFilename);

        // Ensure destination folder exists
        await fs.promises.mkdir(destinationFolder, { recursive: true });

        // Copy file (safer than move across drives)
        await fs.promises.copyFile(sourcePath, destPath);

        const stats = await fs.promises.stat(destPath);

        return {
            success: true,
            path: destPath,
            size: stats.size,
            name: newFilename
        };
    } catch (error) {
        console.error('Import file failed:', error);
        return { success: false, error: error.message };
    }
});

// IPC Handler for Renaming Files
ipcMain.handle('rename-file', async (event, { oldPath, newPath }) => {
    try {
        console.log(`Attempting rename: "${oldPath}" -> "${newPath}"`);

        // 1. Check if source exists explicitly
        if (!fs.existsSync(oldPath)) {
            console.warn(`Rename Source Not Found: "${oldPath}"`);

            // Try to rescue: Check parent folder for similarly named file
            const parentDir = path.dirname(oldPath);
            const targetName = path.basename(oldPath);

            if (fs.existsSync(parentDir)) {
                const siblings = await fs.promises.readdir(parentDir);

                // Case-insensitive match or NFC/NFD normalization match
                const match = siblings.find(s =>
                    s.toLowerCase() === targetName.toLowerCase() ||
                    s.normalize('NFC') === targetName.normalize('NFC') ||
                    s.normalize('NFD') === targetName.normalize('NFD')
                );

                if (match) {
                    const fixedPath = path.join(parentDir, match);
                    console.log(`Found fuzzy match for source: "${fixedPath}"`);
                    oldPath = fixedPath; // Use the found path
                } else {
                    return { success: false, error: `Quelldatei nicht gefunden: ${targetName} (in ${parentDir})` };
                }
            } else {
                return { success: false, error: `Quellordner nicht gefunden: ${parentDir}` };
            }
        }

        // Ensure destination folder exists
        const destDir = path.dirname(newPath);
        await fs.promises.mkdir(destDir, { recursive: true });

        await fs.promises.rename(oldPath, newPath);
        return { success: true };
    } catch (error) {
        console.error('Rename file failed detail:', error);
        return { success: false, error: error.message };
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

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    try {
        shell.showItemInFolder(filePath);
        return { success: true };
    } catch (error) {
        logError('show-item-in-folder', error.message);
        return { error: error.message };
    }
});


ipcMain.handle('read-dir', async (event, dirPath) => {
    try {
        if (!fs.existsSync(dirPath)) {
            return { error: `Directory not found: ${dirPath}` };
        }
        const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const result = items.map(item => ({
            name: item.name,
            isDirectory: item.isDirectory(),
            path: path.join(dirPath, item.name),
            // For files, we could get size, but let's keep it simple for now or do an extra stat call if needed.
            // Doing stat for every item might be slow for large folders, but helpful.
            // Let's do it for files.
        }));

        // Enrich with stats
        const enriched = await Promise.all(result.map(async (item) => {
            if (!item.isDirectory) {
                try {
                    const stats = await fs.promises.stat(item.path);
                    return { ...item, size: stats.size, mtime: stats.mtime };
                } catch (e) {
                    return item;
                }
            }
            return item;
        }));

        return { success: true, items: enriched };
    } catch (error) {
        logError(`read-dir:${dirPath}`, error.message);
        return { error: error.message };
    }
});


ipcMain.handle('analyze-project-structure', async (event, projectPath) => {
    try {
        if (!projectPath || typeof projectPath !== 'string') {
            return { error: 'Invalid project path' };
        }

        const changes = [];
        const projectName = path.basename(projectPath).replace(/^(Album|Song|Projekt)-/, '').trim();
        const maxFiles = 5000; // Safety limit
        let fileCount = 0;

        async function scan(dir) {
            if (fileCount >= maxFiles) return;

            try {
                const items = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const item of items) {
                    if (fileCount >= maxFiles) break;

                    // Skip hidden files/folders and node_modules
                    if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'dist') continue;

                    const fullPath = path.join(dir, item.name);

                    if (item.isDirectory()) {
                        // Skip symlinks to avoid loops
                        if (item.isSymbolicLink()) continue;
                        await scan(fullPath);
                    } else if (item.isFile()) {
                        fileCount++;

                        const relativeDir = path.relative(projectPath, dir);
                        const oldName = item.name;
                        let newName = oldName;
                        let reason = '';

                        // Logic 1: Track Folders
                        // If we are in "TRACK_08", ensure file starts with "Track 08 -" or "08 -"
                        const trackMatch = relativeDir.match(/TRACK_(\d+)/i);
                        if (trackMatch) {
                            const trackNum = trackMatch[1];
                            const prefix = `Track ${trackNum}`;
                            if (!newName.startsWith('Track') && !newName.startsWith(trackNum)) {
                                newName = `${prefix} - ${newName}`;
                                reason = 'Track Prefix missing';
                            }
                        }
                        // Logic 2: Root files
                        else if (relativeDir === '') {
                            if (!newName.startsWith(projectName)) {
                                newName = `${projectName} - ${newName}`;
                                reason = 'Project Prefix missing';
                            }
                        }

                        if (newName !== oldName) {
                            changes.push({
                                originalPath: fullPath,
                                newPath: path.join(dir, newName),
                                oldName,
                                newName,
                                folder: relativeDir || 'Root',
                                reason
                            });
                        }
                    }
                }
            } catch (err) {
                console.warn(`Scan error in ${dir}:`, err.message);
                // Continue scanning other directories 
            }
        }

        await scan(projectPath);

        if (fileCount >= maxFiles) {
            console.warn(`Scan limit reached (${maxFiles} files). Scan truncated.`);
        }

        return { success: true, changes, totalFiles: changes.length };
    } catch (error) {
        logError(`analyze-structure:${projectPath}`, error.message);
        return { error: error.message };
    }
});

ipcMain.handle('execute-renames', async (event, changes) => {
    try {
        let successCount = 0;
        let errors = [];

        for (const change of changes) {
            try {
                // Ensure target doesn't exist to prevent overwrite? 
                // For this feature, maybe we skip if exists, or auto-increment?
                if (fs.existsSync(change.newPath)) {
                    errors.push(`File exists: ${change.newName}`);
                    continue;
                }
                await fs.promises.rename(change.originalPath, change.newPath);
                successCount++;
            } catch (e) {
                errors.push(`${change.oldName}: ${e.message}`);
            }
        }
        return { success: true, processed: successCount, errors };
    } catch (error) {
        return { error: error.message };
    }
});

console.log('✅ All IPC handlers registered successfully');


