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
      name: "RevealImageMask",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "reveal-image-mask.es.js" : "reveal-image-mask.cjs.js"),
    },
    rollupOptions: { external: ["class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "radix-ui", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
