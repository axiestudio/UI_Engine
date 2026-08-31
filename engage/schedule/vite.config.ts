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
      name: "Schedule",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "schedule.es.js" : "schedule.cjs.js"),
    },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "framer-motion", "@hugeicons/core-free-icons", "@hugeicons/react", "react-icons", "react-icons/bs", "react-icons/fa6", "@radix-ui/react-slot", "class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
