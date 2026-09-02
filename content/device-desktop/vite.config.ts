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
      name: "DeviceDesktop",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "device-desktop.es.js" : "device-desktop.cjs.js"),
    },
    rollupOptions: { external: ["react", "motion", "clsx", "lucide-react", "tailwind-merge", "react/jsx-runtime", "react-dom", "motion/react"] },
    cssCodeSplit: false,
  },
})
