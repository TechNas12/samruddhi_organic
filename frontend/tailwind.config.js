module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F1E8',
        forest: '#4A7C59',
        lime: '#7FB539',
        earth: '#2D342C',
        terracotta: '#D87D4A'
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif']
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem'
      }
    }
  },
  plugins: []
};