import tailwindConfig from './tailwind.config.js';

export default {
  plugins: {
    'postcss-import': {}, // Ensure you have this plugin installed
    'postcss-preset-env': {}, // Ensure you have this plugin installed
    tailwindcss: tailwindConfig,
    autoprefixer: {},
  },
};
