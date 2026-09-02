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
      name: "FeedbackWidget",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "feedback-widget.es.js" : "feedback-widget.cjs.js"),
    },
    rollupOptions: { external: ["react", "motion", "clsx", "lucide-react", "tailwind-merge", "react/jsx-runtime", "react-dom", "motion/react"] },
    cssCodeSplit: false,
  },
})
