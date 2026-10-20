/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        typewriter: ['"Courier Prime"', '"Courier New"', 'Courier', 'monospace'],
        military: ['"Special Elite"', '"Courier New"', 'monospace'],
      },
      colors: {
        wood: {
          dark: '#150902',
          base: '#2b1406',
          light: '#4a2810',
          accent: '#7a3e1d',
        },
        brass: {
          light: '#e6c387',
          base: '#c59b27',
          dark: '#785b12',
        },
        chassis: {
          dark: '#0e0f11',
          base: '#1b1d20',
          light: '#282b30',
        }
      }
    },
  },
  plugins: [],
}
