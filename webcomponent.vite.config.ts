import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    minify: true,
    rollupOptions: {
      input: 'src/web-component.ts',
      output: {
        entryFileNames: 'internarbeidsflate-decorator.wc.js',
        format: 'iife',
        inlineDynamicImports: true,
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
