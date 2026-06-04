import { SampleBuffer, SampleBufferMap, SampleNorm, SampleMinMax } from "../../../sample-buffer";

export class ImageSampler {
  /**
   * @param {SampleLayout} sampleLayout
   * @param {string} [tag]
   */
  static async create(sampleLayout, tag) {
    const tagName = tag?.concat(" ", ImageSampler.name) ?? ImageSampler.name;
    console.debug(tagName, ImageSampler.create.name);

    return new ImageSampler(sampleLayout, tagName);
  }

  /**
   * @private
   * @param {SampleLayout} layout
   * @param {string} tag
   */
  constructor(layout, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    /** @private */
    this.dstBuffer = new SampleBuffer(layout);
    /** @private */
    this.map = new SampleBufferMap(
      this.dstBuffer,
      new SampleBuffer({ ...layout, format: "rgba", layout: "interleaved", type: "uint8" })
    );
    /** @private */
    this.norm = SampleNorm.fromMappedComponents(layout, this.map.component);
    /** @private */
    this.scaling = SampleNorm.fromScaling(0, 1, SampleMinMax.arrayFrom(0, 255, this.map.componentCount));
    /** @private */
    this.sampleWidth = layout.width;
    /** @private */
    this.sampleHeight = layout.height;
    /** @private  */
    this.context = /** @type {OffscreenCanvasRenderingContext2D} */ (
      new OffscreenCanvas(this.sampleWidth, this.sampleHeight).getContext("2d", {
        alpha: false,
        desynchronized: true
      })
    );

    this.context.imageSmoothingEnabled = false;
  }

  /**
   * @param {TransferableCanvasImageSource} source
   */
  process(source) {
    const sample = new this.dstBuffer.type(this.dstBuffer.length);

    this.context.drawImage(source, 0, 0, this.sampleWidth, this.sampleHeight);
    this.map.mapScaleNorm(
      sample,
      this.context.getImageData(0, 0, this.sampleWidth, this.sampleHeight).data,
      this.norm,
      this.scaling
    );

    return sample;
  }

  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.dstBuffer.dispose();
    this.map.dispose();
    this.norm.dispose();
    this.scaling.dispose();
    this.dstBuffer = undefined;
    this.map = undefined;
    this.norm = undefined;
    this.scaling = undefined;

    this.context = undefined;
  }
}
