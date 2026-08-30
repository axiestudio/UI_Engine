import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], outDir: "dist", entryRoot: "src", insertTypesEntry: true })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "VideoDemo",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "video-demo.es.js" : "video-demo.cjs.js"),
    },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "radix-ui", "cmdk", "motion", "motion/react", "class-variance-authority", "clsx", "tailwind-merge", "lucide-react"] },
    cssCodeSplit: false,
  },
})
