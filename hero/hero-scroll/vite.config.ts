import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "HeroScroll",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "hero-scroll.es.js" : "hero-scroll.cjs.js"),
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "tailwind-merge"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
    cssCodeSplit: false,
  },
})
