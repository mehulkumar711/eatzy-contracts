// apps/admin-panel/postcss.config.js

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    // FIX 1: Use the correct plugin name for Tailwind CSS v4
    '@tailwindcss/postcss': {}, 
    
    // FIX 2: Needed to resolve imports like Ant Design's reset and Tailwind's directives
    'postcss-import': {},
    
    autoprefixer: {},
  },
}