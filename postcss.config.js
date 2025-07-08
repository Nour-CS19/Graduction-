module.exports = {
  plugins: [
    require('tailwindcss'),
    // Optionally, if you need the dedicated Tailwind PostCSS plugin:
    // require('@tailwindcss/postcss')(),
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production'
      ? [require('cssnano')({ preset: 'default' })]
      : []),
  ],
};
