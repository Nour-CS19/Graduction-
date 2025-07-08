module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.use) {
          rule.use.forEach((loader) => {
            if (
              loader.loader &&
              loader.loader.includes("source-map-loader")
            ) {
              loader.options = {
                filterSourceMappingUrl: (url, resourcePath) => {
                  // Exclude all files in date-fns
                  if (/node_modules[\\/]date-fns/.test(resourcePath)) {
                    return false;
                  }
                  return true;
                },
              };
            }
          });
        }
      });
      return webpackConfig;
    },
  },
};
