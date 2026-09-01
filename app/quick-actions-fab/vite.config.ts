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
      name: "QuickActionsFab",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "quick-actions-fab.es.js" : "quick-actions-fab.cjs.js"),
    },
    rollupOptions: { external: [
      "class-variance-authority",
      "clsx",
      "lucide-react",
      "motion",
      "motion/react",
      "react",
      "react-dom",
      "react/jsx-runtime",
      "tailwind-merge",
      "@radix-ui/react-slot",
      "@floating-ui/react",
      "@floating-ui/dom",
      "@floating-ui/react-dom",
      "@floating-ui/utils",
      "sonner",
    ] },
    cssCodeSplit: false,
  },
})
