<template>
  <div class="page">
    <canvas class="canvas-container"></canvas>
  </div>
</template>

<script>
export default {
  name: "PDFPage",
  inject: ["pdfViewer"],
  props: {
    pageNumber: {
      type: Number,
      required: true
    }
  },
  created() {
    this.initPage();
  },
  methods: {
    async initPage() {
      let page = await this.pdfViewer.loadPage(this.pageNumber);
      let viewport = page.getViewport(this.pdfViewer.options.scale);
      let canvas = this.$el.querySelector(".canvas-container");
      let context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      let renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      let renderTask = page.render(renderContext);
      renderTask.then(() => {
        console.log(`Page ${this.pageNumber} rendered...`);
      });
      return page;
    }
  }
};
</script>

<style scoped lang="scss">
.page {
  border: 1px solid grey;
}
</style>
