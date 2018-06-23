module.exports = {
  assetsDir: "static",

  configureWebpack: {
    entry: {
      "pdf.worker": ["pdfjs-dist/build/pdf.worker.entry"]
    }
  },

  pluginOptions: {
    lintStyleOnBuild: true,
    stylelint: {}
  }
};
