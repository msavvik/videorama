export class ConfigOptions {
  /**
   * @param {number} current
   * @param {boolean} modifier
   * @param {KeyControlConfig} config
   */
  static clipModify(current, modifier, config) {
    const next = current + config[String(modifier)] * config.step;

    if (next < config.min) {
      return config.min;
    } else if (next > config.max) {
      return config.max;
    }

    return next;
  }

  /**
   * @param {number} index
   * @param {any[]} options
   */
  static cycleIndex(index, options) {
    return ++index % options.length;
  }

  /**
   * @param {KeyControlConfig} config
   */
  static stringFrom(config) {
    return `min: ${config.min} max: ${config.max} step: ${config.step}`;
  }
}
