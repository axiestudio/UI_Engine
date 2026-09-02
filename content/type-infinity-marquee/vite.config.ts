import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src" })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: { entry: path.resolve(__dirname, "src/index.ts"), name: "TypeInfinityMarquee", formats: ["es","cjs"], fileName: (f) => (f==="es"?"type-infinity-marquee.es.js":"type-infinity-marquee.cjs.js") },
    rollupOptions: { external: ["react", "motion", "radix-ui", "class-variance-authority", "clsx", "tailwind-merge", "react-use-measure", "react/jsx-runtime", "react-dom", "motion/react"] },
    cssCodeSplit: false,
  },
})
