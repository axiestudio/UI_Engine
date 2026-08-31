import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src", insertTypesEntry: true })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: { entry: path.resolve(__dirname, "src/index.ts"), name: "StoryScrubTimeline", formats: ["es","cjs"], fileName: (f) => (f==="es"?"story-scrub-timeline.es.js":"story-scrub-timeline.cjs.js") },
    rollupOptions: { external: ["class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "radix-ui", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
