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
      name: "GsapSplitBand",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "gsap-split-band.es.js" : "gsap-split-band.cjs.js"),
    },
    rollupOptions: { external: (id) => ["react","react-dom","react/jsx-runtime","motion","motion/react","class-variance-authority","clsx","lucide-react","tailwind-merge","gsap"].includes(id) || id.startsWith("gsap/") },
    cssCodeSplit: false,
  },
})
