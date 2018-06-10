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

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.pdf-application {
  height: 100vh;
  width: 80%;
  margin: 0 auto;
}
</style>
