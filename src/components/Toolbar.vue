<template>
  <div class="toolbar">
    <div class="toolbar__left">Left</div>
    <div class="toolbar__right">Right</div>
    <div class="toolbar__middle">Middle</div>
  </div>
</template>

<script>
export default {
  name: 'Toolbar',
};
</script>

<style scoped lang="scss">
.toolbar {
  position: relative;
  left: 0;
  right: 0;
  height: $toolbar-height;
  background: red;
  cursor: default;
}

.toolbar__left {
  float: left;
}

.toolbar__right {
  float: right;
}

.toolbar__middle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
