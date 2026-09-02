import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src" })],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // CJS-only use-sync-external-store (pulled in by react-redux via recharts)
      // calls require("react") — broken in ESM browser bundles. Alias to React's
      // native shim so the ESM graph stays clean.
      { find: /^use-sync-external-store(\/.*)?$/, replacement: path.resolve(__dirname, "src/lib/use-sync-external-store.ts") },
    ],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "PrintDesk",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "print-desk.es.js" : "print-desk.cjs.js"),
    },
    rollupOptions: { external: ["@visx/curve", "@visx/event", "@visx/grid", "@visx/responsive", "@visx/scale", "@visx/shape", "class-variance-authority", "clsx", "d3-array", "lucide-react", "motion", "motion/react", "radix-ui", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
