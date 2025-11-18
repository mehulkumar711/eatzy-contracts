export default {
  plugins: {
    // FIX: Use the correct plugin name for Tailwind v4 compatibility
    '@tailwindcss/postcss': {}, 
    // We remove the direct 'tailwindcss: {}' entry
    'postcss-import': {},
    autoprefixer: {},
  },
}