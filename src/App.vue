<template>
  <div id="app">
    <pdf-application></pdf-application>
  </div>
</template>

<script>
import PDFApplication from "./components/PDFApplication";

export default {
  name: "app",
  components: {
    pdfApplication: PDFApplication
  }
};
</script>

<style lang="scss">
body {
  margin: 0;
}

.pdf-application {
  height: 100vh;
  width: 80%;
  margin: 0 auto;
}
</style>
