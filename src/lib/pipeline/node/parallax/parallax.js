import { PixiTextureFormat } from "./pixi-texture-format";
import { SampleBuffer } from "../../../sample-buffer";
import { ParallaxDefaults } from "./parallax-defaults";
import * as PIXI from "pixi.js";

export class Parallax {
  /**
   * @param {OffscreenCanvas} viewCanvas
   * @param {SampleLayout} depthSample
   * @param {string} [tag]
   */
  static async create(viewCanvas, depthSample, tag) {
    const tagName = tag?.concat(" ", Parallax.name) ?? Parallax.name;
    console.debug(tagName, Parallax.create.name);

    const pixiApp = new PIXI.Application();
    await pixiApp.init({
      canvas: viewCanvas,
      width: viewCanvas.width,
      height: viewCanvas.width
    });

    return new Parallax(pixiApp, depthSample, tag);
  }

  /**
   * @private
   * @param {PIXI.Application} pixiApp
   * @param {SampleLayout} depthSample
   * @param {string} tag
   */
  constructor(pixiApp, depthSample, tag) {
    /** @private */
    this.tag = tag;
    console.debug(this.tag);

    /** @private */
    this.pixi = pixiApp;
    /** @private */
    this.options = { ...ParallaxDefaults.options };
    /** @private */
    this.sampleType = SampleBuffer.dataType(depthSample);

    const sampleSource = new PIXI.BufferImageSource({
      width: depthSample.width,
      height: depthSample.height,
      alphaMode: "premultiplied-alpha",
      wrapMode: "repeat",
      format: PixiTextureFormat.fromSampleLayout(depthSample)
    });

    const sampleTexture = new PIXI.Texture({
      source: sampleSource,
      dynamic: true
    });

    /** @private */
    this.sampleSprite = new PIXI.Sprite({
      width: this.pixi.canvas.width,
      height: this.pixi.canvas.height,
      texture: sampleTexture,
      dynamic: true
    });

    this.pixi.stage.addChild(this.sampleSprite);

    const frameSource = new PIXI.ImageSource({
      width: this.pixi.canvas.width,
      height: this.pixi.canvas.height,
      alphaMode: "premultiplied-alpha",
      resource: this.pixi.canvas
    });

    const frameTexture = new PIXI.Texture({
      source: frameSource,
      dynamic: true
    });

    /** @private */
    this.frameSprite = new PIXI.Sprite({
      texture: frameTexture,
      dynamic: true
    });

    /** @private */
    this.parallaxFilter = new PIXI.DisplacementFilter({ sprite: this.sampleSprite });
    this.parallaxFilter.scale.set(this.options.xDisplacement, this.options.yDisplacement);
    this.frameSprite.filters = [this.parallaxFilter];
    this.pixi.stage.addChild(this.frameSprite);
  }

  /**
   * @param {[VideoFrame, ArrayBuffer]} data
   */
  process(data) {
    // update depth
    this.sampleSprite.texture.source.resource = new this.sampleType(data[1]);
    this.sampleSprite.texture.source.update();
    this.sampleSprite.texture.update();

    // update image
    this.frameSprite.texture.source.resource = data[0];
    this.frameSprite.texture.source.update();
    this.frameSprite.texture.update();
  }

  /**
   * @param {ParallaxOptions} data
   */
  setOptions(data) {
    Object.assign(this.options, data);
    this.parallaxFilter.scale.set(this.options.xDisplacement, this.options.yDisplacement);

    console.debug(this.tag, this.setOptions.name, this.options);
  }

  dispose() {
    console.debug(this.tag, this.dispose.name);

    this.sampleSprite.destroy(true);
    this.frameSprite.destroy(true);
    this.parallaxFilter.destroy(true);
    this.pixi.destroy(false, true);

    this.sampleSprite = undefined;
    this.frameSprite = undefined;
    this.parallaxFilter = undefined;
    this.pixi = undefined;

    this.options = undefined;
    this.sampleType = undefined;
  }
}
