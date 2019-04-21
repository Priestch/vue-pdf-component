<template>
  <div
    :data-page-number="pageNumber"
    :data-loaded="layersLoaded"
    :style="viewportStyle"
    class="page-view">
    <div
      v-if="!isLoading"
      ref="canvasLayer"
      :style="canvasWrapperStyle"
      class="page-view__canvas-wrapper">
      <canvas
        ref="canvas"
        :id="canvasId"
        :hidden="!canvasVisible"
        :style="canvasStyle"></canvas>
    </div>
    <div
      v-if="!isLoading"
      ref="textLayer"
      class="page-view__text-wrapper"></div>

    <div
      v-if="isLoading"
      class="page-view__loading fa-2x">
      <font-awesome-icon
        :icon="['fas', 'spinner']"
        pulse></font-awesome-icon>
    </div>
  </div>
</template>

<script>
import { PDFPageView } from '../lib/pdfjs/pdf_page_view';
import { TextLayerMode } from '../lib/pdfjs/ui_utils';

export default {
  name: 'Page',
  inject: ['pdfViewer'],
  props: {
    pageNumber: {
      type: Number,
      required: true,
    },
    visibility: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isLoading: true,
      viewport: null,
      pdfPage: null,
      pageView: null,
      viewportStyle: {},
      canvasWrapperStyle: {},
      canvasStyle: {},
      showCanvasLayer: false,
      showTextLayer: false,
      canvasVisible: false,
      layersLoaded: false,
    };
  },
  computed: {
    canvasId() {
      return `page${this.pageNumber}`;
    },
    dataLoaded() {
      return !this.isLoading && this.showCanvasLayer && this.showTextLayer;
    },
    app() {
      return this.pdfViewer.app;
    },
  },
  watch: {
    visibility() {
      this.visibilityChangeHandler();
    },
  },
  created() {
    const pageOptions = {
      id: this.pageNumber,
      defaultViewport: this.app.defaultViewport.clone(),
      textLayerMode: TextLayerMode.ENABLE,
      scale: this.app.currentScale,
      container: this.$parent.$el.querySelector('.page-viewer-container'),
      eventBus: this.app.eventBus,
      textLayerFactory: this.app,
    };
    this.pageView = new PDFPageView(pageOptions);
  },
  mounted() {
    if (this.visibility) {
      this.drawPage();
    }
    this.app.eventBus.on('pagerendered', this.onPageRendered);
  },
  beforeDestroy() {
    this.app.eventBus.off('textlayerrendered');
  },
  methods: {
    async getPage() {
      return await this.app.pdfDocument.getPage(this.pageNumber);
    },

    getTextLayer() {
      return this.$refs.textLayer;
    },

    getCanvasLayer() {
      return this.$refs.canvasLayer;
    },

    getCanvas() {
      return this.$refs.canvas;
    },

    showCanvas() {
      this.canvasVisible = true;
    },

    async drawPage() {
      this.isLoading = true;
      this.pageView.setPageComponent(this);
      const pdfPage = await this.getPage(this.pageNumber);
      this.pageView.setPdfPage(pdfPage);

      this.pageView.draw();
      this.isLoading = false;
    },
    visibilityChangeHandler() {
      if (this.visibility) {
        this.drawPage();
      } else {
        this.reset();
      }
    },
    paintOnCanvas() {
      const canvas = this.$el.querySelector(`#${this.canvasId}`);
      canvas.id = `${this.pageNumber}`;
      const ctx = canvas.getContext('2d', { alpha: false });
      canvas.height = this.viewport.height;
      canvas.width = this.viewport.width;

      const renderTask = this.pdfPage.render({
        canvasContext: ctx,
        viewport: this.viewport,
      });
      return renderTask.promise;
    },
    onPageRendered(event) {
      if (event.pageNumber === this.pageNumber) {
        console.log('onPageRendered', event);
      }
    },
    resetStyle() {
      this.viewportStyle = {
        width: `${this.pageView.width}px`,
        height: `${this.pageView.height}px`,
      };
    },
    async renderCanvasLayer() {
      this.showCanvasLayer = true;
      this.updateCanvasWrapperStyle();
      await this.$nextTick();
    },
    async renderTextLayer() {
      this.showTextLayer = true;
      await this.$nextTick();
    },
    updateCanvasWrapperStyle() {
      this.canvasWrapperStyle = {
        width: this.$el.width,
        height: this.$el.height,
      };
    },
    setLayersLoaded(loaded) {
      this.layersLoaded = loaded;
    },
    updateCanvasStyle({ width, height }) {
      this.$refs.canvas.style.width = width;
      this.$refs.canvas.style.height = height;
    },
    updateCanvasRect(width, height) {
      this.$refs.canvas.width = width;
      this.$refs.canvas.height = height;
    },
    clearTextLayer() {
      while (this.$refs.textLayer.lastChild) {
        this.$refs.textLayer.removeChild(this.$refs.textLayer.lastChild);
      }
    },
    clearCanvasLayer() {
      const canvas = this.$el.querySelector(`#${this.canvasId}`);
      if (canvas) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    updateLoading(loading) {
      this.isLoading = loading;
    },
    reset() {
      this.resetStyle();
      this.showTextLayer = false;
      this.showCanvasLayer = false;
      this.$el.removeAttribute('data-loaded');
    },
  },
};
</script>

<style scoped lang="scss">
$loading-icon-radius-length: 16px;

.page-view {
  direction: ltr;
  position: relative;
  border: 9px solid transparent;
  border-image: url('../assets/shadow.png') 9 9 repeat;
  background-clip: content-box;
  background-color: white;
  margin: 1px auto -8px auto;
  overflow: visible;
  width: 816px;
  height: 1056px;
}

.page-view__canvas-wrapper {
  overflow: hidden;

  canvas {
    margin: 0;
    display: block;
  }
}

.page-view__text-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.2;

  ::v-deep ::selection {
    background: rgb(0, 0, 255);
  }

  ::v-deep > span {
    position: absolute;
    color: transparent;
    white-space: pre;
    cursor: text;
    transform-origin: 0 0;
  }

  .endOfContent {
    display: block;
    position: absolute;
    left: 0;
    top: 100%;
    right: 0;
    bottom: 0;
    z-index: -1;
    cursor: default;
    user-select: none;
  }

  .endOfContent.active {
    top: 0;
  }
}

.page-view__loading {
  position: absolute;
  top: calc(50% - #{$loading-icon-radius-length});
  left: calc(50% - #{$loading-icon-radius-length});
}
</style>
