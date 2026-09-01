import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src" })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ModelMonitor",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "model-monitor.es.js" : "model-monitor.cjs.js"),
    },
    rollupOptions: { external: ["@radix-ui/react-slot", "@visx/curve", "@visx/event", "@visx/grid", "@visx/responsive", "@visx/scale", "@visx/shape", "class-variance-authority", "clsx", "d3-array", "d3-shape", "lucide-react", "motion", "motion/react", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
