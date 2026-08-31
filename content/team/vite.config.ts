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
      name: "Team",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "team.es.js" : "team.cjs.js"),
    },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "@radix-ui/react-slot", "react-icons", "react-icons/fa", "react-icons/fa6", "class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
