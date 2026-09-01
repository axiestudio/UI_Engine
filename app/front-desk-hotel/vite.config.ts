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
      name: "FrontDeskHotel",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "front-desk-hotel.es.js" : "front-desk-hotel.cjs.js"),
    },
    rollupOptions: { external: ["@radix-ui/react-checkbox", "class-variance-authority", "clsx", "lucide-react", "motion", "motion/react", "react", "react-dom", "react-slot", "radix-ui", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
