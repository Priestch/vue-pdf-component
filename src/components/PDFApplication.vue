<template>
  <div class="pdf-application">
    <pdf :pdf-data="pdfData"/>
  </div>
</template>

<script>
import PDF from './PDFViewer';
import pdfData from '../demo_data';

export default {
  name: 'PDFApplication',
  components: {
    pdf: PDF,
  },
  props: {
    config: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      defaultConfig: {},
      pdfData: atob(pdfData),
    };
  },
  created() {
    if (this.config) {
      Object.assign(this.defaultConfig, this.config);
    }
  },
};
</script>

<style scoped lang="scss">
.pdf-application {
  background: #404040;
  overflow: auto;
}
</style>
