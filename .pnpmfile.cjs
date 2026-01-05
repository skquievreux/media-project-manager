function readPackage(pkg) {
  // Allow build scripts for Electron and related packages
  if (pkg.name === 'electron' || pkg.name === 'esbuild' || pkg.name === 'electron-winstaller') {
    pkg.scripts = pkg.scripts || {};
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
