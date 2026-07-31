import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          students: path.resolve(__dirname, 'students.html'),
          courses: path.resolve(__dirname, 'courses.html'),
          finance: path.resolve(__dirname, 'finance.html'),
          results: path.resolve(__dirname, 'results.html'),
          attendance: path.resolve(__dirname, 'attendance.html'),
          library: path.resolve(__dirname, 'library.html'),
          clinical: path.resolve(__dirname, 'clinical.html'),
          reports: path.resolve(__dirname, 'reports.html'),
          settings: path.resolve(__dirname, 'settings.html'),
          messaging: path.resolve(__dirname, 'messaging.html'),
          assignments: path.resolve(__dirname, 'assignments.html'),
          certificates: path.resolve(__dirname, 'certificates.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
