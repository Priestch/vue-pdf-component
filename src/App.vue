<template>
  <div id="app">
    <pdf-viewer :pdf-data="pdfData"></pdf-viewer>
  </div>
</template>

<script>
import PDFViewer from './components/PDFViewer';

export default {
  name: 'App',
  components: {
    pdfViewer: PDFViewer,
  },
  data() {
    return {
      pdfData: '/static/compressed.tracemonkey-pldi-09.pdf',
    };
  },
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
}

body {
  margin: 0;
}

* {
  padding: 0;
  margin: 0;
}
</style>

<style lang="scss" scoped>
#app {
  height: 100%;
}

.pdf-viewer {
  height: 100vh;
  width: 80%;
  margin: 0 auto;
}

::selection {
  background: rgba(0, 0, 255, 0.3);
}
</style>
