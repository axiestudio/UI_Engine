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
      name: "CitationHoverCard",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "citation-hover-card.es.js" : "citation-hover-card.cjs.js"),
    },
    rollupOptions: { external: [
      "clsx",
      "lucide-react",
      "motion",
      "motion/react",
      "react",
      "react-dom",
      "react/jsx-runtime",
      "tailwind-merge",
      "@radix-ui/react-slot",
      "class-variance-authority",
      "embla-carousel-react",
      "radix-ui",
    ] },
    cssCodeSplit: false,
  },
})
