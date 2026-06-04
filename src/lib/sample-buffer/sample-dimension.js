export class SampleDimension {
  /**
   * @private
   * @param {SampleLayout} layout
   * @returns
   */
  static n(layout) {
    return layout.tensor?.batch ?? 1;
  }

  /**
   * @private
   * @param {SampleLayout} layout
   * @returns
   */
  static s(layout) {
    return layout.tensor?.sample ?? 1;
  }

  /**
   * @private
   * @param {SampleLayout} layout
   * @returns
   */
  static c(layout) {
    return layout.tensor?.channel ?? 1;
  }

  /**
   * @private
   * @param {SampleLayout} layout
   * @returns
   */
  static w(layout) {
    return layout.tensor?.width ?? layout.width;
  }

  /**
   * @private
   * @param {SampleLayout} layout
   * @returns
   */
  static h(layout) {
    return layout.tensor?.height ?? layout.height;
  }

  /**
   * @param {SampleLayout} layout
   * @param {SampleTensorDimentionEntry} dimension
   * @returns
   */
  static dimensionValue(layout, dimension) {
    const value = Number(dimension);
    return Number.isNaN(value) ? SampleDimension[/** @type {"n" | "s" | "c" | "h" | "w"} */ (dimension)](layout) : value;
  }

  /**
   * @param {SampleLayout} layout
   * @returns
   */
  static fromSample(layout) {
    if (layout.dimension == undefined) throw new Error("no dimension in layout");

    const sampleLayout = layout;
    return layout.dimension.map((dimEntry) => SampleDimension.dimensionValue(sampleLayout, dimEntry));
  }
}
