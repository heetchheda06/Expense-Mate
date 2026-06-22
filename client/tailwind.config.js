/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5', // Indigo
          secondary: '#06B6D4', // Cyan
          accent: '#10B981', // Emerald
          dark: '#0B0F19', // Deep Midnight Blue
          darkCard: 'rgba(17, 24, 39, 0.6)', // Glassmorphic Card Fill
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glow: '0 0 20px rgba(79, 70, 229, 0.4)',
      }
    },
  },
  plugins: [],
}
