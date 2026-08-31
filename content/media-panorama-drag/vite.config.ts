import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src" })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: { entry: path.resolve(__dirname, "src/index.ts"), name: "MediaPanoramaDrag", formats: ["es","cjs"], fileName: (f) => (f==="es"?"media-panorama-drag.es.js":"media-panorama-drag.cjs.js") },
    rollupOptions: { external: ["class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "radix-ui", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
