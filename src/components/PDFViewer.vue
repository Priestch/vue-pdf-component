<template>
  <div
    class="pdf-application"
    @scroll="onScroll">
    <div
      v-if="pdfDocument"
      class="viewer">
      <pdf-page
        v-for="page in pages"
        ref="pdfPage"
        :visibility="isPageVisible(page.id)"
        :key="page.id"
        :page-number="page.id"/>
    </div>
  </div>
</template>

<script>
import PDFPage from './Page';
import { getVisibleElements, CSS_UNITS } from '../ui_utils';
// import { PDFPageView } from '../pdf_page_view';

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
      visiblePages: {
        first: { id: 1 },
        last: { id: 1 },
        views: [],
      },
    };
  },
  computed: {
    pagesCount() {
      return this.pages.length;
    },
  },
  watch: {
    pdfData() {
      if (this.pdfDocument) {
        this._cancelRendering();
        this._resetView();
      }
    },
  },
  async created() {
    await this.initPDFDocument();
  },
  mounted() {},
  provide() {
    return {
      pdfViewer: this,
    };
  },
  methods: {
    async initPDFDocument() {
      this.pdfDocument = await this.loadPDFDocument();
      await this.initPages();
    },
    async initPages() {
      let pagesCount = this.pdfDocument.numPages;
      let firstPage = await this.pdfDocument.getPage(1);
      let scale = this.currentScale;
      this.defaultViewport = firstPage.getViewport(scale * CSS_UNITS);
      for (let pageNum = 1; pageNum <= pagesCount; ++pageNum) {
        const page = {
          id: pageNum,
        };
        this.pages.push(page);
      }
    },
    loadPDFDocument() {
      return pdfjsLib.getDocument({ data: this.pdfData });
    },
    isPageVisible(page) {
      return (
        this.visiblePages.first.id <= page &&
        page <= this.visiblePages.last.id + 1
      );
    },
    loadPage(pageNumber) {
      return this.pdfDocument.getPage(pageNumber);
    },
    onScroll() {
      let state = {
        right: true,
        down: true,
        lastX: this.$el.scrollLeft,
        lastY: this.$el.scrollTop,
      };

      let rAF = null;
      if (rAF) {
        return;
      }
      // schedule an invocation of scroll for next animation frame.
      rAF = window.requestAnimationFrame(() => {
        rAF = null;

        let currentX = this.$el.scrollLeft;
        let lastX = state.lastX;
        if (currentX !== lastX) {
          state.right = currentX > lastX;
        }
        state.lastX = currentX;
        let currentY = this.$el.scrollTop;
        let lastY = state.lastY;
        if (currentY !== lastY) {
          state.down = currentY > lastY;
        }
        state.lastY = currentY;
        this._scrollUpdate();
      });
    },
    _scrollUpdate() {
      if (this.pagesCount === 0) {
        return;
      }
      this.update();
    },
    _resetView() {
      this.pages = [];
      this.currentPageNumber = 1;
      // this._currentScale = UNKNOWN_SCALE;
      // this._currentScaleValue = null;
      // this._pageLabels = null;
      // this._buffer = new PDFPageViewBuffer(DEFAULT_CACHE_SIZE);
      // this._location = null;
      // this._pagesRotation = 0;
      // this._pagesRequests = [];
      // this._pageViewsReady = false;
      //
      // // Remove the pages from the DOM.
      // this.viewer.textContent = '';
    },
    _cancelRendering() {
      for (let i = 0, ii = this._pages.length; i < ii; i++) {
        if (this.pages[i]) {
          this.pages[i].cancelRendering();
        }
      }
    },
    _getVisiblePages() {
      let isInPresentationMode = false;
      const pageElements = this.$refs.pdfPage.map((c, index) => {
        return {
          id: index + 1,
          div: c.$el,
        };
      });
      if (!isInPresentationMode) {
        return getVisibleElements(this.$el, pageElements);
      }
      // The algorithm in getVisibleElements doesn't work in all browsers and
      // configurations when presentation mode is active.
      let currentPage = this.pages[this.currentPageNumber - 1];
      let visible = [{ id: currentPage.id, view: currentPage }];
      return { first: currentPage, last: currentPage, views: visible };
    },
    update() {
      this.visiblePages = this._getVisiblePages();
      // let visiblePages = visible.views,
      //   numVisiblePages = visiblePages.length;
      //
      // if (numVisiblePages === 0) {
      //   return;
      // }
      // this._resizeBuffer(numVisiblePages, visiblePages);
      //
      // this.renderingQueue.renderHighestPriority(visible);
      //
      // let currentId = this._currentPageNumber;
      // let stillFullyVisible = false;
      //
      // for (let i = 0; i < numVisiblePages; ++i) {
      //   let page = visiblePages[i];
      //
      //   if (page.percent < 100) {
      //     break;
      //   }
      //   if (page.id === currentId) {
      //     stillFullyVisible = true;
      //     break;
      //   }
      // }
      //
      // if (!stillFullyVisible) {
      //   currentId = visiblePages[0].id;
      // }
      // if (!this.isInPresentationMode) {
      //   this._setCurrentPageNumber(currentId);
      // }
      //
      // this._updateLocation(visible.first);
      // this.eventBus.dispatch("updateviewarea", {
      //   source: this,
      //   location: this._location
      // });
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
