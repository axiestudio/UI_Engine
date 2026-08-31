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
      name: "KpiStoryBand",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "kpi-story-band.es.js" : "kpi-story-band.cjs.js"),
    },
    rollupOptions: { external: ["class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "react", "react-dom", "react-use-measure", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
