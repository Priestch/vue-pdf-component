<template>
  <div id="app">
    <pdf :pdf-data="pdfData" />
  </div>
</template>

<script>
import PDF from '@/components/PDFViewer';
import pdfData from './demo_data';

export default {
  name: 'App',
  components: {
    pdf: PDF,
  },
  data() {
    return {
      pdfData: atob(pdfData),
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

.pdf-application {
  height: 100vh;
  width: 80%;
  margin: 0 auto;
}
</style>
