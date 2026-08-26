/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      fontWeight: {
        medium: "600",
        semibold: "700",
        bold: "800",
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }],
        sm: ["13.5px", { lineHeight: "18px", letterSpacing: "-0.01em", fontWeight: "600" }],
        base: ["15px", { lineHeight: "22px", letterSpacing: "-0.018em", fontWeight: "500" }],
        lg: ["17px", { lineHeight: "26px", letterSpacing: "-0.022em", fontWeight: "600" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "-0.025em", fontWeight: "700" }],
        "2xl": ["26px", { lineHeight: "30px", letterSpacing: "-0.03em", fontWeight: "700" }],
        "3xl": ["32px", { lineHeight: "34px", letterSpacing: "-0.035em", fontWeight: "800" }],
        "4xl": ["42px", { lineHeight: "42px", letterSpacing: "-0.04em", fontWeight: "800" }],
        "5xl": ["56px", { lineHeight: "54px", letterSpacing: "-0.045em", fontWeight: "800" }],
      },
      keyframes: {
        "collapsible-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-collapsible-content-height)", opacity: "1" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
      },
      animation: {
        "collapsible-down": "collapsible-down 0.24s cubic-bezier(0.16,1,0.3,1)",
        "collapsible-up": "collapsible-up 0.18s ease-out",
      },
    },
  },
  plugins: [],
}
