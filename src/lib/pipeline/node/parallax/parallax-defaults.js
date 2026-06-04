export class ParallaxDefaults {
  /** @type {Readonly<ParallaxOptions>} */
  static options = {
    maxDisplacementX: 14,
    maxDisplacementY: 14,
    xPosition: 0.5,
    yPosition: 0.5,
    xDisplacement: 0,
    yDisplacement: 0
  };

  /** @type {Readonly<KeyControlConfig>} */
  static configMaxDisplacement = { step: 1, true: 1, false: -1, min: 0, max: 255 };
}
