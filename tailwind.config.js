/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'primary-blue': '#3B82F6',
        'primary-purple': '#8B5CF6',
        'gradient-start': '#3B82F6',
        'gradient-end': '#8B5CF6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        'gradient-card': 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      }
    },
  },
  plugins: [],
}