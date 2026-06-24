import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'forge-orange': '#E8873A',
        'forge-amber': '#F5A623',
        'forge-cream': '#FFF3DC',
        'forge-teal': '#5BBFBF',
        'forge-dark': '#1A1A2E',
        'forge-surface': '#FFFFFF',
        'forge-text': '#1A1A2E',
        'forge-text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-soft': 'bounce 1s ease-in-out 3',
      }
    },
  },
  plugins: [],
} satisfies Config
