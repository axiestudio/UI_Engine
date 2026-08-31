import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ["src"], tsconfigPath: "./tsconfig.app.json", entryRoot: "src" }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "{pkg.capitalize()}",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "faq.es.js" : "faq.cjs.js"),
    },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "tailwind-merge", "@radix-ui/react-accordion", "react-icons", "@radix-ui/react-label", "@radix-ui/react-select", "@radix-ui/react-avatar", "react-icons/io5", "react-icons/fi"] },
    cssCodeSplit: false,
  },
})
