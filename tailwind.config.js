module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-app)',
        surface: 'var(--bg-card)',
        header: 'var(--bg-header)',
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        border: 'var(--border-main)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
      }
    },
  },
  plugins: [],
}
