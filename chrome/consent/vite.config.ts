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
      name: "Consent",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "consent.es.js" : "consent.cjs.js"),
    },
    rollupOptions: { external: ["react", "react/jsx-runtime", "motion", "radix-ui", "class-variance-authority", "clsx", "lucide-react", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
