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
        // Fhenix brand colors
        'fhenix-blue': '#00D4FF',
        'fhenix-purple': '#7B61FF',
        'spectre-dark': '#0a0a0f',
        'spectre-card': '#12121a',
        'spectre-border': '#1e1e2e',
        'matrix-green': '#00ff41',
        'neon-cyan': '#00ffff',
        'neon-pink': '#ff00ff',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'cyber': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00D4FF, 0 0 10px #00D4FF' },
          '100%': { boxShadow: '0 0 20px #00D4FF, 0 0 30px #00D4FF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'cyber-grid': `linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [],
}
