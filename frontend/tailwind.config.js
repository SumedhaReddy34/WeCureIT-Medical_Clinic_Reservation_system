/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'below-1390': '1390px', // Define a custom breakpoint at 1390px
      },
    },
  },
  plugins: [],
}

