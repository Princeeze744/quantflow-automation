/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#00F5FF',
          violet: '#7C5CFC',
          space: '#0B0F1E',
          obsidian: '#141929',
          slate: '#1C2236',
          profit: '#00E676',
          loss: '#FF1744',
          silver: '#A0AEC0',
          text: '#E8ECF4',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
