export default {
  plugins: {
    // FIX: Use the correct plugin name installed (@tailwindcss/postcss)
    '@tailwindcss/postcss': {}, 
    
    // Keep the other necessary plugins
    'postcss-import': {},
    autoprefixer: {},
  },
}