<template>
  <div
    :data-page-number="pageNumber"
    :style="viewportStyle"
    class="page-view">
    <div
      v-if="!loading"
      :style="viewportStyle"
      class="page-view__canvas-wrapper">
      <canvas :id="canvasId"/>
    </div>
    <div
      v-if="!loading"
      ref="textLayer"
      class="page-view__text-wrapper"/>

    <div
      v-if="loading"
      class="page-view__loading fa-2x">
      <i class="fas fa-spinner fa-pulse"/>
    </div>
  </div>
</template>

<script>
import eventBus from '@/event_bus';
import { TextLayerBuilder } from 'pdfjs-dist/lib/web/text_layer_builder.js';

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
      loading: true,
      viewport: null,
      pdfPage: null,
    };
  },
  computed: {
    canvasId() {
      return `page${this.pageNumber}`;
    },
    width() {
      return this.viewport.width;
    },
    height() {
      return this.viewport.height;
    },
    viewportStyle() {
      if (!this.viewport) {
        return {};
      }
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
      };
    },
  },
  watch: {
    visibility() {
      this.visibilityChangeHandler();
    },
  },
  created() {
    if (this.visibility) {
      this.renderPage();
    }
  },
  mounted() {
    eventBus.$on('textlayerrendered', this.onTextLayerRendered);
  },
  beforeDestroy() {
    eventBus.$off('textlayerrendered');
  },
  methods: {
    async renderPage() {
      this.loading = true;
      this.pdfPage = await this.pdfViewer.loadPage(this.pageNumber);
      this.loading = false;
      await this.$nextTick();
      let viewport = this.pdfPage.getViewport(this.pdfViewer.options.scale);
      this.viewport = viewport;

      let textLayer = new TextLayerBuilder({
        textLayerDiv: this.$el.querySelector('.page-view__text-wrapper'),
        eventBus: eventBus,
        pageIndex: this.pageNumber - 1,
        viewport: viewport,
      });

      await this.paintOnCanvas();
      const readableStream = this.pdfPage.streamTextContent({
        normalizeWhitespace: true,
      });
      textLayer.setTextContentStream(readableStream);
      await textLayer.render();
    },
    visibilityChangeHandler() {
      if (this.visibility) {
        this.renderPage();
      } else {
        this.reset();
      }
    },
    paintOnCanvas() {
      let canvas = this.$el.querySelector(`#${this.canvasId}`);
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
    onTextLayerRendered() {
      console.log('onTextLayerRendered');
    },
    clearTextLayer() {
      while (this.$refs.textLayer.lastChild) {
        this.$refs.textLayer.removeChild(this.$refs.textLayer.lastChild);
      }
    },
    clearCanvasLayer() {
      const canvas = this.$el.querySelector(`#${this.canvasId}`);
      if (canvas) {
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    reset() {
      this.clearTextLayer();
      this.clearCanvasLayer();
      this.loading = true;
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
  position: relative;
  overflow: hidden;

  /deep/ canvas {
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

  /deep/ &::selection {
    background: rgb(0, 0, 255);
  }

  /deep/ & > div {
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
