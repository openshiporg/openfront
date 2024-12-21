module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      '@fullhuman/postcss-purgecss': {
        content: [
          // Dashboard paths
          './pages/**/*.{js,ts,jsx,tsx}',
          './components/**/*.{js,ts,jsx,tsx}',
          './app/**/*.{js,ts,jsx,tsx}',
          './keystone/**/**/**/**/**/*.{js,ts,jsx,tsx}',
          // Storefront paths
          './app/(storefront)/**/*.{js,ts,jsx,tsx}',
          './pages/(storefront)/**/*.{js,ts,jsx,tsx}',
          './storefront/lib/**/*.{js,ts,jsx,tsx}',
          './storefront/modules/**/*.{js,ts,jsx,tsx}',
          './node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}',
        ],
        safelist: {
          standard: ['html', 'body'],
          deep: [/^dark:/, /^light:/],
          greedy: [/^prose/, /^aspect-/]
        },
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      }
    } : {})
  }
};
