import { PipelineUpscale } from "./upscale";

export class UpscalePipeline {
  /**
   * @param {MediaInfo} media
   * @param {ModelInfo} model
   * @param {InferenceInfo} inference
   */

  static async create(media, model, inference) {
    console.debug(UpscalePipeline.name, UpscalePipeline.create.name);

    return await PipelineUpscale.create(media, model, inference);
  }
}
