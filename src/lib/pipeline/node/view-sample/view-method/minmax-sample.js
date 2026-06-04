import { SampleBuffer, SampleBufferMap, SampleNorm } from "../../../../sample-buffer";
import { IViewMethod } from "./view-method";

/** @implements {IViewMethod} */
export class MinMaxSample extends IViewMethod {
  /**
   * @param {OffscreenCanvas} canvas
   * @param {OptionsViewSample} options
   * @param {string} [tag]
   */
  static async create(canvas, options, tag) {
    const tagName = tag?.concat(" ", MinMaxSample.name) ?? MinMaxSample.name;
    console.debug(tagName, MinMaxSample.create.name);

    return new MinMaxSample(canvas, options, tagName);
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
    /** @private */
    this.context = canvas.getContext("2d", { alpha: false });
    this.context.imageSmoothingEnabled = false;
    /** @private */
    this.image = this.context.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * @param {ArrayBuffer} sample
   */
  process(sample) {
    const data = new this.sampleBuffer.type(sample);

    this.mapping.mapScale(this.image.data, data, this.scaling.setSampleScaling(0, 255, SampleBuffer.sampleMinMax(data)));
    this.context.putImageData(this.image, 0, 0);
  }

  /**
   * @override
   */
  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.sampleBuffer.dispose();
    this.mapping.dispose();
    this.scaling.dispose();
    this.sampleBuffer = undefined;
    this.mapping = undefined;
    this.scaling = undefined;

    this.context = undefined;
    this.image = undefined;
  }
}
