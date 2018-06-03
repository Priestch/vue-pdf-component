<template>
  <div class="pdf-view">
    <div v-if="pdfDocument">
      <pdf-page v-for="page in pdfDocument.numPages" :key="page" :page-number="page"></pdf-page>
    </div>
  </div>
</template>

<script>
import PDFPage from "./PDFPage";

const pdfjsLib = require("pdfjs-dist");
if (process.env.NODE_ENV === "production") {
  // TODO, replace with dynamic hash
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
}

export default {
  name: "pdf",
  components: {
    "pdf-page": PDFPage
  },
  props: {
    pdfData: {
      required: true
    }
  },
  data() {
    return {
      pdfDocument: null,
      options: {
        scale: 2
      }
    };
  },
  async created() {
    await this.initPDFDocument();
  },
  provide() {
    return {
      pdfViewer: this
    };
  },
  methods: {
    async initPDFDocument() {
      this.pdfDocument = await this.loadPDFDocument();
    },
    loadPDFDocument() {
      return pdfjsLib.getDocument({ data: this.pdfData });
    },
    loadPage(pageNumber) {
      return this.pdfDocument.getPage(pageNumber);
    }
  }
};
</script>

<style scoped lang="scss">
</style>
