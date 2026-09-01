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
      name: "AiAnswerToolbar",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "ai-answer-toolbar.es.js" : "ai-answer-toolbar.cjs.js"),
    },
    rollupOptions: { external: [
      "clsx",
      "lucide-react",
      "motion",
      "motion/react",
      "react",
      "react-dom",
      "react/jsx-runtime",
      "tailwind-merge",
      "ai",
      "streamdown",
      "@radix-ui/react-slot",
      "class-variance-authority",
      "radix-ui",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-separator",
    ] },
    cssCodeSplit: false,
  },
})
