// Path: apps/admin-panel/postcss.config.js

/**
 * @type {import('postcss-load-config').Config}
 * Standard configuration for Tailwind CSS in a PostCSS pipeline.
 */
export default {
  plugins: {
    // FIX: Use the standard plugin name 'tailwindcss' for correct resolution.
    // The previously attempted explicit name might have been incorrect for the setup.
    tailwindcss: {}, 
    autoprefixer: {},
  },
}