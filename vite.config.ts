import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: true,
    manifest: 'asset-manifest.json',
    rollupOptions: {
      input: 'src/index.ts',
      preserveEntrySignatures: 'exports-only',
      output: {
        entryFileNames: 'bundle.js',
        inlineDynamicImports: true,
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
