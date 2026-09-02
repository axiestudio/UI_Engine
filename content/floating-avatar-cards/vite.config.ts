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
      name: "FloatingAvatarCards",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "floating-avatar-cards.es.js" : "floating-avatar-cards.cjs.js"),
    },
    rollupOptions: { external: ["react", "motion", "radix-ui", "class-variance-authority", "clsx", "tailwind-merge", "@floating-ui/react", "react/jsx-runtime", "react-dom", "motion/react"] },
    cssCodeSplit: false,
  },
})
