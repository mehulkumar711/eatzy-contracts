// apps/admin-panel/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: { extend: {} },
  plugins: [],
  
  // PRODUCTION FIX: Use a unique prefix to prevent conflict with Ant Design classes (e.g., 'tw-shadow', 'tw-p-4')
  prefix: 'tw-',
}