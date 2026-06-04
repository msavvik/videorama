export class ScaleVideoFrame {
  /**
   * @param {ScaleVideoFrameOptions} options
   * @param {string} [tag]
   */
  static async create(options, tag) {
    const tagName = tag?.concat(" ", ScaleVideoFrame.name) ?? ScaleVideoFrame.name;
    console.debug(tagName, ScaleVideoFrame.create.name);

    return new ScaleVideoFrame(options, tagName);
  }

  /**
   * @private
   * @param {ScaleVideoFrameOptions} options
   * @param {string} tag
   */
  constructor(options, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    if (options) {
      /** @private */
      this.resizeOptions = options;
    }
  }

  /**
   * @param {VideoFrame} frame
   */
  async process(frame) {
    const bmp = await createImageBitmap(frame, this.resizeOptions);
    const res = new VideoFrame(bmp, { alpha: "discard", timestamp: frame.timestamp, duration: frame.duration });
    bmp.close();

    return res;
  }

  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.resizeOptions = undefined;
  }
}
