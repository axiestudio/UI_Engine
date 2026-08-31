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
      name: "DndDragContainers",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "dnd-drag-containers.es.js" : "dnd-drag-containers.cjs.js"),
    },
    rollupOptions: { external: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", "@dnd-kit/modifiers", "class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
