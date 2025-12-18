# Development Scripts

Helper scripts to streamline local development.

## Available Scripts

### 🚀 Start Development

**Mac/Linux:**
```bash
./scripts/dev.sh
```

**Windows:**
```cmd
scripts\dev.bat
```

This script will:
- Check and install dependencies if needed
- Create `.env.local` from example if missing
- Start Vite dev server and Electron app
- Show colored console output

### 🧹 Reset Project

**Mac/Linux:**
```bash
./scripts/reset.sh
```

**Windows:**
```cmd
scripts\reset.bat
```

This script will:
- Remove all build artifacts (dist, dist-electron, .vite cache)
- Reinstall all dependencies from scratch
- Useful when things break or after switching branches

## NPM Scripts (Alternative)

If you prefer using npm directly:

```bash
# Quick start (recommended)
npm start

# Development with colored logs
npm run electron:dev

# Development with auto-restart on electron/ changes
npm run electron:watch

# Build for production
npm run build:electron

# Build for specific platform
npm run build:electron:win     # Windows
npm run build:electron:mac     # macOS
npm run build:electron:linux   # Linux

# Clean build artifacts
npm run clean        # Mac/Linux
npm run clean:win    # Windows

# Reset everything
npm run reset        # Mac/Linux
npm run reset:win    # Windows

# Code quality
npm run lint         # Check code
npm run lint:fix     # Auto-fix issues
```

## VS Code Debugging

Press `F5` in VS Code to launch the app with debugger attached.

Available configurations:
- **Electron: Main Process** - Debug only the main process
- **Electron: Full App (Dev)** - Run the full app
- **Electron: Main + Renderer** - Debug both processes

## Troubleshooting

### Port 5173 already in use

Kill the existing Vite server:
```bash
# Mac/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Dependencies out of sync

Run the reset script:
```bash
./scripts/reset.sh    # Mac/Linux
scripts\reset.bat     # Windows
```

### Electron won't start

1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Clear Electron cache:
   ```bash
   # Mac
   rm -rf ~/Library/Application\ Support/media-project-manager/

   # Linux
   rm -rf ~/.config/media-project-manager/

   # Windows
   del /q %APPDATA%\media-project-manager\*
   ```

### Build fails

Make sure you've built the React app first:
```bash
npm run build
npm run build:electron
```

## Environment Variables

Create `.env.local` from `.env.local.example`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` to customize:
- Feature flags
- API endpoints
- Development settings

## Tips

1. **Use `npm start`** for the fastest development experience
2. **Use `npm run electron:watch`** if you're editing electron/ files frequently
3. **Run `npm run reset`** if you encounter weird issues
4. **Check logs** in `~/Library/Application Support/media-project-manager/error.log`
