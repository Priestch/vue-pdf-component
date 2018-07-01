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

  pluginOptions: {
    lintStyleOnBuild: true,
    stylelint: {},
  },
};
