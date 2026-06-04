module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        text: '#4b5563',
        textHeading: '#111827',
        surface: '#ffffff',
        surfaceMuted: '#f7faf9',
        surfaceSecondary: '#edf7f2',
        border: '#d7e2dc',
        accent: '#047857',
        accentSoft: '#dff5e8',
        accentBorder: '#8bd6ad',
        warning: '#f59e0b',
        darkText: '#d1d5db',
        darkSurface: '#121821',
        darkSurfaceMuted: '#1d2733',
        darkBorder: '#334155',
        darkAccent: '#34d399',
        darkAccentSoft: '#123627',
      },
      boxShadow: {
        soft: '0 12px 30px -20px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
}
