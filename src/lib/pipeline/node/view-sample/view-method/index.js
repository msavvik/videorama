import { IViewMethod } from "./view-method";
import { ColourMap } from "./colour-map";
import { MinMaxSample } from "./minmax-sample";
import { MinMaxComponent } from "./minmax-component";
import { Normalise } from "./normalise";

class CreateViewMethodCallback {
  static Normalise = Normalise.create;
  static ColourMap = ColourMap.create;
  static MinMaxSample = MinMaxSample.create;
  static MinMaxComponent = MinMaxComponent.create;
}

class SampleViewMethod {
  /**
   * @param {OffscreenCanvas} canvas
   * @param {OptionsViewSample} options
   * @param {string} [tag]
   * @returns {Promise<IViewMethod>}
   */
  static async create(canvas, options, tag) {
    const tagName = tag?.concat(" ", SampleViewMethod.name) ?? SampleViewMethod.name;
    console.debug(tagName, SampleViewMethod.create.name, options.method);

    const createCb = CreateViewMethodCallback[options.method];
    if (createCb == undefined) throw new Error(`unknown view method '${options.method}'`);
    return await createCb(canvas, options, tagName);
  }
}

export { SampleViewMethod, IViewMethod };
