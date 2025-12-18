# Build Resources

This directory contains resources needed for building the Electron app.

## Required Icons

To build the app, you need to add the following icons:

### Windows
- `icon.ico` - Windows app icon (256x256 or multi-resolution .ico file)

### macOS
- `icon.icns` - macOS app icon (512x512 or multi-resolution .icns file)

### Linux
- `icon.png` - Linux app icon (512x512 PNG file)

## Creating Icons

You can use online tools or command-line tools to create these icons from a single source image:

### Online Tools
- https://www.icoconverter.com/ (for .ico files)
- https://cloudconvert.com/png-to-icns (for .icns files)

### Command Line Tools
- `electron-icon-builder` (npm package)
- `imagemagick` (for Linux)

## macOS Entitlements

The `entitlements.mac.plist` file is already included and configured for development.
For production, you may need to adjust the entitlements based on your app's requirements.

## Usage

```bash
# Build for current platform
npm run build:electron

# Build for specific platform
npm run build:electron:win    # Windows
npm run build:electron:mac    # macOS
npm run build:electron:linux  # Linux
```

Builds will be output to the `dist-electron` directory.
