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
      name: "SidebarQuietRail",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "sidebar-quiet-rail.es.js" : "sidebar-quiet-rail.cjs.js"),
    },
    rollupOptions: { external: ["class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "react", "react-avatar", "react-dom", "react-separator", "react-slot", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
