import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',           // TÄRKEÄ Electronille, jotta assetit löytyvät
  build: {
    outDir: 'dist',
  },
});
