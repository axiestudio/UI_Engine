import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      tsconfigPath: "./tsconfig.app.json",
      entryRoot: "src",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "VisitUs",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "visit-us.es.js" : "visit-us.cjs.js"),
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "motion",
        "motion/react",
        "react-icons/fa6",
        "tailwind-merge",
      ],
    },
    cssCodeSplit: false,
  },
})
