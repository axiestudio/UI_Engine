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
      name: "Gallery",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "gallery.es.js" : "gallery.cjs.js"),
    },
    rollupOptions: { external: ["react", "react-dom", "motion", "clsx", "lucide-react", "tailwind-merge", "react/jsx-runtime", "motion/react"] },
    cssCodeSplit: false,
  },
})
