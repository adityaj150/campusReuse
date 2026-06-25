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
        surface: '#eae5da',
        surfaceMuted: '#dfd8c8',
        surfaceSecondary: '#d4ccb8',
        border: '#c9c1ad',
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
