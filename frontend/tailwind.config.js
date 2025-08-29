/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Material Design Dark Theme colors
        primary: {
          DEFAULT: '#667eea',
          dark: '#5a6ecc',
          light: '#8c9ef0'
        },
        secondary: {
          DEFAULT: '#764ba2',
          dark: '#63408a',
          light: '#8a5db8'
        },
        surface: '#121212',
        background: '#121212',
        error: '#CF6679',
        onPrimary: '#ffffff',
        onSecondary: '#ffffff',
        onBackground: '#e0e0e0',
        onSurface: '#e0e0e0',
        onError: '#000000',
        elevation: {
          1: '#1d1d1d',
          2: '#222222',
          3: '#252525',
          4: '#272727',
          6: '#2c2c2c',
          8: '#2e2e2e',
          12: '#333333',
          16: '#353535',
          24: '#383838'
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'md-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'lg-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
        'xl-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
