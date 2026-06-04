export class StereoFrameSwitchDefaults {
  /** @type {Readonly<StereoFrameSwitchOptions>} */
  static options = {
    switchDelay: 0,
    switch: true,
    toggleLrOrder: false
  };

  /** @type {Readonly<KeyControlConfig>} */
  static configSwitchDelay = { min: 0, max: Number.POSITIVE_INFINITY, step: 1, true: 1, false: -1 };
}
