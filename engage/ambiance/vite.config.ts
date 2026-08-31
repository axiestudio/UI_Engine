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
      name: "Ambiance",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "ambiance.es.js" : "ambiance.cjs.js"),
    },
    rollupOptions: {
      external: [
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "motion",
        "motion/react",
        "react",
        "react-dom",
        "react/jsx-runtime",
        "tailwind-merge",
        "react-icons",
        "react-icons/fa6",
      ],
    },
    cssCodeSplit: false,
  },
})
