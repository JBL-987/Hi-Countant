// vite.config.js
import react from "file:///mnt/d/Documents/Code/Icp-Hackathon/Hi-Countant/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///mnt/d/Documents/Code/Icp-Hackathon/Hi-Countant/node_modules/vite/dist/node/index.js";
import { fileURLToPath, URL } from "url";
import environment from "file:///mnt/d/Documents/Code/Icp-Hackathon/Hi-Countant/node_modules/vite-plugin-environment/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///mnt/d/Documents/Code/Icp-Hackathon/Hi-Countant/frontend/vite.config.js";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [react(), environment("all", { prefix: "CANISTER_" }), environment("all", { prefix: "DFX_" })],
  envDir: "../",
  define: {
    "process.env": process.env
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../src/declarations", __vite_injected_original_import_meta_url))
      }
    ]
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true
      }
    },
    host: "127.0.0.1"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2QvRG9jdW1lbnRzL0NvZGUvSWNwLUhhY2thdGhvbi9IaS1Db3VudGFudC9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL21udC9kL0RvY3VtZW50cy9Db2RlL0ljcC1IYWNrYXRob24vSGktQ291bnRhbnQvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21udC9kL0RvY3VtZW50cy9Db2RlL0ljcC1IYWNrYXRob24vSGktQ291bnRhbnQvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAndXJsJztcclxuaW1wb3J0IGVudmlyb25tZW50IGZyb20gJ3ZpdGUtcGx1Z2luLWVudmlyb25tZW50JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogJy4vJyxcclxuICBwbHVnaW5zOiBbcmVhY3QoKSwgZW52aXJvbm1lbnQoJ2FsbCcsIHsgcHJlZml4OiAnQ0FOSVNURVJfJyB9KSwgZW52aXJvbm1lbnQoJ2FsbCcsIHsgcHJlZml4OiAnREZYXycgfSldLFxyXG4gIGVudkRpcjogJy4uLycsXHJcbiAgZGVmaW5lOiB7XHJcbiAgICAncHJvY2Vzcy5lbnYnOiBwcm9jZXNzLmVudlxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICBkZWZpbmU6IHtcclxuICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogJ2RlY2xhcmF0aW9ucycsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vc3JjL2RlY2xhcmF0aW9ucycsIGltcG9ydC5tZXRhLnVybCkpXHJcbiAgICAgIH1cclxuICAgIF1cclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTo0OTQzJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhvc3Q6ICcxMjcuMC4wLjEnXHJcbiAgfVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwVixPQUFPLFdBQVc7QUFDNVcsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUFlLFdBQVc7QUFDbkMsT0FBTyxpQkFBaUI7QUFIZ00sSUFBTSwyQ0FBMkM7QUFLelEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLE9BQU8sRUFBRSxRQUFRLFlBQVksQ0FBQyxHQUFHLFlBQVksT0FBTyxFQUFFLFFBQVEsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUN0RyxRQUFRO0FBQUEsRUFDUixRQUFRO0FBQUEsSUFDTixlQUFlLFFBQVE7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osZ0JBQWdCO0FBQUEsTUFDZCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sYUFBYSxjQUFjLElBQUksSUFBSSx1QkFBdUIsd0NBQWUsQ0FBQztBQUFBLE1BQzVFO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
