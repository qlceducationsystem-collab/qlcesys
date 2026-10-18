import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const shared = fileURLToPath(new URL('../shared', import.meta.url));
const buildId = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || Date.now().toString(36);

const versionFile = () => ({
  name: 'qlc-version-file',
  configureServer(server) {
    server.middlewares.use('/version.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ version: buildId }));
    });
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: buildId, builtAt: new Date().toISOString() }) });
  },
});

export default defineConfig({
  plugins: [react(), versionFile()],
  define: { __APP_VERSION__: JSON.stringify(buildId) },
  resolve: { alias: { '@shared': shared } },
  server: { port: 5173, fs: { allow: ['..'] } },
});
