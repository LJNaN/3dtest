import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  server: {
    host: "0.0.0.0",
    port: 5174,
    open: true,
    // 代理
    proxy: {
      "/api": {
        target: "http://101.200.140.188:8090/WebService.asmx",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
