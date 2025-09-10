import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        
        /* 9-Tier Step Tracking Progression System */
        "tier-1-paisa": {
          DEFAULT: "hsl(var(--tier-1-paisa))",
          light: "hsl(var(--tier-1-paisa-light))",
          foreground: "hsl(var(--tier-1-paisa-foreground))",
        },
        "tier-2-coin": {
          DEFAULT: "hsl(var(--tier-2-coin))",
          light: "hsl(var(--tier-2-coin-light))",
          foreground: "hsl(var(--tier-2-coin-foreground))",
        },
        "tier-3-token": {
          DEFAULT: "hsl(var(--tier-3-token))",
          light: "hsl(var(--tier-3-token-light))",
          foreground: "hsl(var(--tier-3-token-foreground))",
        },
        "tier-4-gem": {
          DEFAULT: "hsl(var(--tier-4-gem))",
          light: "hsl(var(--tier-4-gem-light))",
          foreground: "hsl(var(--tier-4-gem-foreground))",
        },
        "tier-5-diamond": {
          DEFAULT: "hsl(var(--tier-5-diamond))",
          light: "hsl(var(--tier-5-diamond-light))",
          foreground: "hsl(var(--tier-5-diamond-foreground))",
        },
        "tier-6-crown": {
          DEFAULT: "hsl(var(--tier-6-crown))",
          light: "hsl(var(--tier-6-crown-light))",
          foreground: "hsl(var(--tier-6-crown-foreground))",
        },
        "tier-7-emperor": {
          DEFAULT: "hsl(var(--tier-7-emperor))",
          light: "hsl(var(--tier-7-emperor-light))",
          foreground: "hsl(var(--tier-7-emperor-foreground))",
        },
        "tier-8-legend": {
          DEFAULT: "hsl(var(--tier-8-legend))",
          light: "hsl(var(--tier-8-legend-light))",
          foreground: "hsl(var(--tier-8-legend-foreground))",
        },
        "tier-9-immortal": {
          DEFAULT: "hsl(var(--tier-9-immortal))",
          light: "hsl(var(--tier-9-immortal-light))",
          foreground: "hsl(var(--tier-9-immortal-foreground))",
        },
        
        /* Legacy Wellness Colors (for backwards compatibility) */
        "tier-gold": {
          DEFAULT: "hsl(var(--tier-gold))",
          foreground: "hsl(var(--tier-gold-foreground))",
        },
        "tier-amethyst": {
          DEFAULT: "hsl(var(--tier-amethyst))",
          foreground: "hsl(var(--tier-amethyst-foreground))",
        },
        "tier-sage": {
          DEFAULT: "hsl(var(--tier-sage))",
          foreground: "hsl(var(--tier-sage-foreground))",
        },
        "tier-rose": {
          DEFAULT: "hsl(var(--tier-rose))",
          foreground: "hsl(var(--tier-rose-foreground))",
        },
        
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 8px 25px -8px hsl(270 50% 65% / 0.3)',
        'glow': '0 0 30px hsl(270 50% 65% / 0.25)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
