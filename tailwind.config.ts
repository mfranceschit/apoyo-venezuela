import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        petroleum: {
          DEFAULT: '#1E4D5C',
          dark: '#123640',
        },
        gold: '#F2C75C',
        cream: {
          DEFAULT: '#FFFBF2',
          dim: '#F7F1E3',
        },
        ink: '#2A2622',
        terracotta: '#C75C3C',
      },
      fontFamily: {
        display: ["'Fraunces'", 'serif'],
        sans: ["'Space Grotesk'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
    },
  },
} satisfies Config;
