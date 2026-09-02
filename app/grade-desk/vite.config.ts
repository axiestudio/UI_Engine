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
      name: "GradeDesk",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "grade-desk.es.js" : "grade-desk.cjs.js"),
    },
    rollupOptions: { external: ["class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
