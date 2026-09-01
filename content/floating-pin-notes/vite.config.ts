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
      name: "FloatingPinNotes",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "floating-pin-notes.es.js" : "floating-pin-notes.cjs.js"),
    },
    rollupOptions: { external: ["react", "motion", "clsx", "tailwind-merge", "@floating-ui/react", "@floating-ui/react-dom"] },
    cssCodeSplit: false,
  },
})
