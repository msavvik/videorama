import { SampleMinMax } from "./sample-minmax";

export class SampleNorm {
  /**
   * @param {SampleNormOptions } options
   */
  static fromComponents(options) {
    const norm = new SampleNorm();

    for (let i = 0; i < options.format.length; i++) {
      const normValue = options.norm?.[i] ?? 1.0;
      norm.addNorm(normValue, 1.0 / normValue, options.bias?.[i] ?? 0.0);
    }

    return norm;
  }

  /**
   * @param {SampleNormOptions } options
   * @param {Readonly<string[]>} map
   */
  static fromMappedComponents(options, map) {
    const norm = new SampleNorm();

    for (let i = 0; i < options.format.length; i++) {
      if (map.includes(options.format[i])) {
        const normValue = options.norm?.[i] ?? 1.0;
        norm.addNorm(normValue, 1.0 / normValue, options.bias?.[i] ?? 0.0);
      }
    }

    return norm;
  }

  /**
   * @param {number} dstMin
   * @param {number} dstMax
   * @param {SampleMinMax[]} srcMinMax
   */
  static fromScaling(dstMin, dstMax, srcMinMax) {
    const norm = new SampleNorm();
    const dstRangeCoeff = 1.0 / (dstMax - dstMin);

    for (let i = 0; i < srcMinMax.length; i++) {
      const minSrc = srcMinMax[i].min;
      const scaleNorm = (srcMinMax[i].max - minSrc) * dstRangeCoeff;

      norm.addNorm(scaleNorm, 1.0 / scaleNorm, minSrc, dstMin);
    }

    return norm;
  }

  /**
   * @param {number} [componentCount]
   */
  constructor(componentCount) {
    const options = { length: componentCount };

    /** @type {number[]} */
    this.norm = Array.from(options);
    /** @type {number[]} */
    this.coeff = Array.from(options);
    /** @type {number[]} */
    this.bias = Array.from(options);
    /** @type {number[]} */
    this.min = Array.from(options);
  }

  /**
   * @private
   * @param {number} norm
   * @param {number} coeff
   * @param {number} bias
   * @param {number} [min=0]
   */
  addNorm(norm, coeff, bias, min = 0) {
    this.norm.push(norm);
    this.coeff.push(coeff);
    this.bias.push(bias);
    this.min.push(min);
  }

  /**
   * @param {number} dstMin
   * @param {number} dstMax
   * @param {SampleMinMax} srcMinMax
   */
  setSampleScaling(dstMin, dstMax, srcMinMax) {
    const srcMin = srcMinMax.min;
    const scaleNorm = (srcMinMax.max - srcMin) / (dstMax - dstMin);
    const scaleCoeff = 1.0 / scaleNorm;

    for (let i = 0; i < this.norm.length; i++) {
      this.norm[i] = scaleNorm;
      this.coeff[i] = scaleCoeff;
      this.bias[i] = srcMin;
      this.min[i] = dstMin;
    }

    return this;
  }

  /**
   * @param {number} dstMin
   * @param {number} dstMax
   * @param {SampleMinMax[]} srcMinMax
   */
  setComponentScaling(dstMin, dstMax, srcMinMax) {
    const dstRangeCoeff = 1.0 / (dstMax - dstMin);

    for (let i = 0; i < srcMinMax.length; i++) {
      const minSrc = srcMinMax[i].min;
      const scaleNorm = (srcMinMax[i].max - minSrc) * dstRangeCoeff;

      this.norm[i] = scaleNorm;
      this.coeff[i] = 1.0 / scaleNorm;
      this.bias[i] = minSrc;
      this.min[i] = dstMin;
    }

    return this;
  }

  dispose() {
    this.norm = undefined;
    this.coeff = undefined;
    this.bias = undefined;
    this.min = undefined;
  }
}
