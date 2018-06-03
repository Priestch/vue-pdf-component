<template>
  <div id="app">
    <pdf :pdf-data="pdfData" class="pdf-view-container"></pdf>
  </div>
</template>

<script>
import PDF from "./components/PDF.vue";
import pdfData from "./demo_data";

export default {
  name: "app",
  components: {
    pdf: PDF
  },
  data() {
    return {
      pdfData: atob(pdfData)
    };
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.pdf-view-container {
  height: 100vh;
  width: 80%;
  margin: 0 auto;
}
</style>
