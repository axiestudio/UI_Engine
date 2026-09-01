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
      name: "GsapCounterStrip",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "gsap-counter-strip.es.js" : "gsap-counter-strip.cjs.js"),
    },
    rollupOptions: { external: (id) => ["react-dom", "react/jsx-runtime", "motion/react", "class-variance-authority", "lucide-react", "gsap"].includes(id) || id.startsWith("gsap/") || id.startsWith("gsap/") },
    cssCodeSplit: false,
  },
})
