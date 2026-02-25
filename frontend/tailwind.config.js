module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        forest: 'rgb(var(--color-forest) / <alpha-value>)',
        lime: 'rgb(var(--color-lime) / <alpha-value>)',
        earth: 'rgb(var(--color-earth) / <alpha-value>)',
        terracotta: 'rgb(var(--color-terracotta) / <alpha-value>)'
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