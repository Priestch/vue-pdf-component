<template>
  <div
    class="pdf-viewer"
    @scroll="onScroll">

    <div class="pdf-viewer-sidebar"></div>
    <div class="pdf-viewer-body">
      <div
        v-if="app && app.pdfDocument"
        class="page-view-container">
        <page
          v-for="page in app.pages"
          ref="pdfPage"
          :visibility="isPageVisible(page.id)"
          :key="page.id"
          :page-number="page.id"></page>
      </div>
    </div>
  </div>
</template>

<script>
import Page from './Page';
import { PDFApplication } from '../lib/app';

const pdfjsLib = require('pdfjs-dist');
if (process.env.NODE_ENV === 'production') {
  // TODO, replace with dynamic hash
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

export default {
  name: 'PDFViewer',
  components: {
    Page,
  },
  props: {
    pdfData: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      pdfDocument: null,
      options: {
        scale: 1,
      },
      app: null,
    };
  },
  computed: {
    // TODO, this.app.visiblePages work?
    visiblePages() {
      return this.app.visiblePages;
    },
  },
  watch: {
    pdfData() {
      if (this.pdfDocument) {
        // this._cancelRendering();
        // this._resetView();
      }
    },
  },
  async mounted() {
    this.app = new PDFApplication({}, this.$el);
    await this.initPDFDocument();
  },
  provide() {
    return {
      pdfViewer: this,
    };
  },
  methods: {
    async initPDFDocument() {
      await this.app.open(this.pdfData);
      await this.app.initPages();
    },
    isPageVisible(page) {
      return this.app.isPageVisible(page);
    },
    onScroll() {
      this.app.handleScroll(this.$el);
    },
    loadPage(pageNumber) {
      return this.app.pdfDocument.getPage(pageNumber);
    },
  },
};
</script>

<style scoped lang="scss">
.pdf-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  background: #404040;
  overflow: auto;

  .pdf-viewer-body {
    position: absolute;
    top: $toolbar-height;
    right: 0;
    bottom: 0;
    left: 0;
    min-width: 320px;
  }
}
</style>
