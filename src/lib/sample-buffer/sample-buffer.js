import { ComponentNameIndex, ComponentOrderIndex } from "./component-index.js";
import { SampleMinMax } from "./sample-minmax.js";
import { SampleNorm } from "./sample-norm.js";

export class SampleBuffer {
  static Type = {
    int8: Int8Array,
    uint8: Uint8Array,
    uint8c: Uint8ClampedArray,
    int16: Int16Array,
    uint16: Uint16Array,
    float16: Float16Array,
    int32: Int32Array,
    uint32: Uint32Array,
    float32: Float32Array,
    float64: Float64Array
  };

  /** @private */
  static Layout = {
    planar: true,
    interleaved: false
  };

  /** @private */
  static validComponentNames = ["r", "g", "b", "a"];

  /**
   * Validate the provided component format.
   * @param {string} format
   */
  static validateFormat(format) {
    for (const cName of format) {
      if (!SampleBuffer.validComponentNames.includes(cName)) {
        throw new Error(`Unsupported component format name: ${cName}`);
      }
    }
  }

  /**
   * Check if the provided sample layout is planar or interleaved.
   * @private
   * @param {SampleLayout} layout
   */
  static isPlanar(layout) {
    if (SampleBuffer.Layout[layout.layout] == undefined) throw new Error(`unknown layout: '${layout.layout}'`);
    return SampleBuffer.Layout[layout.layout];
  }

  /**
   * Get typed array constructor of the provided sample layout type.
   * @param {SampleLayout} layout
   */
  static dataType(layout) {
    if (SampleBuffer.Type[layout.type] == undefined) throw new Error(`unknown type: '${layout.type}'`);
    return SampleBuffer.Type[layout.type];
  }

  /**
   *
   * @param {SampleLayout} layout
   * @returns {number}
   */
  static sampleCount(layout) {
    return layout.width * layout.height;
  }

  /**
   * Calculate min and max values of the provided sample data.
   * @param {ArrayLike<number>} data
   * @param {boolean} [swap]
   * @returns {SampleMinMax}
   */
  static sampleMinMax(data, swap) {
    let min = data[0];
    let max = min;

    // min/max initialised with data[0]. Loop omittable.
    for (let idx = data.length - 1; idx > 0; idx--) {
      const value = data[idx];
      min > value && (min = value);
      max < value && (max = value);
    }

    return new SampleMinMax(min, max, swap);
  }

  /**
   * Apply a {@link scaling} prescaled lookup transformation {@link lut} to {@link src} data.
   * Transformation result is stored in {@link dst}.
   *
   * @param {TypedArray | number[]} dst
   * @param {ArrayLike<number>} src
   * @param {SampleNorm} scaling
   * @param {ArrayLike<number>} lut
   */
  static sampleScaleLut(dst, src, scaling, lut) {
    const scaleBias = scaling.bias[0];
    const scaleCoeff = scaling.coeff[0];
    const scaleMin = scaling.min[0];

    for (let i = dst.length - 1; i >= 0; i--) {
      dst[i] = lut[0 | ((src[i] - scaleBias) * scaleCoeff + scaleMin)];
    }
  }

  /**
   * @param {SampleLayout} layout
   */
  constructor(layout) {
    this.type = SampleBuffer.dataType(layout);
    this.componentFormat = /** @type {SampleComponentName[]} */ (Array.from(layout.format));

    const sampleCount = SampleBuffer.sampleCount(layout);

    this.length = sampleCount * this.componentFormat.length;

    this.indexStride = undefined;
    this.indexMax = undefined;

    let componentStride;
    if (SampleBuffer.isPlanar(layout)) {
      componentStride = sampleCount;
      this.indexStride = 1;
      this.indexMax = sampleCount - this.indexStride;
    } else {
      componentStride = 1;
      this.indexStride = this.componentFormat.length;
      this.indexMax = this.length - this.indexStride;
    }

    this.offsetComponentName = ComponentNameIndex.create(layout.format, componentStride);
    this.offsetComponentFormatIndex = ComponentOrderIndex.create(layout.format, componentStride);
  }

  /**
   * Calculate component-wise min and max values of the provided sample data.
   * @param {ArrayLike<number>} data
   * @param {SampleComponentName[]} [component]
   * @param {boolean} [swap]
   * @returns {SampleMinMax[]}
   */
  componentMinMax(data, component = this.componentFormat, swap) {
    const res = [];
    let min, max;

    for (let cIdx = 0; cIdx < component.length; cIdx++) {
      const offset = this.offsetComponentName[component[cIdx]];
      min = max = data[offset];

      for (let i = this.indexMax; i > 0; i -= this.indexStride) {
        const value = data[offset + i];
        min > value && (min = value);
        max < value && (max = value);
      }

      res.push(new SampleMinMax(min, max, swap));
    }

    return res;
  }

  dispose() {
    // note: can be called multiple times.
    this.type = undefined;
    this.componentFormat = undefined;
    this.offsetComponentName = undefined;
    this.offsetComponentFormatIndex = undefined;
  }
}
