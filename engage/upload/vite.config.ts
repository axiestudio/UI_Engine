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
      name: "Upload",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "upload.es.js" : "upload.cjs.js"),
    },
    rollupOptions: { external: ["@radix-ui/react-slot", "class-variance-authority", "clsx", "fa", "lucide-react", "motion", "motion/react", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
