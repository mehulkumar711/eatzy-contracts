export default {
  plugins: {
    // FIX 1: Use the correct plugin name installed (@tailwindcss/postcss)
    '@tailwindcss/postcss': {}, 
    
    // FIX 2: We must keep these to process layers and prefixes
    'postcss-import': {},
    autoprefixer: {},
  },
}