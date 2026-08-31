import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json" })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Customer360",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "customer-360.es.js" : "customer-360.cjs.js"),
    },
    rollupOptions: { external: ["class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "react", "react-avatar", "react-dom", "react-slot", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
