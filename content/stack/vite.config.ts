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
      name: "Stack",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "stack.es.js" : "stack.cjs.js"),
    },
    rollupOptions: { external: ["react", "react/jsx-runtime", "motion", "clsx", "lucide-react", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
