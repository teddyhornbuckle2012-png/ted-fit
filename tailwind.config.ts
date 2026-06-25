import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core theme roles (used as bg-forge-orange etc. throughout components)
        'forge-orange': '#4D8EA8',      // Nordic Sky — primary buttons, active tabs
        'forge-amber': '#79A8CC',       // Bluebird Skies — secondary accent
        'forge-cream': '#D6DCE8',       // Blueberry White — page background
        'forge-teal': '#6A9AC0',        // Sky View — streak info, highlights
        'forge-dark': '#1A2E4A',        // Deep navy — text, dark surfaces
        'forge-surface': '#FFFFFF',
        'forge-text': '#1A2E4A',
        'forge-text-muted': '#849AA8',  // Coastal Grey

        // Full Dulux Blue palette — all 18 named colours
        'dulux-blueberry-white': '#D6DCE8',
        'dulux-mineral-mist': '#BFC9D5',
        'dulux-blissful-blue': '#B6C8DB',
        'dulux-quintessential-blue': '#8CA5B5',
        'dulux-coastal-grey': '#849AA8',
        'dulux-bright-skies': '#7AAFCA',
        'dulux-river-valley': '#789490',
        'dulux-nordic-sky': '#4D8EA8',
        'dulux-sky-view': '#6A9AC0',
        'dulux-first-dawn': '#A8C4DC',
        'dulux-misty-sky': '#97B4BC',
        'dulux-frosted-lake': '#AEB9BD',
        'dulux-bluebird-skies': '#79A8CC',
        'dulux-blue-babe': '#5999C4',
        'dulux-blue-lagoon': '#6589B4',
        'dulux-vast-lake': '#5978A0',
        'dulux-sea-blue': '#1A72C0',
        'dulux-stonewashed-blue': '#4D6F98',
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
