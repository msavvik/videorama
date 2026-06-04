/**
 * @implements {IComponentNameIndex}
 */
export class ComponentNameIndex {
  /**
   * @param {string} format
   * @param {number} offset
   * @returns {IComponentNameIndex}
   */
  static create(format, offset) {
    return new ComponentNameIndex(format, offset);
  }

  /**
   * @private
   * @param {string} format
   * @param {number} offset
   */
  constructor(format, offset) {
    for (let i = 0; i < format.length; i++) {
      /** @type {IComponentNameIndex} */(this)[/** @type {SampleComponentName} */ (format[i])] ??= offset * i;
    }
  }
}

/**
 * @param {string} format
 * @param {number} offset
 */
export class ComponentOrderIndex {
  /**
   * @param {string} format
   * @param {number} offset
   * @returns
   */
  static create(format, offset) {
    /** @type {number[]} */
    const res = [];

    for (let i = 0; i < format.length; i++) {
      res.push(offset * i);
    }

    return res;
  }
}
