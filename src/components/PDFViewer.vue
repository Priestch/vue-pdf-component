<template>
  <div
    class="pdf-application"
    @scroll="onScroll">
    <div
      v-if="app && app.pdfDocument"
      class="viewer">
      <pdf-page
        v-for="page in app.pages"
        ref="pdfPage"
        :visibility="isPageVisible(page.id)"
        :key="page.id"
        :page-number="page.id"/>
    </div>
  </div>
</template>

<script>
import PDFPage from './Page';
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
    'pdf-page': PDFPage,
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
        scale: 2,
      },
      pages: [],
      currentPageNumber: 1,
      defaultViewport: null,
      pagesCount_: 0,
      app: null,
    };
  },
  computed: {
    pagesCount() {
      return this.pages.length;
    },
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
.pdf-application {
  background: #404040;
  overflow: auto;
}
</style>
