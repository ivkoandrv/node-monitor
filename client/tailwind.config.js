// Import required plugins if necessary
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssRadix from "tailwindcss-radix";
// import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: ["./src/**/*.{vue,js,jsx,ts,tsx}"], // Include .vue files
  darkMode: "class",
  theme: {
    fontFamily: {
      // Define your custom fonts
      sans: ["Inter", "sans-serif"],
      mono: ["Roboto Mono", "monospace"],
    },
    extend: {
      // Extend Tailwind's default theme
      width: {
        authPageWidth: "370px",
      },
      keyframes: {
        // Define custom keyframes for animations
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        // Reference the defined keyframes for animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        gray: {
          10: "#ececec",
          20: "#ececf1",
          50: "#f7f7f8",
          100: "#ececec",
          200: "#e3e3e3",
          300: "#cdcdcd",
          400: "#999696",
          500: "#595959",
          600: "#424242",
          700: "#2f2f2f",
          800: "#212121",
          850: "#171717",
          900: "#0d0d0d",
        },
        green: {
          50: "#f1f9f7",
          100: "#def2ed",
          200: "#a6e5d6",
          300: "#6dc8b9",
          400: "#41a79d",
          500: "#10a37f",
          550: "#349072",
          600: "#126e6b",
          700: "#0a4f53",
          800: "#06373e",
          900: "#031f29",
        },
        "brand-purple": "#ab68ff",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-secondary-alt": "var(--text-secondary-alt)",
        "text-tertiary": "var(--text-tertiary)",
        "surface-primary": "var(--surface-primary)",
        "surface-primary-alt": "var(--surface-primary-alt)",
        "surface-primary-contrast": "var(--surface-primary-contrast)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-tertiary": "var(--surface-tertiary)",
        "surface-tertiary-alt": "var(--surface-tertiary-alt)",
        "border-light": "var(--border-light)",
        "border-medium": "var(--border-medium)",
        "border-medium-alt": "var(--border-medium-alt)",
        "border-heavy": "var(--gray-300)",
        "border-xheavy": "var(--gray-400",
      },
    },
  },
  plugins: [
    // Register your plugins here
    tailwindcssAnimate,
    tailwindcssRadix(),
    // typography,
  ],
};

export default tailwindConfig;
