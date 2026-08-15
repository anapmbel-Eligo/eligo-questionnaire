/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        amber: {
          50: '#FFFBF0',
          100: '#FEF3E2',
          200: '#FDE5BF',
          300: '#FDD29C',
          400: '#FCBE6B',
          500: '#F5A623',
          600: '#E8941D',
          700: '#D97757',
          800: '#B85C2F',
          900: '#92480A',
        },
      },
    },
  },
  plugins: [],
};
