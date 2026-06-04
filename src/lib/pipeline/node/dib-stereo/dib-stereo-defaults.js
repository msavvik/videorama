export class DepthImageBasedStereoDefaults {
  /**
   * Default options values
   * @type {Readonly<DepthImageBasedStereoOptions>}
   */
  static options = {
    separation: 0.05,
    focus: 0.5,
    gamma: 1.0,
    swapLR: true
  };

  /** @type {Readonly<KeyControlConfig>} */
  static configSeparation = { min: 0.0, max: 0.2, step: 0.001, true: 1, false: -1 };
  /** @type {Readonly<KeyControlConfig>} */
  static configFocus = { min: 0.005, max: 1.0, step: 0.005, true: 1, false: -1 };
  /** @type {Readonly<KeyControlConfig>} */
  static configGamma = { min: 0.0, max: 4.0, step: 0.01, true: 1, false: -1 };
}
