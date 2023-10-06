/// <reference types="vitest" />
import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
    build: {
        manifest: 'asset-manifest.json',
        outDir: 'build',
        sourcemap: true
    },
    plugins: [
        AutoImport({
            imports: ['vitest'],
            dts: true // generate TypeScript declaration
        })
    ],
    test: {
        environment: 'jsdom',
        setupFiles: ['./test/setupTests.js'],
        globals: true,
        globalSetup: ['./test/globalSetup.js']
    }
});
