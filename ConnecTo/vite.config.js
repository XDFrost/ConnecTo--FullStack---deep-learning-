import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import vitePluginString from "vite-plugin-string"

export default defineConfig({
  plugins: [
    react(),
    vitePluginString()
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
