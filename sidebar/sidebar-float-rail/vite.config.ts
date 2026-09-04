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
      name: "SidebarFloatRail",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "sidebar-float-rail.es.js" : "sidebar-float-rail.cjs.js"),
    },
    rollupOptions: { external: ["@floating-ui/react", "class-variance-authority", "clsx", "gsap", "lucide-react", "motion", "motion/react", "react", "react-dom", "react-separator", "react-slot", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
