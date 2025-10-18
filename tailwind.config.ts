import type { Config } from "tailwindcss";

// Tailwind CSS v4 uses CSS-first configuration
// Most config is now in globals.css using @theme
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
        adigiana: ['var(--font-adigiana)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;