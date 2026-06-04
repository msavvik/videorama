import { SampleBuffer, SampleBufferMap, SampleNorm } from "../../../../sample-buffer";
import { IViewMethod } from "./view-method";

/** @implements {IViewMethod} */
export class Normalise extends IViewMethod {
  /**
   * @param {OffscreenCanvas} canvas
   * @param {OptionsViewSample} options
   * @param {string} [tag]
   */
  static async create(canvas, options, tag) {
    const tagName = tag?.concat(" ", Normalise.name) ?? Normalise.name;
    console.debug(tagName, Normalise.create.name);

    if (!options.norm) throw new Error("no norm data");
    return new Normalise(canvas, options, tagName);
  }

  /**
   * @private
   * @param {OffscreenCanvas} canvas
   * @param {OptionsViewSample} options
   * @param {string} tag
   */
  constructor(canvas, options, tag) {
    super(tag);
    console.debug(this.tag);

    /** @private */
    this.norm = SampleNorm.fromComponents({
      format: options.sample.format,
      norm: options.norm,
      bias: options.bias
    });
    /** @private */
    this.sampleType = SampleBuffer.dataType(options.sample);
    /** @private */
    this.mapSample = new SampleBufferMap(
      new SampleBuffer({ ...options.sample, format: "rgba", layout: "interleaved", type: "uint8c" }),
      new SampleBuffer(options.sample)
    );

    /** @private */
    this.context = canvas.getContext("2d", { alpha: false });
    this.context.imageSmoothingEnabled = false;
    /** @private */
    this.imageData = this.context.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * @param {ArrayBuffer} sample
   */
  process(sample) {
    this.mapSample.mapNorm(this.imageData.data, new this.sampleType(sample), this.norm);
    this.context.putImageData(this.imageData, 0, 0);
  }

  /**
   * @override
   */
  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.norm.dispose();
    this.mapSample.dispose();
    this.norm = undefined;
    this.mapSample = undefined;

    this.context = undefined;
    this.imageData = undefined;
  }
}
