// apps/admin-panel/postcss.config.js

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    // FIX: Use the correct plugin name installed 
    '@tailwindcss/postcss': {}, 
    
    // These are required for correct CSS processing
    'postcss-import': {},
    autoprefixer: {},
  },
}