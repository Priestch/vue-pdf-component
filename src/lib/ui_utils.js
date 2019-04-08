const CSS_UNITS = 96.0 / 72.0;
// const DEFAULT_SCALE_VALUE = 'auto';
const DEFAULT_SCALE = 1.0;
// const MIN_SCALE = 0.1;
// const MAX_SCALE = 10.0;
const UNKNOWN_SCALE = 0;
// const MAX_AUTO_SCALE = 1.25;
// const SCROLLBAR_PADDING = 40;
// const VERTICAL_PADDING = 5;
// const PresentationModeState = {
//   UNKNOWN: 0,
//   NORMAL: 1,
//   CHANGING: 2,
//   FULLSCREEN: 3,
// };
// const RendererType = {
//   CANVAS: 'canvas',
//   SVG: 'svg',
// };
// const TextLayerMode = {
//   DISABLE: 0,
//   ENABLE: 1,
//   ENABLE_ENHANCE: 2,
// };

function binarySearchFirstItem(items, condition) {
  let minIndex = 0;
  let maxIndex = items.length - 1;
  if (items.length === 0 || !condition(items[maxIndex])) {
    return items.length;
  }
  if (condition(items[minIndex])) {
    return minIndex;
  }
  while (minIndex < maxIndex) {
    const currentIndex = (minIndex + maxIndex) >> 1;
    const currentItem = items[currentIndex];
    if (condition(currentItem)) {
      maxIndex = currentIndex;
    } else {
      minIndex = currentIndex + 1;
    }
  }
  return minIndex;
}

function backtrackBeforeAllVisibleElements(index, views, top) {
  if (index < 2) {
    return index;
  }
  let elt = views[index].div;
  let pageTop = elt.offsetTop + elt.clientTop;
  if (pageTop >= top) {
    elt = views[index - 1].div;
    pageTop = elt.offsetTop + elt.clientTop;
  }
  for (let i = index - 2; i >= 0; --i) {
    elt = views[i].div;
    if (elt.offsetTop + elt.clientTop + elt.clientHeight <= pageTop) {
      break;
    }
    index = i;
  }
  return index;
}

function getVisibleElements(scrollEl, views) {
  const sortByVisibility =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  const horizontal =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  const top = scrollEl.scrollTop,
    bottom = top + scrollEl.clientHeight;
  const left = scrollEl.scrollLeft,
    right = left + scrollEl.clientWidth;

  function isElementBottomAfterViewTop(view) {
    const element = view.div;
    const elementBottom =
      element.offsetTop + element.clientTop + element.clientHeight;
    return elementBottom > top;
  }

  function isElementRightAfterViewLeft(view) {
    const element = view.div;
    const elementRight =
      element.offsetLeft + element.clientLeft + element.clientWidth;
    return elementRight > left;
  }

  const visible = [];
  let view = void 0;
  let element = void 0;
  let currentHeight = void 0,
    viewHeight = void 0,
    viewBottom = void 0,
    hiddenHeight = void 0;
  let currentWidth = void 0,
    viewWidth = void 0,
    viewRight = void 0,
    hiddenWidth = void 0;
  let percentVisible = void 0;
  let firstVisibleElementInd =
    views.length === 0
      ? 0
      : binarySearchFirstItem(
          views,
          horizontal
            ? isElementRightAfterViewLeft
            : isElementBottomAfterViewTop,
        );
  if (views.length > 0 && !horizontal) {
    firstVisibleElementInd = backtrackBeforeAllVisibleElements(
      firstVisibleElementInd,
      views,
      top,
    );
  }
  let lastEdge = horizontal ? right : -1;
  for (let i = firstVisibleElementInd, ii = views.length; i < ii; i++) {
    view = views[i];
    element = view.div;
    currentWidth = element.offsetLeft + element.clientLeft;
    currentHeight = element.offsetTop + element.clientTop;
    viewWidth = element.clientWidth;
    viewHeight = element.clientHeight;
    viewRight = currentWidth + viewWidth;
    viewBottom = currentHeight + viewHeight;
    if (lastEdge === -1) {
      if (viewBottom >= bottom) {
        lastEdge = viewBottom;
      }
    } else if ((horizontal ? currentWidth : currentHeight) > lastEdge) {
      break;
    }
    if (
      viewBottom <= top ||
      currentHeight >= bottom ||
      viewRight <= left ||
      currentWidth >= right
    ) {
      continue;
    }
    hiddenHeight =
      Math.max(0, top - currentHeight) + Math.max(0, viewBottom - bottom);
    hiddenWidth =
      Math.max(0, left - currentWidth) + Math.max(0, viewRight - right);
    percentVisible =
      (((viewHeight - hiddenHeight) * (viewWidth - hiddenWidth) * 100) /
        viewHeight /
        viewWidth) |
      0;
    visible.push({
      id: view.id,
      x: currentWidth,
      y: currentHeight,
      view: view,
      percent: percentVisible,
    });
  }
  const first = visible[0];
  const last = visible[visible.length - 1];
  if (sortByVisibility) {
    visible.sort(function(a, b) {
      const pc = a.percent - b.percent;
      if (Math.abs(pc) > 0.001) {
        return -pc;
      }
      return a.id - b.id;
    });
  }
  return {
    first: first,
    last: last,
    views: visible,
  };
}

export { CSS_UNITS, DEFAULT_SCALE, UNKNOWN_SCALE, getVisibleElements };
