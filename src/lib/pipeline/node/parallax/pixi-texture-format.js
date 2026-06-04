// NOTE: Mapping is not complete. Sample layout mappings added on need to basis.

class PixelFormat {
  static r = "r";
  static rg = "rg";
  static rgba = "rgba";
  static bgra = "bgra";
}

class PixelType {
  static uint8 = "8unorm";
  static uint8c = "8unorm";
  static float32 = "32float";
  static float16 = "16float";
}

export class PixiTextureFormat {
  /**
   * @static
   * @param {SampleLayout} layout
   */
  static fromSampleLayout(layout) {
    const targetFormat = /** @type {any} */ (PixelFormat)[layout.format];
    if (targetFormat == undefined) throw new Error(`No mapping for format '${layout.format}'`);

    const targetType = /** @type {any} */ (PixelType)[layout.type];
    if (targetType == undefined) throw new Error(`No mapping for type '${layout.type}'`);

    return /** @type {import("pixi.js").TEXTURE_FORMATS} */ (targetFormat + targetType);
  }
}
