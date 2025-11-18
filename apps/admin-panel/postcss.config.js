export default {
  plugins: {
    //
    // FIX: Use the correct PostCSS adapter plugin name.
    // This resolves the "plugin has moved" error.
    //
    '@tailwindcss/postcss': {}, 
    
    // Plugins needed for CSS layers and prefixing
    'postcss-import': {},
    autoprefixer: {},
  },
}