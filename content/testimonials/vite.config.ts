import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src", insertTypesEntry: true }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "{pkg.capitalize()}",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "testimonials.es.js" : "testimonials.cjs.js"),
    },
    rollupOptions: { external: ["react",
        "embla-carousel-react", "react-dom", "react/jsx-runtime", "class-variance-authority", "clsx",
        "react-use-measure", "lucide-react", "motion", "motion/react", "tailwind-merge", "@radix-ui/react-avatar", "@radix-ui/react-slot", "@radix-ui/react-label", "@radix-ui/react-select", "@radix-ui/react-accordion"] },
    cssCodeSplit: false,
  },
})
