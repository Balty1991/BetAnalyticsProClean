import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Setează base pentru GitHub Pages: /BetAnalyticsProClean/
// Dacă repo-ul are alt nume, schimbă aici.
export default defineConfig({
  plugins: [react()],
  base: '/BetAnalyticsProClean/',
});
