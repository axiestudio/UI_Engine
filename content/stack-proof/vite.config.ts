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
      name: "StackProof",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "stack-proof.es.js" : "stack-proof.cjs.js"),
    },
    rollupOptions: { external: ["react", "motion", "clsx", "tailwind-merge", "react/jsx-runtime", "react-dom", "motion/react"] },
    cssCodeSplit: false,
  },
})
