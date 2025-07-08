// config-overrides.js
module.exports = function override(config, env) {
  // Locate the rule(s) using source-map-loader and exclude uuid from it.
  config.module.rules.forEach(rule => {
    if (rule.use) {
      rule.use.forEach(u => {
        if (u.loader && u.loader.includes('source-map-loader')) {
          // Exclude uuid package from source-map-loader processing
          u.options = u.options || {};
          u.options.filterSourceMappingUrl = (url) => {
            return !url.includes('node_modules/uuid');
          }
        }
      });
    }
  });
  return config;
};
