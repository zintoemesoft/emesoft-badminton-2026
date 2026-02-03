/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00f2ff",
        accent: "#ccff00",
        "bg-dark": "#0a0e17",
      },
      fontFamily: {
        outfit: ['"Quicksand"', 'sans-serif'],
        orbitron: ['"Orbitron"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
