/** @interface */
export class IViewMethod {
  /**
   * @protected
   * @param {string} tag
   */
  constructor(tag) {
    /** @protected @type {Readonly<string>} */
    this.tag = tag;

    console.debug(IViewMethod.name, this.tag)
  }

  /**
   * @abstract
   * @param {ArrayBuffer} sample
   */
  process(sample) {
    throw new Error("no implementation");
  }

  dispose() {}
}
