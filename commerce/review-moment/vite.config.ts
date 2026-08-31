import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src" })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ReviewMoment",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "review-moment.es.js" : "review-moment.cjs.js"),
    },
    rollupOptions: { external: ["class-variance-authority", "clsx", "react-icons/fa6", "react-icons/lu", "lucide-react", "motion", "motion/react", "react", "react-dom", "@radix-ui/react-slot", "react/jsx-runtime", "tailwind-merge", "react-icons/tb"] },
    cssCodeSplit: false,
  },
})
