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
      class="page-view__text-wrapper"/>

    <div 
      v-if="loading" 
      class="page-view__loading fa-2x">
      <i class="fas fa-spinner fa-pulse"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Page',
  inject: ['pdfViewer'],
  props: {
    pageNumber: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      viewport: null,
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
  created() {
    this.initPage();
  },
  methods: {
    async initPage() {
      let page = await this.pdfViewer.loadPage(this.pageNumber);
      this.loading = false;
      await this.$nextTick();
      let viewport = page.getViewport(this.pdfViewer.options.scale);
      this.viewport = viewport;
      let canvas = this.$el.querySelector(`#${this.canvasId}`);
      let context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      let renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      let renderTask = page.render(renderContext);
      renderTask.then(() => {
        console.log(`Page ${this.pageNumber} rendered...`);
      });
      return page;
    },
  },
};
</script>

<style scoped lang="scss">
$loading-icon-radius-length: 16px;

.page-view {
  position: relative;
  border: 9px solid transparent;
  border-image: url('../assets/shadow.png') 9 9 repeat;
  background-clip: content-box;
  background-color: white;
  margin: 1px auto -8px auto;
  overflow: visible;
}

.page-view__loading {
  position: absolute;
  top: calc(50% - #{$loading-icon-radius-length});
  left: calc(50% - #{$loading-icon-radius-length});
}
</style>
