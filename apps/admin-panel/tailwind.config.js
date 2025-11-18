/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Critical for Ant Design compatibility
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // Maps Tailwind utility classes to Ant Design CSS variables
      colors: {
        'primary': 'var(--ant-color-primary)',
        'primary-hover': 'var(--ant-color-primary-hover)',
        'error': 'var(--ant-color-error)',
      },
    },
  },
  plugins: [],
}