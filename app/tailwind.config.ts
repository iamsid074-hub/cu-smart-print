import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        neon: {
          orange: "hsl(var(--neon-orange))",
          pink: "hsl(var(--neon-pink))",
          cyan: "hsl(var(--neon-cyan))",
          blue: "hsl(var(--neon-blue))",
          yellow: "hsl(var(--neon-yellow))",
        },
        glass: {
          DEFAULT: "hsl(var(--glass-bg) / 0.6)",
          heavy: "hsl(var(--glass-bg) / 0.85)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      backgroundImage: {
        "gradient-fire": "linear-gradient(135deg, hsl(var(--neon-orange)), hsl(var(--neon-pink)))",
        "gradient-ocean": "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-blue)))",
        "gradient-aurora": "linear-gradient(135deg, hsl(var(--neon-orange)), hsl(var(--neon-pink)), hsl(var(--neon-cyan)))",
        "gradient-radial-fire": "radial-gradient(circle at center, hsl(var(--neon-orange) / 0.3), transparent 70%)",
        "gradient-radial-ocean": "radial-gradient(circle at center, hsl(var(--neon-cyan) / 0.3), transparent 70%)",
      },
      boxShadow: {
        "neon-fire": "0 0 20px hsl(var(--neon-orange) / 0.4), 0 0 60px hsl(var(--neon-pink) / 0.15)",
        "neon-ocean": "0 0 20px hsl(var(--neon-cyan) / 0.4), 0 0 60px hsl(var(--neon-blue) / 0.15)",
        glass: "0 8px 32px hsl(240 20% 2% / 0.4), inset 0 1px 0 hsl(240 20% 100% / 0.05)",
        "card-hover": "0 20px 60px hsl(240 20% 2% / 0.6), 0 0 40px hsl(var(--neon-orange) / 0.15)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(25 100% 60% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(25 100% 60% / 0.6), 0 0 60px hsl(330 100% 65% / 0.3)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        float: "float 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
