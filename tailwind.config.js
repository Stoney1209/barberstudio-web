/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'ui-sans-serif'],
        mono: ['DM Mono', 'ui-monospace'],
      },
      colors: {
        primary: '#0A0A0A',
        surface: {
          DEFAULT: '#141414',
          2: '#1E1E1E',
          'container-lowest': '#0f0f0f',
          'container-low': '#1a1a1a',
          'container-high': '#202020',
          'container-highest': '#242424',
        },
        gold: {
          DEFAULT: '#C9A84C',
          muted: '#8A6F2E',
        },
        smoke: '#F5F5F0',
      },
      boxShadow: {
        'soft-dk': '0 0 64px rgba(0,0,0,.4)',
      },
    },
  },
  plugins: [],
}
