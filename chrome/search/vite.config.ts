import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], outDir: "dist", entryRoot: "src" })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Search",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "search.es.js" : "search.cjs.js"),
    },
    rollupOptions: { external: ["react", "motion", "radix-ui", "class-variance-authority", "clsx", "lucide-react", "tailwind-merge", "cmdk", "react/jsx-runtime", "react-dom", "motion/react"] },
    cssCodeSplit: false,
  },
})
