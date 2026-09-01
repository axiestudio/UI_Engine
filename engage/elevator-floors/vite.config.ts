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
      name: "ElevatorFloors",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "elevator-floors.es.js" : "elevator-floors.cjs.js"),
    },
    rollupOptions: { external: ["@radix-ui/react-radio-group", "class-variance-authority", "clsx", "motion", "motion/react", "radix-ui", "react", "react-dom", "react/jsx-runtime", "tailwind-merge"] },
    cssCodeSplit: false,
  },
})
