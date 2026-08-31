import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "FloatingFilterToolbar",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "floating-filter-toolbar.es.js" : "floating-filter-toolbar.cjs.js"),
    },
    rollupOptions: { external: ["react","react-dom","react/jsx-runtime","motion","motion/react","class-variance-authority","clsx","lucide-react","tailwind-merge","@floating-ui/react"] },
    cssCodeSplit: false,
  },
})
