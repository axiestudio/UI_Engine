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
      name: "SidebarSolid",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "sidebar-solid.es.js" : "sidebar-solid.cjs.js"),
    },
    rollupOptions: {
      external: [
        "@floating-ui/react",
        "animejs",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "motion",
        "motion/react",
        "radix-ui",
        "react",
        "react-dom",
        "react/jsx-runtime",
        "tailwind-merge",
        "@radix-ui/react-slot",
        "@radix-ui/react-select",
        "@radix-ui/react-avatar",
        "@radix-ui/react-separator",
      ],
    },
    cssCodeSplit: false,
  },
})
