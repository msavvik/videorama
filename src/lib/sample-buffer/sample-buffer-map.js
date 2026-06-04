import { SampleBuffer } from "./sample-buffer";
import { SampleNorm } from "./sample-norm.js";

export class SampleBufferMap {
  /**
   * @param {SampleBuffer} dst
   * @param {SampleBuffer} src
   */
  constructor(dst, src) {
    /** @private */
    this.src = src;
    /** @private */
    this.dst = dst;
    /** @private @type {number[]} */
    this.srcOffset = [];
    /** @private @type {number[]} */
    this.dstOffset = [];
    /** @type {SampleComponentName[]} */
    this.component = [];

    // Map dst component names with any matching src component names.
    for (let i = 0; i < this.dst.componentFormat.length; i++) {
      const cName = this.dst.componentFormat[i];
      const srcOffset = this.src.offsetComponentName[cName];

      if (srcOffset != undefined) {
        /** @type {SampleComponentName[]} */ (this.component).push(cName);
        this.dstOffset.push(this.dst.offsetComponentFormatIndex[i]);
        this.srcOffset.push(srcOffset);
      }
    }

    /** @private */
    this.componentMax = this.component.length - 1;
    if (this.componentMax < 0) {
      console.warn(SampleBufferMap.name, "no common components.", "from:", src.componentFormat, "to:", dst.componentFormat);
    }
  }

  get componentCount() {
    return this.component.length;
  }

  /**
   * @param {(TypedArray | number[])} dst
   * @param {ArrayLike<number>} src
   */
  map(dst, src) {
    const stepDst = this.dst.indexStride;
    const stepSrc = this.src.indexStride;

    for (let cIdx = this.componentMax; cIdx >= 0; cIdx--) {
      const offsetSrc = this.srcOffset[cIdx];
      const offsetDst = this.dstOffset[cIdx];

      for (let dIdx = this.dst.indexMax, sIdx = this.src.indexMax; dIdx >= 0; dIdx -= stepDst, sIdx -= stepSrc) {
        dst[offsetDst + dIdx] = src[offsetSrc + sIdx];
      }
    }
  }

  /**
   * @param {TypedArray | number[]} dst
   * @param {ArrayLike<number>} src
   * @param {SampleNorm} norm
   */
  mapNorm(dst, src, norm) {
    const stepDst = this.dst.indexStride;
    const stepSrc = this.src.indexStride;

    for (let cIdx = this.componentMax; cIdx >= 0; cIdx--) {
      const offsetSrc = this.srcOffset[cIdx];
      const offsetDst = this.dstOffset[cIdx];
      const normCoeff = norm.coeff[cIdx];
      const normBias = norm.bias[cIdx];

      for (let dIdx = this.dst.indexMax, sIdx = this.src.indexMax; dIdx >= 0; dIdx -= stepDst, sIdx -= stepSrc) {
        dst[offsetDst + dIdx] = (src[offsetSrc + sIdx] - normBias) * normCoeff;
      }
    }
  }

  /**
   * @param {TypedArray | number[]} dst
   * @param {ArrayLike<number>} src
   * @param {SampleNorm} scaling
   */
  mapScale(dst, src, scaling) {
    const stepDst = this.dst.indexStride;
    const stepSrc = this.src.indexStride;

    for (let cIdx = this.componentMax; cIdx >= 0; cIdx--) {
      const offsetSrc = this.srcOffset[cIdx];
      const offsetDst = this.dstOffset[cIdx];
      const scaleCoeff = scaling.coeff[cIdx];
      const scaleBias = scaling.bias[cIdx];
      const scaleMin = scaling.min[cIdx];

      for (let dIdx = this.dst.indexMax, sIdx = this.src.indexMax; dIdx >= 0; dIdx -= stepDst, sIdx -= stepSrc) {
        // prettier-ignore
        dst[offsetDst + dIdx] = ((src[offsetSrc + sIdx] - scaleBias) * scaleCoeff) + scaleMin;
      }
    }
  }

  /**
   * @param {TypedArray | number[]} dst
   * @param {ArrayLike<number>} src
   * @param {SampleNorm} norm
   * @param {SampleNorm} scaling
   */
  mapScaleNorm(dst, src, norm, scaling) {
    const srcStep = this.src.indexStride;
    const dstStep = this.dst.indexStride;

    for (let cIdx = this.componentMax; cIdx >= 0; cIdx--) {
      const srcOffset = this.srcOffset[cIdx];
      const dstOffset = this.dstOffset[cIdx];
      const normCoeff = norm.coeff[cIdx];
      const scaleCoeff = scaling.coeff[cIdx];
      const scaleBias = scaling.bias[cIdx];
      const diffMinBias = scaling.min[cIdx] - norm.bias[cIdx];

      for (let dIdx = this.dst.indexMax, sIdx = this.src.indexMax; dIdx >= 0; dIdx -= dstStep, sIdx -= srcStep) {
        // prettier-ignore
        dst[dstOffset + dIdx] = (((src[srcOffset + sIdx] - scaleBias) * scaleCoeff) + diffMinBias) * normCoeff;
      }
    }
  }

  dispose() {
    this.src.dispose();
    this.dst.dispose();
    this.src = undefined;
    this.dst = undefined;
    this.srcOffset = undefined;
    this.dstOffset = undefined;
    this.component = undefined;
  }
}
