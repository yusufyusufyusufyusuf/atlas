/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'hsl(var(--ink))',
        muted: 'hsl(var(--muted))',
        line: 'hsl(var(--line))',
        canvas: 'hsl(var(--canvas))',
        'canvas-alt': 'hsl(var(--canvas-alt))',
        primary: 'hsl(var(--primary))',
        'primary-fg': 'hsl(var(--primary-fg))',
        danger: 'hsl(var(--danger))',
        warning: 'hsl(var(--warning))',
        success: 'hsl(var(--success))',
        auri: 'hsl(var(--auri))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
