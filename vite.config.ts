import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const bundledPackages = ['react', 'react-dom', 'scheduler', 'lucide-react', 'yaml', 'fflate', '@fontsource/barlow', '@fontsource-variable/inter'];

export default defineConfig({
  plugins: [react(), {
    name: 'bundled-license-notices',
    generateBundle() {
      const notices = bundledPackages.map(name => {
        const file = new URL('./node_modules/' + name + '/LICENSE', import.meta.url);
        return name + '\n\n' + readFileSync(file, 'utf8').trimEnd();
      });
      this.emitFile({ type: 'asset', fileName: 'third-party-notices.txt', source: notices.join('\n\n') + '\n' });
    },
  }],
  resolve: { dedupe: ['react', 'react-dom', 'yaml'] },
  server: { port: 4178, strictPort: true },
});
