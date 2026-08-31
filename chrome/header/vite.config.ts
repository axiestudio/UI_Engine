import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      tsconfigPath: "./tsconfig.app.json",
      entryRoot: "src",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Header",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "header.es.js" : "header.cjs.js"),
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@radix-ui/react-collapsible",
        "@radix-ui/react-dialog",
        "@radix-ui/react-navigation-menu",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "clsx",
        "cmdk",
        "lucide-react",
        "tailwind-merge",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    cssCodeSplit: false,
  },
})
