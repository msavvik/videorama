export class SampleMinMax {
  /**
   *
   * @param {number} min
   * @param {number} max
   * @param {number} length
   * @param {boolean} [swap]
   * @returns {SampleMinMax[]}
   */
  static arrayFrom(min, max, length, swap) {
    return Array.from({ length }).fill(new SampleMinMax(min, max, swap));
  }

  /**
   *
   * @param {SampleMinMax} minmax
   * @param {number} length
   */
  static arrayOf(minmax, length) {
    return Array.from({ length }).fill(minmax);
  }

  /**
   * @param {number} min
   * @param {number} max
   * @param {boolean} [swap]
   */
  constructor(min, max, swap) {
    if (swap) {
      [min, max] = [max, min];
    }
    this.min = min;
    this.max = max;
  }
}
