# pnpm + Electron - Known Issues & Solutions

## Problem: Electron binaries not installed with pnpm

### Symptom
```
Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```

### Root Cause
pnpm blocks build scripts by default for security reasons. Electron requires a postinstall script (`install.js`) to download its binaries, which pnpm blocks.

### Solution 1: Manual Installation (Implemented in start-mpm.bat)
```bash
cd node_modules\.pnpm\electron@39.2.7\node_modules\electron
node install.js
```

This is automatically handled by `start-mpm.bat`.

### Solution 2: Approve Build Scripts (Not Recommended)
```bash
pnpm approve-builds
# Select: electron, esbuild, electron-winstaller
```

**Problem:** Approval is not persisted across `pnpm install` runs.

### Solution 3: Use npm for Electron only (Alternative)
```bash
npm install electron --no-save --legacy-peer-deps
```

**Problem:** Mixes package managers (violates Governance Framework).

### Our Implementation
The `start-mpm.bat` script automatically runs the Electron install script if needed:

```batch
cd node_modules\.pnpm\electron@39.2.7\node_modules\electron 2>nul && node install.js 2>nul
```

This ensures Electron binaries are always available without manual intervention.

## GitHub Actions CI/CD

For CI/CD, we need to ensure Electron binaries are installed:

```yaml
- name: Install dependencies
  run: pnpm install

- name: Install Electron binaries
  run: |
    cd node_modules/.pnpm/electron@*/node_modules/electron
    node install.js
```

## Future Considerations

### Option A: Wait for pnpm to improve
Track: https://github.com/pnpm/pnpm/issues/6505

### Option B: Use electron-builder's electron-download
Configure electron-builder to handle downloads independently.

### Option C: Pre-download binaries
Store Electron binaries in a cache or CDN.

## Related Links
- [pnpm Build Scripts Documentation](https://pnpm.io/cli/approve-builds)
- [Electron Installation Issues](https://github.com/electron/electron/issues)
- [Governance Framework v3.0](../docs/GOVERNANCE_COMPLIANCE.md)

---

**Status:** ✅ Solved with workaround  
**Last Updated:** 2026-01-05  
**Affects:** pnpm v10.11.0 + Electron v39.2.7
