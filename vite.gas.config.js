import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Config สำหรับ build เพื่อใช้งานบน Google Apps Script
// รัน: npm run build:gas
// ผลลัพธ์: dist-gas/index.html (นำไปวางใน GAS project)
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist-gas',
    emptyOutDir: true,
  },
})
