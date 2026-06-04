export class DepthMapDefaults {
  /**
   * Default options values
   * @private @type {Readonly<DepthMapOptions>}
   */
  static defaultOptions = {
    min: 0,
    max: 1
  };

  /**
   * Creates instance of {@link DepthMapOptions} with default values {@link DepthMapDefaults.defaultOptions}.
   * @returns {DepthMapOptions}
   */
  static options() {
    return { ...DepthMapDefaults.defaultOptions };
  }

  /**
   * Sets {@link options} parameter to {@link DepthMapDefaults.defaultOptions} values.
   * @param {DepthMapOptions} options
   */
  static setDefault(options) {
    return Object.assign(options, DepthMapDefaults.defaultOptions);
  }
}
