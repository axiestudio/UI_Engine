/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        brand: { DEFAULT: "hsl(var(--brand))", foreground: "hsl(var(--brand-foreground))" },
        antiyellow: "hsl(var(--anti-yellow))",
        anticream: "hsl(var(--anti-cream))",
        ink: "hsl(var(--foreground))",
      },
      borderRadius: { lg: "var(--radius)", md: "var(--radius)", sm: "var(--radius)" },
      fontFamily: { sans: ["var(--font-sans)"], display: ["var(--font-display)"], mono: ["var(--font-mono)"] },
      fontWeight: { medium: "600", semibold: "700", bold: "800", black: "900" },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }],
        sm: ["13px", { lineHeight: "18px", letterSpacing: "0.04em", fontWeight: "700" }],
        base: ["15px", { lineHeight: "22px", letterSpacing: "-0.01em", fontWeight: "500" }],
        lg: ["18px", { lineHeight: "26px", letterSpacing: "-0.02em", fontWeight: "500" }],
        xl: ["24px", { lineHeight: "30px", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
}
