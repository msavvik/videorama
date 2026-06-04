export class StereoSideBySide {
  /**
   * @param {OffscreenCanvas} lrCanvas
   * @param {string} [tag]
   */
  static create(lrCanvas, tag) {
    const tagName = tag?.concat(" ", StereoSideBySide.name) ?? StereoSideBySide.name;
    console.debug(tagName, StereoSideBySide.create.name);

    return new StereoSideBySide(lrCanvas, tagName);
  }

  /**
   * @private
   * @param {OffscreenCanvas} sbsCanvas
   * @param {string} tag
   */
  constructor(sbsCanvas, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    /** @private */
    this.sbsContext = sbsCanvas.getContext("2d", { alpha: false, desynchronized: true });
  }

  /**
   * @param {VideoFrame} sbsFrame
   */
  process(sbsFrame) {
    this.sbsContext.drawImage(sbsFrame, 0, 0);
  }

  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.sbsContext = undefined;
  }
}
