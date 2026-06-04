import { SampleBuffer, SampleNorm } from "../../../../sample-buffer";
import { IViewMethod } from "./view-method";

/** @implements {IViewMethod} */
export class ColourMap extends IViewMethod {
  /**
   * @private
   * @param {Uint32Array} dstRgba
   * @param {number[]} srcRgb
   * @param {number} index
   */
  static setRgbaValue(dstRgba, srcRgb, index) {
    const rgbaView = new DataView(dstRgba.buffer, index << 2, dstRgba.BYTES_PER_ELEMENT);
    rgbaView.setUint8(0, Math.round(255.0 * srcRgb[0]));
    rgbaView.setUint8(1, Math.round(255.0 * srcRgb[1]));
    rgbaView.setUint8(2, Math.round(255.0 * srcRgb[2]));
    rgbaView.setUint8(3, 255);
  }

  /**
   * @param {OffscreenCanvas} canvas
   * @param {OptionsViewSample} options
   * @param {string} [tag]
   */
  static async create(canvas, options, tag) {
    const tagName = tag?.concat(" ", ColourMap.name);
    console.debug(tagName, ColourMap.create.name);

    if (!options.colourMap || options.colourMap.trim().length == 0) throw new Error("no colour map");

    const mapFetch = await fetch(new URL(`${import.meta.resolve("/colourmap")}/${options.colourMap}.json`));
    if (!mapFetch.ok) {
      throw new Error(`${ColourMap.name} ${ColourMap.create.name} ${mapFetch.status} ${mapFetch.statusText} ${mapFetch.url}`);
    }

    /** @type {number[][]} */
    const mapData = await mapFetch.json();
    const rgbaMap = new Uint32Array(mapData.length);
    for (let idx = rgbaMap.length - 1; idx >= 0; idx--) {
      ColourMap.setRgbaValue(rgbaMap, mapData[idx], idx);
    }

    return new ColourMap(canvas, options, rgbaMap, tagName);
  }

  /**
   * @private
   * @param {OffscreenCanvas} canvas
   * @param {OptionsViewSample} options
   * @param {Uint32Array} colourMap
   * @param {string} tag
   */
  constructor(canvas, options, colourMap, tag) {
    super(tag);
    console.debug(this.tag);

    /** @private */
    this.rgbaLut = colourMap;
    /** @private */
    this.rgbaLutSize = colourMap.length - 1;
    /** @private*/
    this.sampleType = SampleBuffer.dataType(options.sample);
    /** @private*/
    this.sampleCount = SampleBuffer.sampleCount(options.sample);
    /** @private*/
    this.norm = new SampleNorm(options.sample.format.length);

    /** @private */
    this.context = canvas.getContext("2d", { alpha: false });
    this.context.imageSmoothingEnabled = false;
    /** @private */
    this.imageData = this.context.getImageData(0, 0, canvas.width, canvas.height);
    /** @private */
    this.imageRgba = new Uint32Array(this.imageData.data.buffer);
    /** @private */
    this.width = canvas.width;
    /** @private */
    this.height = canvas.height;
    /** @private */
    this.sampleWidth = options.sample.width;
    /** @private */
    this.sampleHeight = options.sample.height;
  }

  /**
   * @param {ArrayBuffer} sample
   */
  process(sample) {
    const data = new this.sampleType(sample);

    SampleBuffer.sampleScaleLut(
      this.imageRgba,
      data,
      this.norm.setSampleScaling(0, this.rgbaLutSize, SampleBuffer.sampleMinMax(data)),
      this.rgbaLut
    );

    this.context.putImageData(this.imageData, 0, 0);
  }

  /**
   * @override
   */
  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.norm.dispose();
    this.norm = undefined;

    this.rgbaLut = undefined;
    this.imageRgba = undefined;
    this.imageData = undefined;
    this.context = undefined;
  }
}
