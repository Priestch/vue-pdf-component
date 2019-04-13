import createEventBus from '../event_bus_factory';
import {
  UNKNOWN_SCALE,
  DEFAULT_SCALE,
  CSS_UNITS,
  getVisibleElements,
} from './pdfjs/ui_utils';

import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer';

const pdfjsLib = require('pdfjs-dist');

class PDFApplication {
  constructor(appConfig, rootContainer) {
    this.rootContainer = rootContainer;
    this.appConfig = appConfig;
    this.eventBus = createEventBus();
    this.pdfDocument = null;
    this._currentScale = 1.5;
    this.currentPageNumber = 1;
    this._defaultViewport = null;
    this.pagesCount = 0;
    this.visiblePages = {
      first: { id: 1 },
      last: { id: 1 },
      views: [],
    };
    this.pages = [];
  }

  async open(pdfURL) {
    this.pdfDocument = await pdfjsLib.getDocument(pdfURL);
  }

  async initPages() {
    const pagesCount = this.pdfDocument.numPages;
    this.pagesCount = pagesCount;
    const firstPage = await this.pdfDocument.getPage(1);
    const scale = this.currentScale;
    this._defaultViewport = firstPage.getViewport(scale * CSS_UNITS);
    for (let pageNum = 1; pageNum <= pagesCount; ++pageNum) {
      const page = {
        id: pageNum,
      };
      this.pages.push(page);
    }
  }

  _cancelRendering() {
    for (let i = 0; i < this.pages.length; i++) {
      if (this.pages[i]) {
        this.pages[i].cancelRendering();
      }
    }
  }

  handleScroll(el) {
    const state = {
      right: true,
      down: true,
      lastX: el.scrollLeft,
      lastY: el.scrollTop,
    };

    let rAF = null;
    if (rAF) {
      return;
    }
    // schedule an invocation of scroll for next animation frame.
    rAF = window.requestAnimationFrame(() => {
      rAF = null;

      const currentX = el.scrollLeft;
      const lastX = state.lastX;
      if (currentX !== lastX) {
        state.right = currentX > lastX;
      }
      state.lastX = currentX;
      const currentY = el.scrollTop;
      const lastY = state.lastY;
      if (currentY !== lastY) {
        state.down = currentY > lastY;
      }
      state.lastY = currentY;
      this._scrollUpdate();
    });
  }

  _getVisiblePages() {
    const isInPresentationMode = false;
    const pageViews = this.rootContainer.querySelectorAll('.page-view');
    const pageElements = Array.from(pageViews).map((c, index) => {
      return {
        id: index + 1,
        div: c,
      };
    });
    if (!isInPresentationMode) {
      return getVisibleElements(this.rootContainer, pageElements);
    }
    // The algorithm in getVisibleElements doesn't work in all browsers and
    // configurations when presentation mode is active.
    const currentPage = this.pages[this.currentPageNumber - 1];
    const visible = [{ id: currentPage.id, view: currentPage }];
    return { first: currentPage, last: currentPage, views: visible };
  }

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
  }

  _scrollUpdate() {
    if (this.pagesCount === 0) {
      return;
    }
    this.update();
  }

  isPageVisible(page) {
    return (
      this.visiblePages.first.id <= page &&
      page <= this.visiblePages.last.id + 1
    );
  }

  createTextLayerBuilder(
    textLayerDiv,
    pageIndex,
    viewport,
    enhanceTextSelection = false,
  ) {
    return new TextLayerBuilder({
      textLayerDiv,
      eventBus: this.eventBus,
      pageIndex,
      viewport,
      findController: null,
      enhanceTextSelection: this.isInPresentationMode
        ? false
        : enhanceTextSelection,
    });
  }

  get currentScale() {
    return this._currentScale !== UNKNOWN_SCALE
      ? this._currentScale
      : DEFAULT_SCALE;
  }

  get defaultViewport() {
    return this._defaultViewport;
  }
}

export { PDFApplication };
