import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      tsconfigPath: "./tsconfig.app.json",
      entryRoot: "src",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Header",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "header.es.js" : "header.cjs.js"),
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "motion", "motion/react", "radix-ui", "class-variance-authority", "clsx", "lucide-react", "tailwind-merge", "cmdk"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    cssCodeSplit: false,
  },
})
