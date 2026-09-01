import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "SidebarGsapCinema",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "sidebar-gsap-cinema.es.js" : "sidebar-gsap-cinema.cjs.js"),
    },
    rollupOptions: { external: ["@gsap/react", "class-variance-authority", "clsx", "gsap", "lucide-react", "motion", "motion/react", "react", "react-dom", "react-separator", "react-slot", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
