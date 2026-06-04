export class StereoFrameSwitch {
  /** @private */
  renderFrameLeft = () =>
    this.lrContext.drawImage(this.sbsCanvas, 0, 0, this.lrWidth, this.lrHeight, 0, 0, this.lrWidth, this.lrHeight);

  /** @private */
  renderFrameRight = () =>
    this.lrContext.drawImage(this.sbsCanvas, this.lrWidth, 0, this.lrWidth, this.lrHeight, 0, 0, this.lrWidth, this.lrHeight);

  /** @private @type {FrameRequestCallback} */
  render = (time) => {
    if (0 == this.lrSwitchDelayValue--) {
      this.lrSwitchDelayValue = this.lrSwitchDelay;
      this.lrIndex ^= this.lrSwitching;
    }

    this.frameRenderer[this.lrIndex]();
    this.requestId = requestAnimationFrame(this.render);
  };

  /**
   * @param {OffscreenCanvas} lrCanvas
   * @param {string} [tag]
   */
  static create(lrCanvas, tag) {
    const tagName = tag?.concat(" ", StereoFrameSwitch.name) ?? StereoFrameSwitch.name;
    console.debug(tagName, StereoFrameSwitch.create.name);

    return new StereoFrameSwitch(lrCanvas, tagName);
  }

  /**
   * @private
   * @param {OffscreenCanvas} lrCanvas
   * @param {string} tag
   */
  constructor(lrCanvas, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    /** @private */
    this.lrWidth = lrCanvas.width;
    /** @private */
    this.lrHeight = lrCanvas.height;

    /** @private */
    this.lrIndex = 1;
    /** @private */
    this.lrSwitching = 1;
    /** @private */
    this.lrSwitchDelay = 0;
    /** @private */
    this.lrSwitchDelayValue = this.lrSwitchDelay;
    /** @private */
    this.lrContext = lrCanvas.getContext("2d", { alpha: false, desynchronized: true });

    /** @private */
    this.sbsCanvas = new OffscreenCanvas(this.lrWidth * 2, this.lrHeight);
    /** @private */
    this.sbsContext = this.sbsCanvas.getContext("2d", { alpha: false });
    // /** @private */
    this.frameRenderer = [this.renderFrameLeft, this.renderFrameRight];

    /** @private */
    this.requestId = self.requestAnimationFrame(this.render);
  }

  /**
   * @param {VideoFrame} sbsFrame
   */
  process(sbsFrame) {
    this.sbsContext.drawImage(sbsFrame, 0, 0);
  }

  /**
   * @param {StereoFrameSwitchOptions} data
   */
  setOptions(data) {
    console.debug(this.tag, this.setOptions.name, data);

    this.lrSwitchDelay = data.switchDelay;
    this.lrSwitching = data.switch ? 1 : 0;

    if (data.toggleLrOrder) this.lrIndex ^= 1;
  }

  dispose() {
    console.debug(this.tag, this.dispose.name);

    self.cancelAnimationFrame(this.requestId);
    this.requestId = -1;

    this.lrContext = undefined;
    this.sbsContext = undefined;
    this.sbsCanvas = undefined;
    this.frameRenderer = undefined;
  }
}
