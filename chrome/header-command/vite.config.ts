import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], outDir: "dist", entryRoot: "src" })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "HeaderCommand",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "header-command.es.js" : "header-command.cjs.js"),
    },
    rollupOptions: { external: ["react", "radix-ui", "class-variance-authority", "clsx", "lucide-react", "tailwind-merge", "cmdk", "react/jsx-runtime", "react-dom"] },
    cssCodeSplit: false,
  },
})
