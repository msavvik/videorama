import { SampleBuffer, SampleBufferMap, SampleNorm } from "../../../sample-buffer";
import { DepthMapDefaults } from "./depth-map-defaults";

export class DepthMap {
  /**
   * @param {DepthMapCreateOptions} options
   * @param {string} [tag]
   */
  static create(options, tag) {
    const tagName = tag?.concat(" ", DepthMap.name) ?? DepthMap.name;
    console.debug(tagName, DepthMap.create.name);

    return new DepthMap(options, tagName);
  }

  /**
   * @private
   * @param {DepthMapCreateOptions} options
   * @param {string} tag
   */
  constructor(options, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    /** @private @type {DepthMapOptions} */
    this.options = DepthMapDefaults.options();
    /** @private*/
    this.swapMinMax = options.invertRange ?? false;
    /** @private */
    this.depthBuffer = new SampleBuffer(options.depth);
    /** @private */
    this.sampleBuffer = new SampleBuffer(options.sample);
    /** @private */
    this.sampleMap = new SampleBufferMap(this.depthBuffer, this.sampleBuffer);
    /** @private */
    this.norm = SampleNorm.fromMappedComponents({ format: options.depth.format }, this.sampleMap.component);
  }

  /**
   * @param {DepthMapOptions} options
   */
  setOptions(options) {
    console.debug(this.tag, this.setOptions.name, options);

    Object.assign(this.options, options);
  }

  /**
   * @param {ArrayBuffer} sample
   */
  process(sample) {
    const depthData = new this.depthBuffer.type(this.depthBuffer.length);
    const sampleData = new this.sampleBuffer.type(sample);

    this.norm.setSampleScaling(this.options.min, this.options.max, SampleBuffer.sampleMinMax(sampleData, this.swapMinMax));
    this.sampleMap.mapScale(depthData, sampleData, this.norm);

    return depthData;
  }

  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.depthBuffer.dispose();
    this.sampleBuffer.dispose();
    this.sampleMap.dispose();
    this.norm.dispose();
    this.depthBuffer = undefined;
    this.sampleBuffer = undefined;
    this.sampleMap = undefined;
    this.norm = undefined;

    this.options = undefined;
  }
}
