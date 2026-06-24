import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "accent-green": "#00e5a0",
        "accent-blue": "#00b4d8",
        "bg-dark": "#0a0f1a",
        "card-dark": "#111827",
        "border-dark": "#1f2937",
      },
    },
  },
  plugins: [],
};

export default config;
