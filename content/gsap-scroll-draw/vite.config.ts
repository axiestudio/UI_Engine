import {
  defineConfig,
} from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import path from "node:path"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "GsapScrollDraw",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "gsap-scroll-draw.es.js" : "gsap-scroll-draw.cjs.js"),
    },
    rollupOptions: {
      external: (id) => ["react", "react-dom", "react/jsx-runtime", "motion", "motion/react", "radix-ui", "class-variance-authority", "clsx", "lucide-react", "tailwind-merge", "cmdk", "gsap"].includes(id) || id.startsWith("gsap/"),
    },
    cssCodeSplit: false,
  },
})
