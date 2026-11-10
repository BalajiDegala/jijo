import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const bundledPackages = [
  'react', 'react-dom', 'scheduler', 'lucide-react', 'yaml', 'fflate', '@fontsource/barlow', '@fontsource-variable/inter',
  '@xyflow/react', '@xyflow/system', 'classcat', 'zustand', 'use-sync-external-store', 'd3-color', 'd3-dispatch',
  'd3-drag', 'd3-ease', 'd3-interpolate', 'd3-selection', 'd3-timer', 'd3-transition', 'd3-zoom',
];

export default defineConfig({
  plugins: [react(), {
    name: 'bundled-license-notices',
    generateBundle() {
      const notices = bundledPackages.map(name => {
        const filename = name === 'classcat' ? 'LICENSE.md' : 'LICENSE';
        const file = new URL('./node_modules/' + name + '/' + filename, import.meta.url);
        return name + '\n\n' + readFileSync(file, 'utf8').trimEnd();
      });
      this.emitFile({ type: 'asset', fileName: 'third-party-notices.txt', source: notices.join('\n\n') + '\n' });
    },
  }],
  resolve: { dedupe: ['react', 'react-dom', 'yaml'] },
  server: { port: 4178, strictPort: true },
});
