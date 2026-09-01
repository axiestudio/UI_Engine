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
      name: "FloatingNavPreview",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "floating-nav-preview.es.js" : "floating-nav-preview.cjs.js"),
    },
    rollupOptions: { external: ["react", "motion", "clsx", "lucide-react", "tailwind-merge", "@floating-ui/react"] },
    cssCodeSplit: false,
  },
})
