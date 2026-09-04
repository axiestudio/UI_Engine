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
      name: "SidebarGooeyFlow",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "sidebar-gooey-flow.es.js" : "sidebar-gooey-flow.cjs.js"),
    },
    rollupOptions: { external: ["animejs", "class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "react", "react-dom", "react-separator", "react-slot", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
