import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// Custom plugin to log version on server start
const versionLogger = () => ({
  name: 'version-logger',
  configureServer(server) {
    server.httpServer?.once('listening', () => {
      console.log('\n\x1b[36m%s\x1b[0m', '====================================================');
      console.log('\x1b[36m%s\x1b[0m', `   Media Project Manager v${pkg.version}`);
      console.log('\x1b[36m%s\x1b[0m', '====================================================');
      console.log('\x1b[32m%s\x1b[0m', `   Running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log('\x1b[90m%s\x1b[0m', `   See changelog for v${pkg.version} features.`);
      console.log('\n');
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionLogger()],
})
