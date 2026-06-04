export class ViewImage {
  /**
   * @param {OffscreenCanvas} canvas
   * @param {string} [tag]
   */
  static async create(canvas, tag) {
    const tagName = tag?.concat(" ", ViewImage.name) ?? ViewImage.name;

    return new ViewImage(canvas, tagName);
  }

  /**
   * @private
   * @param {OffscreenCanvas} canvas
   * @param {string} tag
   */
  constructor(canvas, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    /** @private */
    this.context = canvas.getContext("2d", { alpha: false });
    this.context.imageSmoothingEnabled = false;
  }

  /**
   * @param {CanvasImageSource} image
   */
  process(image) {
    this.context.drawImage(image, 0, 0, this.context.canvas.width, this.context.canvas.height);
  }

  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.context = undefined;
  }
}
