const {nextui} = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */


module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        wiggle: 'wiggle 4.5s ease-in-out infinite',
        // Add any other animations you need here
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'slate-950': "#020617",
        'slate-900': "#0f172a",
        'pink-800': "#9d174d",
        'heading':'#f75023',
      },
      fontFamily: {
        NerkoOne: ["Nerko One", 'cursive'],
        SUSE: ["SUSE",'sans-serif'],
        Roboto: ["Roboto",'sans-serif'],
      },
    },

  },
  darkMode: "class",
  plugins: [nextui()],
};
