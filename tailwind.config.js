/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        primary: {
          DEFAULT: '#176B45',
          dark: '#145638',
          soft: '#EAF4EC',
          sage: '#F3F8F3',
        },
        border: '#E4EBE5',
        text: {
          primary: '#26352B',
          secondary: '#718078',
        },
        accent: {
          gold: '#C5A45A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Telugu', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 2px 8px -2px rgba(23, 107, 69, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        card: '0 4px 16px -4px rgba(23, 107, 69, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
