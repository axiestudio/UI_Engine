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
      name: "Programme",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "house-programme.es.js" : "house-programme.cjs.js"),
    },
    rollupOptions: { external: ["clsx", "motion", "motion/react", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
