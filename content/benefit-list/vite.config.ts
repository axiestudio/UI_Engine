import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src" })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: { entry: path.resolve(__dirname, "src/index.ts"), name: "BenefitList", formats: ["es","cjs"], fileName: (f) => (f==="es"?"benefit-list.es.js":"benefit-list.cjs.js") },
    rollupOptions: { external: ["react", "motion", "radix-ui", "class-variance-authority", "clsx", "lucide-react", "tailwind-merge", "react/jsx-runtime", "react-dom", "motion/react"] },
    cssCodeSplit: false,
  },
})
