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
      name: "StorageRingMeter",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "storage-ring-meter.es.js" : "storage-ring-meter.cjs.js"),
    },
    rollupOptions: { external: ["@visx/group", "@visx/responsive", "@visx/shape", "clsx", "motion", "motion/react", "react", "react-dom", "react/jsx-runtime", "react-use-measure", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
