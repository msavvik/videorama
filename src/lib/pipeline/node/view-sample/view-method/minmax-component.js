import { SampleBuffer, SampleBufferMap, SampleNorm } from "../../../../sample-buffer";
import { IViewMethod } from "./view-method";

/** @implements {IViewMethod} */
export class MinMaxComponent extends IViewMethod {
  /**
   * @param {OffscreenCanvas} canvas
   * @param {OptionsViewSample} options
   * @param {string} [tag]
   */
  static async create(canvas, options, tag) {
    const tagName = tag?.concat(" ", MinMaxComponent.name) ?? MinMaxComponent.name;
    console.debug(tagName, MinMaxComponent.create.name);

    return new MinMaxComponent(canvas, options, tagName);
  }

  /**
   * @private
   * @param {OffscreenCanvas} canvas
   * @param {OptionsViewSample} options
   * @param {string} tag
   */
  constructor(canvas, options, tag) {
    super(tag);

    /** @private */
    this.sampleBuffer = new SampleBuffer(options.sample);
    /** @private */
    this.mapping = new SampleBufferMap(
      new SampleBuffer({ ...options.sample, format: "rgba", layout: "interleaved", type: "uint8c" }),
      this.sampleBuffer
    );
    /** @private */
    this.scaling = new SampleNorm(this.mapping.componentCount);
    /** @private @type {CanvasRenderingContext2D} */
    this.context = /** @type {any} */ (canvas.getContext("2d", { alpha: false }));
    this.context.imageSmoothingEnabled = false;
    /** @private */
    this.image = this.context.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * @param {ArrayBuffer} sample
   */
  process(sample) {
    const data = new this.sampleBuffer.type(sample);
    this.mapping.mapScale(
      this.image.data,
      data,
      this.scaling.setComponentScaling(0, 255, this.sampleBuffer.componentMinMax(data, this.mapping.component))
    );
    this.context.putImageData(this.image, 0, 0);
  }

  /**
   * @override
   */
  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.mapping.dispose();
    this.scaling.dispose();
    this.sampleBuffer.dispose();
    this.mapping = undefined;
    this.scaling = undefined;
    this.sampleBuffer = undefined;

    this.context = undefined;
    this.image = undefined;
  }
}
