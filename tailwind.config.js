/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0d631b',
        'primary-container': '#2e7d32',
        'surface': '#ebffe7',
        'surface-low': '#d9fdd6',
        'surface-high': '#cdf2cb',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
