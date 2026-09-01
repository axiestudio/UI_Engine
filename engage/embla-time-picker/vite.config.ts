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
      name: "EmblaTimePicker",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "embla-time-picker.es.js" : "embla-time-picker.cjs.js"),
    },
    rollupOptions: { external: ["class-variance-authority", "clsx", "embla-carousel-react", "lucide-react", "motion", "motion/react", "radix-ui", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
