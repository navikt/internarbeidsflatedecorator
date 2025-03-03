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
      //external: ['react', 'react-dom'],
      output: {
        entryFileNames: 'bundle.js',
        // format: "iife",
        inlineDynamicImports: true,
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
