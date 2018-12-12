const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  assetsDir: 'static',
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/assets/variables.scss";`,
      },
    },
  },
  configureWebpack: {
    entry: {
      'pdf.worker': ['pdfjs-dist/build/pdf.worker.entry'],
    },
  },
  chainWebpack: config => {
    const patterns = [
      [
        {
          from: path.resolve(__dirname, './demo-files'),
          to: 'static',
          ignore: ['.*'],
        },
      ],
    ];
    config.plugin('copy-webpack-plugin').use(CopyWebpackPlugin, patterns);
  },
  pluginOptions: {
    lintStyleOnBuild: true,
    stylelint: {},
  },
};
