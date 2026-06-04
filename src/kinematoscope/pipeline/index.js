import { PipelineParallax } from "./parallax";
import { PipelineStereoSideBySide } from "./stereo-sbs";
import { PipelineStereoSwitching } from "./stereo-switching";

export class KinematoscopePipeline {
  /**
   * @param {MediaInfo} media
   * @param {ModelInfo} model
   * @param {InferenceInfo} inference
   * @param {RenderPipeline} renderPipeline
   */
  static async create(media, model, inference, renderPipeline) {
    console.debug(KinematoscopePipeline.name, KinematoscopePipeline.create.name, renderPipeline);

    switch (renderPipeline) {
      case PipelineParallax.name:
        return await PipelineParallax.create(media, model, inference);
      case PipelineStereoSideBySide.name:
        return await PipelineStereoSideBySide.create(media, model, inference);
      case PipelineStereoSwitching.name:
        return await PipelineStereoSwitching.create(media, model, inference);
      default:
        throw new Error(`Unknown render pipeline: ${renderPipeline}`);
    }
  }
}
