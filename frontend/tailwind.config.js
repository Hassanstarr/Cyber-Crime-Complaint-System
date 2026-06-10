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
        primary: {
          DEFAULT: '#1B3A6B',
          light: '#2E5BAE',
        },
        accent: {
          DEFAULT: '#E63946',
          soft: '#FFF0F1',
        },
        success: '#2D6A4F',
        warning: '#F4A261',
        neutral: {
          50: '#FFFFFF',
          100: '#F4F6FB',
          800: '#1A2535',
          900: '#0F1923',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)',
        elevated: '0 8px 32px rgba(27,58,107,0.12)',
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
      }
    },
  },
  plugins: [],
}
